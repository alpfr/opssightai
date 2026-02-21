import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { ForecastingService } from '../services/forecastingService';
import { logger } from '../utils/logger';

const router = Router();
const forecastingService = new ForecastingService(pool);

// GET /api/forecast/:assetId - Get forecast for an asset
router.get('/:assetId', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;

    // Check if valid forecast exists
    let forecast = await forecastingService.getForecast(assetId);

    if (!forecast) {
      // No valid forecast, generate new one
      const assetResult = await pool.query(
        'SELECT type FROM assets WHERE id = $1',
        [assetId]
      );

      if (assetResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found'
        });
      }

      const assetType = assetResult.rows[0].type;
      const result = await forecastingService.generateForecast(assetId, assetType);

      if (!result.success) {
        return res.status(400).json(result);
      }

      forecast = result.forecast!;
    }

    res.json({
      success: true,
      forecast
    });
  } catch (error) {
    logger.error('Error fetching forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forecast'
    });
  }
});

// POST /api/forecast/:assetId/refresh - Regenerate forecast
router.post('/:assetId/refresh', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;

    // Verify asset exists
    const assetResult = await pool.query(
      'SELECT type FROM assets WHERE id = $1',
      [assetId]
    );

    if (assetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    const assetType = assetResult.rows[0].type;

    // Generate new forecast
    const result = await forecastingService.generateForecast(assetId, assetType);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Check for high risk predictions
    const hasHighRisk = await forecastingService.checkHighRiskForecast(result.forecast!);
    if (hasHighRisk) {
      logger.warn(`High risk forecast generated for asset ${assetId}`);
      // TODO: Trigger notification
    }

    logger.info(`Forecast refreshed for asset ${assetId}`);

    res.json(result);
  } catch (error) {
    logger.error('Error refreshing forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh forecast'
    });
  }
});

export default router;
