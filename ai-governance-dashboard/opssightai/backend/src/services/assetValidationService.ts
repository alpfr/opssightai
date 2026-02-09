import { Asset, AssetValidationResult, VALID_ASSET_TYPES, VALID_ASSET_STATUSES } from '../types/asset';

export class AssetValidationService {
  /**
   * Validates asset data according to requirement 8.2
   * - Type is required and must be valid
   * - Location is required (plantId and building)
   * - Unique identifier (name) is required
   * - Metadata must include required fields
   */
  validateAsset(asset: Asset): AssetValidationResult {
    const errors: string[] = [];

    // Validate name (unique identifier)
    if (!asset.name || asset.name.trim() === '') {
      errors.push('Asset name is required');
    }

    // Validate type
    if (!asset.type) {
      errors.push('Asset type is required');
    } else if (!VALID_ASSET_TYPES.includes(asset.type)) {
      errors.push(`Invalid asset type: ${asset.type}. Must be one of: ${VALID_ASSET_TYPES.join(', ')}`);
    }

    // Validate location
    if (!asset.location) {
      errors.push('Asset location is required');
    } else {
      if (!asset.location.plantId || asset.location.plantId.trim() === '') {
        errors.push('Plant ID is required in location');
      }
      if (!asset.location.building || asset.location.building.trim() === '') {
        errors.push('Building is required in location');
      }
    }

    // Validate metadata
    if (!asset.metadata) {
      errors.push('Asset metadata is required');
    } else {
      if (!asset.metadata.manufacturer || asset.metadata.manufacturer.trim() === '') {
        errors.push('Manufacturer is required in metadata');
      }
      if (!asset.metadata.model || asset.metadata.model.trim() === '') {
        errors.push('Model is required in metadata');
      }
      if (!asset.metadata.serialNumber || asset.metadata.serialNumber.trim() === '') {
        errors.push('Serial number is required in metadata');
      }
      if (!asset.metadata.installationDate) {
        errors.push('Installation date is required in metadata');
      }
    }

    // Validate status if provided
    if (asset.status && !VALID_ASSET_STATUSES.includes(asset.status)) {
      errors.push(`Invalid asset status: ${asset.status}. Must be one of: ${VALID_ASSET_STATUSES.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

export const assetValidationService = new AssetValidationService();
