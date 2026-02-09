import { SensorDataPoint, ValidationResult, SENSOR_RANGES, VALID_SENSOR_TYPES } from '../types/sensor';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export class ValidationService {
  /**
   * Validates sensor data according to requirements 1.1 and 1.3
   * - Timestamp must not be in the future
   * - Timestamp must not be older than 7 days
   * - Sensor type must be valid
   * - Value must be within expected range for sensor type
   */
  validateSensorData(data: SensorDataPoint): ValidationResult {
    const errors: string[] = [];

    // Validate timestamp is not in future
    const now = new Date();
    if (data.timestamp > now) {
      errors.push('Timestamp cannot be in the future');
    }

    // Validate timestamp is not older than 7 days
    const sevenDaysAgo = new Date(now.getTime() - SEVEN_DAYS_MS);
    if (data.timestamp < sevenDaysAgo) {
      errors.push('Timestamp cannot be older than 7 days');
    }

    // Validate sensor type
    if (!VALID_SENSOR_TYPES.includes(data.sensorType)) {
      errors.push(`Invalid sensor type: ${data.sensorType}. Must be one of: ${VALID_SENSOR_TYPES.join(', ')}`);
    }

    // Validate value is within expected range
    if (VALID_SENSOR_TYPES.includes(data.sensorType)) {
      const range = SENSOR_RANGES[data.sensorType];
      if (data.value < range.min || data.value > range.max) {
        errors.push(
          `Value ${data.value} is out of range for ${data.sensorType}. ` +
          `Expected range: ${range.min} to ${range.max} ${data.unit}`
        );
      }
    }

    // Validate assetId is provided
    if (!data.assetId || data.assetId.trim() === '') {
      errors.push('Asset ID is required');
    }

    // Validate unit is provided
    if (!data.unit || data.unit.trim() === '') {
      errors.push('Unit is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Validates that an asset exists in the system
   * This will be implemented when we add database connectivity
   */
  async validateAssetExists(assetId: string): Promise<boolean> {
    // TODO: Implement database check in next task
    // For now, return true to allow testing
    return true;
  }
}

export const validationService = new ValidationService();
