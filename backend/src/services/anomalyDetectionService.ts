import { Pool } from 'pg';
import { logger } from '../utils/logger';

interface SensorReading {
  timestamp: Date;
  sensorType: string;
  value: number;
  unit: string;
}

interface Anomaly {
  id?: string;
  assetId: string;
  timestamp: Date;
  detectedAt: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  description: string;
  status: string;
}

interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  totalChecked: number;
  anomaliesDetected: number;
}

class AnomalyDetectionService {
  private pool: Pool;

  // Z-score threshold for anomaly detection
  private readonly Z_SCORE_THRESHOLD = 2.5;

  // IQR multiplier for outlier detection
  private readonly IQR_MULTIPLIER = 1.5;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async detectAnomalies(assetId: string, assetType: string): Promise<AnomalyDetectionResult> {
    try {
      // Fetch recent sensor data (last 100 readings)
      const sensorData = await this.getSensorData(assetId, 100);

      if (sensorData.length < 10) {
        logger.info(`Insufficient data for anomaly detection on asset ${assetId}`);
        return {
          anomalies: [],
          totalChecked: 0,
          anomaliesDetected: 0
        };
      }

      const anomalies: Anomaly[] = [];

      // Group data by sensor type
      const groupedData = this.groupBySensorType(sensorData);

      // Detect anomalies for each sensor type
      for (const [sensorType, readings] of Object.entries(groupedData)) {
        if (readings.length < 5) continue;

        const sensorAnomalies = this.detectSensorAnomalies(
          assetId,
          sensorType,
          readings,
          assetType
        );
        anomalies.push(...sensorAnomalies);
      }

      // Store detected anomalies
      for (const anomaly of anomalies) {
        await this.storeAnomaly(anomaly);
      }

      logger.info(`Detected ${anomalies.length} anomalies for asset ${assetId}`);

      return {
        anomalies,
        totalChecked: sensorData.length,
        anomaliesDetected: anomalies.length
      };
    } catch (error) {
      logger.error(`Error detecting anomalies for asset ${assetId}:`, error);
      throw error;
    }
  }

  private async getSensorData(assetId: string, limit: number): Promise<SensorReading[]> {
    const result = await this.pool.query(
      `SELECT time as timestamp, sensor_type as "sensorType", value::float as value, unit
       FROM sensor_readings
       WHERE asset_id = $1
       ORDER BY time DESC
       LIMIT $2`,
      [assetId, limit]
    );
    return result.rows;
  }

  private groupBySensorType(sensorData: SensorReading[]): Record<string, SensorReading[]> {
    const grouped: Record<string, SensorReading[]> = {};
    sensorData.forEach(reading => {
      if (!grouped[reading.sensorType]) {
        grouped[reading.sensorType] = [];
      }
      grouped[reading.sensorType].push(reading);
    });
    return grouped;
  }

  private detectSensorAnomalies(
    assetId: string,
    sensorType: string,
    readings: SensorReading[],
    assetType: string
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const values = readings.map(r => r.value);

    // Calculate statistics
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Calculate IQR for outlier detection
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - this.IQR_MULTIPLIER * iqr;
    const upperBound = q3 + this.IQR_MULTIPLIER * iqr;

    // Check most recent reading for anomalies
    const latestReading = readings[0];
    const latestValue = latestReading.value;

    // Z-score method
    const zScore = stdDev > 0 ? Math.abs((latestValue - mean) / stdDev) : 0;

    // IQR method
    const isOutlier = latestValue < lowerBound || latestValue > upperBound;

    if (zScore > this.Z_SCORE_THRESHOLD || isOutlier) {
      const deviation = ((latestValue - mean) / mean) * 100;
      const severity = this.classifySeverity(Math.abs(deviation), sensorType, assetType);

      anomalies.push({
        assetId,
        timestamp: latestReading.timestamp,
        detectedAt: new Date(),
        severity,
        metric: sensorType,
        expectedValue: mean,
        actualValue: latestValue,
        deviation: Math.abs(deviation),
        description: this.generateAnomalyDescription(
          sensorType,
          latestValue,
          mean,
          deviation,
          latestReading.unit
        ),
        status: 'open'
      });
    }

    return anomalies;
  }

  private classifySeverity(
    deviationPercent: number,
    sensorType: string,
    assetType: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Critical thresholds by sensor type
    const criticalThresholds: Record<string, number> = {
      temperature: 20,
      vibration: 50,
      voltage: 15,
      current: 25,
      pressure: 30
    };

    const criticalThreshold = criticalThresholds[sensorType] || 25;

    if (deviationPercent >= criticalThreshold * 1.5) {
      return 'critical';
    } else if (deviationPercent >= criticalThreshold) {
      return 'high';
    } else if (deviationPercent >= criticalThreshold * 0.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private generateAnomalyDescription(
    sensorType: string,
    actualValue: number,
    expectedValue: number,
    deviationPercent: number,
    unit: string
  ): string {
    const direction = actualValue > expectedValue ? 'above' : 'below';
    const absDeviation = Math.abs(deviationPercent);

    return `${sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} reading of ${actualValue.toFixed(2)}${unit} is ${absDeviation.toFixed(1)}% ${direction} expected value of ${expectedValue.toFixed(2)}${unit}`;
  }

  private async storeAnomaly(anomaly: Anomaly): Promise<void> {
    await this.pool.query(
      `INSERT INTO anomalies (asset_id, timestamp, detected_at, severity, metric, expected_value, actual_value, deviation, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        anomaly.assetId,
        anomaly.timestamp,
        anomaly.detectedAt,
        anomaly.severity,
        anomaly.metric,
        anomaly.expectedValue,
        anomaly.actualValue,
        anomaly.deviation,
        anomaly.description,
        anomaly.status
      ]
    );
  }

  async getAnomaliesByAsset(
    assetId: string,
    options: {
      startDate?: string;
      endDate?: string;
      severity?: string;
      limit?: number;
    } = {}
  ): Promise<Anomaly[]> {
    let query = `
      SELECT id, asset_id as "assetId", timestamp, detected_at as "detectedAt", 
             severity, metric, expected_value as "expectedValue", 
             actual_value as "actualValue", deviation, description, status
      FROM anomalies
      WHERE asset_id = $1
    `;
    const params: any[] = [assetId];

    if (options.startDate) {
      params.push(options.startDate);
      query += ` AND timestamp >= $${params.length}`;
    }

    if (options.endDate) {
      params.push(options.endDate);
      query += ` AND timestamp <= $${params.length}`;
    }

    if (options.severity) {
      params.push(options.severity);
      query += ` AND severity = $${params.length}`;
    }

    query += ` ORDER BY timestamp DESC`;

    if (options.limit) {
      params.push(options.limit);
      query += ` LIMIT $${params.length}`;
    }

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getCriticalAnomalies(limit: number = 50): Promise<Anomaly[]> {
    const result = await this.pool.query(
      `SELECT id, asset_id as "assetId", timestamp, detected_at as "detectedAt", 
              severity, metric, expected_value as "expectedValue", 
              actual_value as "actualValue", deviation, description, status
       FROM anomalies
       WHERE severity = 'critical' AND status = 'open'
       ORDER BY timestamp DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

export { AnomalyDetectionService, Anomaly, AnomalyDetectionResult };
