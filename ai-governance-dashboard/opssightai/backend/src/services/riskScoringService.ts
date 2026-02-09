import { Pool } from 'pg';
import { logger } from '../utils/logger';

interface SensorReading {
  timestamp: Date;
  sensorType: string;
  value: number;
  unit: string;
}

interface RiskFactor {
  factor: string;
  contribution: number;
  description: string;
}

interface RiskScore {
  assetId: string;
  riskScore: number;
  timestamp: Date;
  explanation: string;
  riskFactors: RiskFactor[];
  confidence: number;
}

interface SensorStats {
  mean: number;
  std: number;
  min: number;
  max: number;
  range: number;
  trend: number;
  cv: number;
}

class RiskScoringService {
  private pool: Pool;
  private baseRiskScores: Record<string, number> = {
    transformer: 20.0,
    motor: 25.0,
    generator: 30.0,
    pump: 15.0,
    default: 20.0
  };

  private thresholds: Record<string, Record<string, number>> = {
    transformer: {
      temperature_max: 80.0,
      voltage_std: 5.0,
      current_max: 100.0
    },
    motor: {
      temperature_max: 90.0,
      vibration_std: 2.0,
      current_max: 150.0
    },
    generator: {
      temperature_max: 85.0,
      voltage_std: 3.0,
      current_max: 200.0
    },
    pump: {
      temperature_max: 75.0,
      vibration_std: 1.5,
      pressure_std: 5.0
    }
  };

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async calculateRiskScore(assetId: string, assetType: string): Promise<RiskScore> {
    try {
      // Fetch recent sensor data
      const sensorData = await this.getSensorData(assetId, 100);

      if (sensorData.length === 0) {
        // No data available, return baseline risk
        const baseRisk = this.baseRiskScores[assetType] || this.baseRiskScores.default;
        return {
          assetId,
          riskScore: baseRisk,
          timestamp: new Date(),
          explanation: `Baseline risk score for ${assetType}. No sensor data available yet.`,
          riskFactors: [],
          confidence: 0.3
        };
      }

      // Extract features
      const features = this.extractStatisticalFeatures(sensorData);

      // Calculate risk factors
      const riskFactors = this.calculateRiskFactors(features, assetType);

      // Calculate overall risk score
      const baseRisk = this.baseRiskScores[assetType] || this.baseRiskScores.default;
      const totalContribution = riskFactors.reduce((sum, rf) => sum + rf.contribution, 0);
      const riskScore = Math.min(baseRisk + totalContribution, 100.0);

      // Generate explanation
      const explanation = this.generateExplanation(riskScore, riskFactors, assetType);

      // Calculate confidence based on data availability
      const confidence = Math.min(sensorData.length / 100.0, 1.0);

      const result: RiskScore = {
        assetId,
        riskScore: Math.round(riskScore * 10) / 10,
        timestamp: new Date(),
        explanation,
        riskFactors,
        confidence: Math.round(confidence * 100) / 100
      };

      // Store risk score in database
      await this.storeRiskScore(result);

      return result;
    } catch (error) {
      logger.error(`Error calculating risk score for asset ${assetId}:`, error);
      throw error;
    }
  }

  private async getSensorData(assetId: string, limit: number): Promise<SensorReading[]> {
    const result = await this.pool.query(
      `SELECT time as timestamp, sensor_type as "sensorType", value, unit
       FROM sensor_readings
       WHERE asset_id = $1
       ORDER BY time DESC
       LIMIT $2`,
      [assetId, limit]
    );
    return result.rows;
  }

  private extractStatisticalFeatures(sensorData: SensorReading[]): Record<string, SensorStats> {
    const features: Record<string, SensorStats> = {};

    // Group by sensor type
    const groupedData: Record<string, number[]> = {};
    sensorData.forEach(reading => {
      if (!groupedData[reading.sensorType]) {
        groupedData[reading.sensorType] = [];
      }
      groupedData[reading.sensorType].push(reading.value);
    });

    // Calculate statistics for each sensor type
    Object.entries(groupedData).forEach(([sensorType, values]) => {
      if (values.length > 0) {
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;

        // Calculate trend (simple linear regression slope)
        let trend = 0;
        if (values.length > 1) {
          const n = values.length;
          const sumX = (n * (n - 1)) / 2;
          const sumY = values.reduce((sum, v) => sum + v, 0);
          const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
          const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
          trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        }

        // Calculate coefficient of variation
        const cv = mean !== 0 ? std / mean : 0;

        features[sensorType] = { mean, std, min, max, range, trend, cv };
      }
    });

    return features;
  }

  private calculateRiskFactors(features: Record<string, SensorStats>, assetType: string): RiskFactor[] {
    const riskFactors: RiskFactor[] = [];
    const assetThresholds = this.thresholds[assetType] || this.thresholds.transformer;

    // Check temperature
    if (features.temperature) {
      const tempMax = features.temperature.max;
      const threshold = assetThresholds.temperature_max || 80.0;
      if (tempMax > threshold) {
        const contribution = Math.min(((tempMax - threshold) / threshold) * 100, 40.0);
        riskFactors.push({
          factor: 'High Temperature',
          contribution: Math.round(contribution * 10) / 10,
          description: `Maximum temperature (${tempMax.toFixed(1)}°C) exceeds safe threshold (${threshold}°C)`
        });
      }
    }

    // Check voltage variability
    if (features.voltage) {
      const voltageStd = features.voltage.std;
      const threshold = assetThresholds.voltage_std || 5.0;
      if (voltageStd > threshold) {
        const contribution = Math.min(((voltageStd - threshold) / threshold) * 100, 30.0);
        riskFactors.push({
          factor: 'Voltage Instability',
          contribution: Math.round(contribution * 10) / 10,
          description: `Voltage variability (${voltageStd.toFixed(2)}V) indicates unstable power supply`
        });
      }
    }

    // Check vibration
    if (features.vibration) {
      const vibrationStd = features.vibration.std;
      const threshold = assetThresholds.vibration_std || 2.0;
      if (vibrationStd > threshold) {
        const contribution = Math.min(((vibrationStd - threshold) / threshold) * 100, 35.0);
        riskFactors.push({
          factor: 'Excessive Vibration',
          contribution: Math.round(contribution * 10) / 10,
          description: `Vibration variability (${vibrationStd.toFixed(2)}) suggests mechanical issues`
        });
      }
    }

    // Check current overload
    if (features.current) {
      const currentMax = features.current.max;
      const threshold = assetThresholds.current_max || 100.0;
      if (currentMax > threshold) {
        const contribution = Math.min(((currentMax - threshold) / threshold) * 100, 30.0);
        riskFactors.push({
          factor: 'Current Overload',
          contribution: Math.round(contribution * 10) / 10,
          description: `Peak current (${currentMax.toFixed(1)}A) exceeds rated capacity (${threshold}A)`
        });
      }
    }

    // Check pressure variability (for pumps)
    if (features.pressure) {
      const pressureStd = features.pressure.std;
      const threshold = assetThresholds.pressure_std || 5.0;
      if (pressureStd > threshold) {
        const contribution = Math.min(((pressureStd - threshold) / threshold) * 100, 25.0);
        riskFactors.push({
          factor: 'Pressure Instability',
          contribution: Math.round(contribution * 10) / 10,
          description: `Pressure variability (${pressureStd.toFixed(2)}) indicates flow issues`
        });
      }
    }

    return riskFactors;
  }

  private generateExplanation(riskScore: number, riskFactors: RiskFactor[], assetType: string): string {
    let riskLevel: string;
    let summary: string;

    if (riskScore < 30) {
      riskLevel = 'LOW';
      summary = `The ${assetType} is operating within normal parameters.`;
    } else if (riskScore < 60) {
      riskLevel = 'MEDIUM';
      summary = `The ${assetType} shows some concerning indicators that warrant monitoring.`;
    } else if (riskScore < 80) {
      riskLevel = 'HIGH';
      summary = `The ${assetType} exhibits significant risk factors requiring attention.`;
    } else {
      riskLevel = 'CRITICAL';
      summary = `The ${assetType} is at critical risk and requires immediate intervention.`;
    }

    let explanation = `Risk Level: ${riskLevel} (${riskScore.toFixed(1)}/100). ${summary}`;

    if (riskFactors.length > 0) {
      explanation += '\n\nKey Risk Factors:';
      const topFactors = riskFactors
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 3);
      topFactors.forEach(rf => {
        explanation += `\n- ${rf.factor} (+${rf.contribution.toFixed(1)} points): ${rf.description}`;
      });
    } else {
      explanation += ' All monitored parameters are within acceptable ranges.';
    }

    return explanation;
  }

  private async storeRiskScore(riskScore: RiskScore): Promise<void> {
    await this.pool.query(
      `INSERT INTO risk_scores (time, asset_id, score, explanation, factors, confidence, model_version)
       VALUES (NOW(), $1, $2, $3, $4, $5, $6)`,
      [
        riskScore.assetId,
        riskScore.riskScore,
        riskScore.explanation,
        JSON.stringify(riskScore.riskFactors),
        riskScore.confidence,
        '1.0.0'
      ]
    );

    // Update current risk score on asset
    await this.pool.query(
      `UPDATE assets
       SET current_risk_score = $1, updated_at = NOW()
       WHERE id = $2`,
      [riskScore.riskScore, riskScore.assetId]
    );

    logger.info(`Stored risk score ${riskScore.riskScore} for asset ${riskScore.assetId}`);
  }

  async getPreviousRiskScore(assetId: string): Promise<number | null> {
    const result = await this.pool.query(
      `SELECT score
       FROM risk_scores
       WHERE asset_id = $1
       ORDER BY time DESC
       LIMIT 1 OFFSET 1`,
      [assetId]
    );
    return result.rows.length > 0 ? result.rows[0].score : null;
  }
}

export { RiskScoringService, RiskScore, RiskFactor };
