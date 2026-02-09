import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { RiskScoringService } from '../services/riskScoringService';
import { logger } from '../utils/logger';

const router = Router();
const riskScoringService = new RiskScoringService(pool);

// POST /api/risk/calculate - Calculate risk score for an asset
router.post('/calculate', async (req: Request, res: Response) => {
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

    // Calculate risk score
    const riskScore = await riskScoringService.calculateRiskScore(assetId, assetType);

    // Check for significant risk change
    const previousScore = await riskScoringService.getPreviousRiskScore(assetId);
    if (previousScore !== null) {
      const delta = Math.abs(riskScore.riskScore - previousScore);
      if (delta > 20) {
        logger.warn(`Significant risk change detected for asset ${assetId}: ${previousScore} -> ${riskScore.riskScore} (Δ${delta.toFixed(1)})`);
        // TODO: Trigger notification
      }
    }

    logger.info(`Calculated risk score for asset ${assetId}: ${riskScore.riskScore}`);

    res.json({
      success: true,
      riskScore
    });
  } catch (error) {
    logger.error('Error calculating risk score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate risk score'
    });
  }
});

// GET /api/risk/:assetId - Get current risk score for an asset
router.get('/:assetId', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;

    const result = await pool.query(
      `SELECT time, asset_id as "assetId", score as "riskScore", explanation, factors as "riskFactors", confidence
       FROM risk_scores
       WHERE asset_id = $1
       ORDER BY time DESC
       LIMIT 1`,
      [assetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No risk score found for this asset'
      });
    }

    res.json({
      success: true,
      riskScore: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching risk score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch risk score'
    });
  }
});

// GET /api/risk/:assetId/history - Get risk score history for an asset
router.get('/:assetId/history', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { startDate, endDate, limit = '30' } = req.query;

    let query = `
      SELECT time, asset_id as "assetId", score as "riskScore", explanation, factors as "riskFactors", confidence
      FROM risk_scores
      WHERE asset_id = $1
    `;
    const params: any[] = [assetId];

    if (startDate) {
      params.push(startDate);
      query += ` AND time >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND time <= $${params.length}`;
    }

    query += ` ORDER BY time DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit as string));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      history: result.rows
    });
  } catch (error) {
    logger.error('Error fetching risk score history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch risk score history'
    });
  }
});

export default router;
