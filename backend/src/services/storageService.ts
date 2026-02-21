import { pool } from '../config/database';
import { SensorDataPoint } from '../types/sensor';
import { logger } from '../utils/logger';

export class StorageService {
  /**
   * Store a single sensor data point in the database
   * Implements requirement 1.2
   */
  async storeSensorData(data: SensorDataPoint): Promise<void> {
    const query = `
      INSERT INTO sensor_readings (time, asset_id, sensor_type, value, unit, quality)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const values = [
      data.timestamp,
      data.assetId,
      data.sensorType,
      data.value,
      data.unit,
      'good' // Default quality
    ];

    try {
      await pool.query(query, values);
      logger.info(`Stored sensor data for asset ${data.assetId}, type ${data.sensorType}`);
    } catch (error) {
      logger.error('Failed to store sensor data:', error);
      throw new Error(`Database storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store multiple sensor data points in a batch for better performance
   */
  async storeSensorDataBatch(dataPoints: SensorDataPoint[]): Promise<void> {
    if (dataPoints.length === 0) {
      return;
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO sensor_readings (time, asset_id, sensor_type, value, unit, quality)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      for (const data of dataPoints) {
        const values = [
          data.timestamp,
          data.assetId,
          data.sensorType,
          data.value,
          data.unit,
          'good'
        ];
        await client.query(query, values);
      }

      await client.query('COMMIT');
      logger.info(`Stored batch of ${dataPoints.length} sensor data points`);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to store sensor data batch:', error);
      throw new Error(`Batch storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  /**
   * Retrieve sensor data for an asset
   */
  async getSensorData(assetId: string, sensorType?: string, limit: number = 100): Promise<SensorDataPoint[]> {
    let query = `
      SELECT time as timestamp, asset_id as "assetId", sensor_type as "sensorType", value, unit
      FROM sensor_readings
      WHERE asset_id = $1
    `;

    const values: any[] = [assetId];

    if (sensorType) {
      query += ` AND sensor_type = $2`;
      values.push(sensorType);
      query += ` ORDER BY time DESC LIMIT $3`;
      values.push(limit);
    } else {
      query += ` ORDER BY time DESC LIMIT $2`;
      values.push(limit);
    }

    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => ({
        ...row,
        timestamp: new Date(row.timestamp)
      }));
    } catch (error) {
      logger.error('Failed to retrieve sensor data:', error);
      throw new Error(`Data retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if an asset exists in the database
   */
  async assetExists(assetId: string): Promise<boolean> {
    const query = 'SELECT id FROM assets WHERE id = $1';

    try {
      const result = await pool.query(query, [assetId]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Failed to check asset existence:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
