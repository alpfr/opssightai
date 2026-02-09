import { Router, Request, Response } from 'express';
import { validationService } from '../services/validationService';
import { storageService } from '../services/storageService';
import { SensorDataPoint } from '../types/sensor';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/data
 * Ingest sensor data from industrial assets
 * Implements requirements 1.1, 1.2, 1.3, 1.4
 */
router.post('/data', async (req: Request, res: Response) => {
  try {
    const { assetId, timestamp, sensorType, value, unit } = req.body;

    // Create sensor data point
    const sensorData: SensorDataPoint = {
      assetId,
      timestamp: new Date(timestamp),
      sensorType,
      value: parseFloat(value),
      unit
    };

    // Validate sensor data
    const validationResult = validationService.validateSensorData(sensorData);

    if (!validationResult.isValid) {
      logger.warn(`Validation failed for asset ${assetId}:`, validationResult.errors);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.errors
      });
    }

    // Check if asset exists
    const assetExists = await storageService.assetExists(assetId);
    if (!assetExists) {
      logger.warn(`Asset not found: ${assetId}`);
      return res.status(404).json({
        error: 'Asset not found',
        details: [`Asset with ID ${assetId} does not exist in the system`]
      });
    }

    // Store sensor data
    await storageService.storeSensorData(sensorData);

    // TODO: Trigger async processing for risk calculation and anomaly detection (Task 2.5)

    logger.info(`Successfully ingested data for asset ${assetId}, sensor ${sensorType}`);

    res.status(201).json({
      message: 'Sensor data ingested successfully',
      data: {
        assetId: sensorData.assetId,
        timestamp: sensorData.timestamp,
        sensorType: sensorData.sensorType,
        value: sensorData.value,
        unit: sensorData.unit
      }
    });
  } catch (error) {
    logger.error('Error ingesting sensor data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/data/:assetId
 * Retrieve sensor data for an asset
 */
router.get('/data/:assetId', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { sensorType, limit } = req.query;

    const data = await storageService.getSensorData(
      assetId,
      sensorType as string | undefined,
      limit ? parseInt(limit as string) : 100
    );

    res.json({
      assetId,
      count: data.length,
      data
    });
  } catch (error) {
    logger.error('Error retrieving sensor data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
