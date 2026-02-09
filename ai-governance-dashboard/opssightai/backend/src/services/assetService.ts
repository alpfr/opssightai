import { pool } from '../config/database';
import { Asset } from '../types/asset';
import { logger } from '../utils/logger';

export class AssetService {
  /**
   * Create a new asset
   * Implements requirement 8.1
   */
  async createAsset(asset: Asset): Promise<Asset> {
    const query = `
      INSERT INTO assets (name, type, plant_id, location, metadata, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, type, plant_id as "plantId", location, metadata, status, 
                current_risk_score as "currentRiskScore", created_at as "createdAt", 
                updated_at as "updatedAt"
    `;

    const values = [
      asset.name,
      asset.type,
      asset.location.plantId,
      JSON.stringify(asset.location),
      JSON.stringify(asset.metadata),
      asset.status || 'active'
    ];

    try {
      const result = await pool.query(query, values);
      logger.info(`Created asset: ${asset.name} (${result.rows[0].id})`);
      return this.mapDatabaseRowToAsset(result.rows[0]);
    } catch (error) {
      logger.error('Failed to create asset:', error);
      throw new Error(`Asset creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all assets
   * Implements requirement 8.1
   */
  async getAllAssets(includeDecommissioned: boolean = false): Promise<Asset[]> {
    let query = `
      SELECT id, name, type, plant_id as "plantId", location, metadata, status,
             current_risk_score as "currentRiskScore", created_at as "createdAt",
             updated_at as "updatedAt"
      FROM assets
    `;

    if (!includeDecommissioned) {
      query += ` WHERE status != 'decommissioned'`;
    }

    query += ` ORDER BY name`;

    try {
      const result = await pool.query(query);
      return result.rows.map(row => this.mapDatabaseRowToAsset(row));
    } catch (error) {
      logger.error('Failed to get assets:', error);
      throw new Error(`Failed to retrieve assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get asset by ID
   * Implements requirement 8.3
   */
  async getAssetById(id: string): Promise<Asset | null> {
    const query = `
      SELECT id, name, type, plant_id as "plantId", location, metadata, status,
             current_risk_score as "currentRiskScore", created_at as "createdAt",
             updated_at as "updatedAt"
      FROM assets
      WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapDatabaseRowToAsset(result.rows[0]);
    } catch (error) {
      logger.error('Failed to get asset by ID:', error);
      throw new Error(`Failed to retrieve asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update asset
   * Implements requirement 8.1
   */
  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset | null> {
    const asset = await this.getAssetById(id);
    if (!asset) {
      return null;
    }

    const query = `
      UPDATE assets
      SET name = $1, type = $2, plant_id = $3, location = $4, metadata = $5, 
          status = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING id, name, type, plant_id as "plantId", location, metadata, status,
                current_risk_score as "currentRiskScore", created_at as "createdAt",
                updated_at as "updatedAt"
    `;

    const values = [
      updates.name || asset.name,
      updates.type || asset.type,
      updates.location?.plantId || asset.location.plantId,
      JSON.stringify(updates.location || asset.location),
      JSON.stringify(updates.metadata || asset.metadata),
      updates.status || asset.status,
      id
    ];

    try {
      const result = await pool.query(query, values);
      logger.info(`Updated asset: ${id}`);
      return this.mapDatabaseRowToAsset(result.rows[0]);
    } catch (error) {
      logger.error('Failed to update asset:', error);
      throw new Error(`Asset update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete asset (soft delete - set status to decommissioned)
   * Implements requirement 8.4
   */
  async deleteAsset(id: string): Promise<boolean> {
    const query = `
      UPDATE assets
      SET status = 'decommissioned', updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return false;
      }
      logger.info(`Decommissioned asset: ${id}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete asset:', error);
      throw new Error(`Asset deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if asset name is unique
   * Implements requirement 8.5
   */
  async isAssetNameUnique(name: string, excludeId?: string): Promise<boolean> {
    let query = 'SELECT id FROM assets WHERE name = $1';
    const values: any[] = [name];

    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }

    try {
      const result = await pool.query(query, values);
      return result.rows.length === 0;
    } catch (error) {
      logger.error('Failed to check asset name uniqueness:', error);
      return false;
    }
  }

  /**
   * Map database row to Asset object
   */
  private mapDatabaseRowToAsset(row: any): Asset {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      status: row.status,
      currentRiskScore: row.currentRiskScore ? parseFloat(row.currentRiskScore) : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
}

export const assetService = new AssetService();
