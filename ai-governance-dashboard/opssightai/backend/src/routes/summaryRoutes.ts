import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { ExecutiveSummaryService } from '../services/executiveSummaryService';
import { logger } from '../utils/logger';

const router = Router();
const summaryService = new ExecutiveSummaryService(pool);

// GET /api/summary/:plantId - Get executive summary for a plant
router.get('/:plantId', async (req: Request, res: Response) => {
  try {
    const { plantId } = req.params;

    // Generate fresh summary
    const summary = await summaryService.generateSummary(plantId);

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    logger.error('Error fetching executive summary:', error);
    
    if (error instanceof Error && error.message.includes('No assets found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate executive summary'
    });
  }
});

// GET /api/summary/:plantId/history - Get historical executive summaries
router.get('/:plantId/history', async (req: Request, res: Response) => {
  try {
    const { plantId } = req.params;
    const { limit = '30' } = req.query;

    const history = await summaryService.getSummaryHistory(
      plantId,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    logger.error('Error fetching executive summary history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch executive summary history'
    });
  }
});

export default router;
