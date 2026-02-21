import { Pool } from 'pg';
import { logger } from '../utils/logger';

interface ForecastPoint {
  date: Date;
  predictedRiskScore: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

interface Forecast {
  assetId: string;
  generatedAt: Date;
  validUntil: Date;
  forecastHorizon: number; // days
  predictions: ForecastPoint[];
  modelVersion: string;
  accuracy?: number;
}

interface ForecastResult {
  success: boolean;
  forecast?: Forecast;
  error?: string;
}

class ForecastingService {
  private pool: Pool;
  private readonly MINIMUM_DATA_DAYS = 30;
  private readonly FORECAST_HORIZON_DAYS = 30;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async generateForecast(assetId: string, assetType: string): Promise<ForecastResult> {
    try {
      // Check if we have sufficient historical data
      const hasEnoughData = await this.checkDataAvailability(assetId);
      
      if (!hasEnoughData) {
        return {
          success: false,
          error: `Insufficient historical data. Minimum ${this.MINIMUM_DATA_DAYS} days of data required.`
        };
      }

      // Fetch historical risk scores
      const historicalScores = await this.getHistoricalRiskScores(assetId);

      if (historicalScores.length < 10) {
        return {
          success: false,
          error: 'Insufficient risk score history for forecasting.'
        };
      }

      // Generate forecast using simple trend analysis
      const predictions = this.generatePredictions(historicalScores);

      const forecast: Forecast = {
        assetId,
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
        forecastHorizon: this.FORECAST_HORIZON_DAYS,
        predictions,
        modelVersion: '1.0.0-simple-trend',
        accuracy: this.calculateAccuracy(historicalScores)
      };

      // Store forecast in database
      await this.storeForecast(forecast);

      logger.info(`Generated forecast for asset ${assetId} with ${predictions.length} predictions`);

      return {
        success: true,
        forecast
      };
    } catch (error) {
      logger.error(`Error generating forecast for asset ${assetId}:`, error);
      return {
        success: false,
        error: 'Failed to generate forecast'
      };
    }
  }

  private async checkDataAvailability(assetId: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT MIN(time) as earliest_reading
       FROM sensor_readings
       WHERE asset_id = $1`,
      [assetId]
    );

    if (!result.rows[0].earliest_reading) {
      return false;
    }

    const earliestDate = new Date(result.rows[0].earliest_reading);
    const daysSinceEarliest = (Date.now() - earliestDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceEarliest >= this.MINIMUM_DATA_DAYS;
  }

  private async getHistoricalRiskScores(assetId: string): Promise<Array<{ time: Date; score: number }>> {
    const result = await this.pool.query(
      `SELECT time, score::float
       FROM risk_scores
       WHERE asset_id = $1
       ORDER BY time DESC
       LIMIT 100`,
      [assetId]
    );

    return result.rows.map(row => ({
      time: new Date(row.time),
      score: row.score
    }));
  }

  private generatePredictions(historicalScores: Array<{ time: Date; score: number }>): ForecastPoint[] {
    const predictions: ForecastPoint[] = [];
    
    // Calculate trend using linear regression
    const scores = historicalScores.map(h => h.score);
    const n = scores.length;
    
    // Simple moving average and trend
    const recentScores = scores.slice(0, Math.min(10, n));
    const avgScore = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;
    
    // Calculate trend (slope)
    let trend = 0;
    if (n >= 2) {
      const x = Array.from({ length: n }, (_, i) => i);
      const y = scores;
      const sumX = x.reduce((sum, val) => sum + val, 0);
      const sumY = y.reduce((sum, val) => sum + val, 0);
      const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
      const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
      trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }

    // Calculate standard deviation for confidence intervals
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Generate predictions for next 30 days
    const now = new Date();
    for (let day = 1; day <= this.FORECAST_HORIZON_DAYS; day++) {
      const forecastDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      
      // Predicted score = current average + trend * days
      let predictedScore = avgScore + (trend * day);
      
      // Add some dampening to prevent unrealistic predictions
      predictedScore = Math.max(0, Math.min(100, predictedScore));
      
      // Confidence decreases with forecast horizon
      const confidence = Math.max(0.3, 1 - (day / this.FORECAST_HORIZON_DAYS) * 0.7);
      
      // Confidence intervals widen with time
      const intervalWidth = stdDev * (1 + day / 10);
      const lowerBound = Math.max(0, predictedScore - intervalWidth);
      const upperBound = Math.min(100, predictedScore + intervalWidth);

      predictions.push({
        date: forecastDate,
        predictedRiskScore: Math.round(predictedScore * 10) / 10,
        lowerBound: Math.round(lowerBound * 10) / 10,
        upperBound: Math.round(upperBound * 10) / 10,
        confidence: Math.round(confidence * 100) / 100
      });
    }

    return predictions;
  }

  private calculateAccuracy(historicalScores: Array<{ time: Date; score: number }>): number {
    // Simple accuracy metric based on data consistency
    if (historicalScores.length < 2) return 0.5;
    
    const scores = historicalScores.map(h => h.score);
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    
    // Lower CV = higher accuracy
    const accuracy = Math.max(0.3, Math.min(0.95, 1 - coefficientOfVariation));
    return Math.round(accuracy * 100) / 100;
  }

  private async storeForecast(forecast: Forecast): Promise<void> {
    await this.pool.query(
      `INSERT INTO forecasts (asset_id, generated_at, valid_until, predictions, model_version, accuracy)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        forecast.assetId,
        forecast.generatedAt,
        forecast.validUntil,
        JSON.stringify(forecast.predictions),
        forecast.modelVersion,
        forecast.accuracy
      ]
    );
  }

  async getForecast(assetId: string): Promise<Forecast | null> {
    const result = await this.pool.query(
      `SELECT id, asset_id as "assetId", generated_at as "generatedAt", 
              valid_until as "validUntil", predictions, model_version as "modelVersion", accuracy
       FROM forecasts
       WHERE asset_id = $1 AND valid_until > NOW()
       ORDER BY generated_at DESC
       LIMIT 1`,
      [assetId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      assetId: row.assetId,
      generatedAt: new Date(row.generatedAt),
      validUntil: new Date(row.validUntil),
      forecastHorizon: this.FORECAST_HORIZON_DAYS,
      predictions: row.predictions,
      modelVersion: row.modelVersion,
      accuracy: row.accuracy
    };
  }

  async checkHighRiskForecast(forecast: Forecast): Promise<boolean> {
    // Check if any prediction in next 7 days exceeds 70
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    const highRiskPredictions = forecast.predictions.filter(p => {
      const predictionDate = new Date(p.date);
      return predictionDate <= sevenDaysFromNow && p.predictedRiskScore > 70;
    });

    if (highRiskPredictions.length > 0) {
      logger.warn(`High risk forecast detected for asset ${forecast.assetId}: ${highRiskPredictions.length} predictions > 70 in next 7 days`);
      return true;
    }

    return false;
  }
}

export { ForecastingService, Forecast, ForecastPoint, ForecastResult };
