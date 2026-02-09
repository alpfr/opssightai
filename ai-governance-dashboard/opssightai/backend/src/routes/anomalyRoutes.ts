import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { AnomalyDetectionService } from '../services/anomalyDetectionService';
import { logger } from '../utils/logger';

const router = Router();
const anomalyDetectionService = new AnomalyDetectionService(pool);

// POST /api/anomalies/detect - Detect anomalies for an asset
router.post('/detect', async (req: Request, res: Response) => {
  try {
    const { assetId, assetType } = req.body;

    if (!assetId || !assetType) {
      return res.status(400).json({
        success: false,
        error: 'assetId and assetType are required'
      });
    }

    // Verify asset exists
    const assetResult = await pool.query(
      'SELECT id, name, type FROM assets WHERE id = $1',
      [assetId]
    );

    if (assetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Asset ${assetId} not found`
      });
    }

    // Detect anomalies
    const result = await anomalyDetectionService.detectAnomalies(assetId, assetType);

    // Check for critical anomalies and log
    const criticalAnomalies = result.anomalies.filter(a => a.severity === 'critical');
    if (criticalAnomalies.length > 0) {
      logger.warn(`Critical anomalies detected for asset ${assetId}: ${criticalAnomalies.length} anomalies`);
      // TODO: Trigger notification
    }

    logger.info(`Anomaly detection completed for asset ${assetId}: ${result.anomaliesDetected} anomalies found`);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    logger.error('Error detecting anomalies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect anomalies'
    });
  }
});

// GET /api/anomalies/:assetId - Get anomalies for an asset
router.get('/:assetId', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { startDate, endDate, severity, limit = '50' } = req.query;

    const anomalies = await anomalyDetectionService.getAnomaliesByAsset(assetId, {
      startDate: startDate as string,
      endDate: endDate as string,
      severity: severity as string,
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      count: anomalies.length,
      anomalies
    });
  } catch (error) {
    logger.error('Error fetching anomalies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch anomalies'
    });
  }
});

// GET /api/anomalies/critical/all - Get all critical anomalies
router.get('/critical/all', async (req: Request, res: Response) => {
  try {
    const { limit = '50' } = req.query;

    const anomalies = await anomalyDetectionService.getCriticalAnomalies(
      parseInt(limit as string)
    );

    res.json({
      success: true,
      count: anomalies.length,
      anomalies
    });
  } catch (error) {
    logger.error('Error fetching critical anomalies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch critical anomalies'
    });
  }
});

export default router;
