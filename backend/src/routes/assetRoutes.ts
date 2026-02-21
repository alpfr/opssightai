import { Router, Request, Response } from 'express';
import { assetService } from '../services/assetService';
import { assetValidationService } from '../services/assetValidationService';
import { Asset } from '../types/asset';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/assets
 * Create a new asset
 * Implements requirement 8.1, 8.2, 8.5
 */
router.post('/assets', async (req: Request, res: Response) => {
  try {
    const assetData: Asset = req.body;

    // Validate asset data
    const validationResult = assetValidationService.validateAsset(assetData);
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.errors
      });
    }

    // Check name uniqueness
    const isUnique = await assetService.isAssetNameUnique(assetData.name);
    if (!isUnique) {
      return res.status(409).json({
        error: 'Asset name must be unique',
        details: [`An asset with name "${assetData.name}" already exists`]
      });
    }

    // Create asset
    const asset = await assetService.createAsset(assetData);

    res.status(201).json({
      message: 'Asset created successfully',
      asset
    });
  } catch (error) {
    logger.error('Error creating asset:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/assets
 * Get all assets
 * Implements requirement 8.1
 */
router.get('/assets', async (req: Request, res: Response) => {
  try {
    const includeDecommissioned = req.query.includeDecommissioned === 'true';
    const assets = await assetService.getAllAssets(includeDecommissioned);

    res.json({
      count: assets.length,
      assets
    });
  } catch (error) {
    logger.error('Error getting assets:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/assets/:id
 * Get asset by ID
 * Implements requirement 8.3
 */
router.get('/assets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await assetService.getAssetById(id);

    if (!asset) {
      return res.status(404).json({
        error: 'Asset not found',
        details: [`Asset with ID ${id} does not exist`]
      });
    }

    res.json({ asset });
  } catch (error) {
    logger.error('Error getting asset:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/assets/:id
 * Update asset
 * Implements requirement 8.1
 */
router.put('/assets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Asset> = req.body;

    // If name is being updated, check uniqueness
    if (updates.name) {
      const isUnique = await assetService.isAssetNameUnique(updates.name, id);
      if (!isUnique) {
        return res.status(409).json({
          error: 'Asset name must be unique',
          details: [`An asset with name "${updates.name}" already exists`]
        });
      }
    }

    const asset = await assetService.updateAsset(id, updates);

    if (!asset) {
      return res.status(404).json({
        error: 'Asset not found',
        details: [`Asset with ID ${id} does not exist`]
      });
    }

    res.json({
      message: 'Asset updated successfully',
      asset
    });
  } catch (error) {
    logger.error('Error updating asset:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/assets/:id
 * Delete asset (soft delete)
 * Implements requirement 8.4
 */
router.delete('/assets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await assetService.deleteAsset(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Asset not found',
        details: [`Asset with ID ${id} does not exist`]
      });
    }

    res.json({
      message: 'Asset decommissioned successfully',
      id
    });
  } catch (error) {
    logger.error('Error deleting asset:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
