import { ValidationService } from '../validationService';
import { SensorDataPoint } from '../../types/sensor';

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('validateSensorData', () => {
    const createValidSensorData = (): SensorDataPoint => ({
      assetId: 'asset-123',
      timestamp: new Date(),
      sensorType: 'temperature',
      value: 75.5,
      unit: 'C'
    });

    it('should accept valid sensor data', () => {
      const data = createValidSensorData();
      const result = validationService.validateSensorData(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject future timestamps', () => {
      const data = createValidSensorData();
      data.timestamp = new Date(Date.now() + 1000 * 60 * 60); // 1 hour in future

      const result = validationService.validateSensorData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Timestamp cannot be in the future');
    });

    it('should reject timestamps older than 7 days', () => {
      const data = createValidSensorData();
      data.timestamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago

      const result = validationService.validateSensorData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Timestamp cannot be older than 7 days');
    });

    it('should reject invalid sensor types', () => {
      const data = createValidSensorData();
      (data as any).sensorType = 'invalid-type';

      const result = validationService.validateSensorData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors?.[0]).toContain('Invalid sensor type');
    });

    it('should reject values out of range for temperature', () => {
      const data = createValidSensorData();
      data.sensorType = 'temperature';
      data.value = 300; // Above max of 200

      const result = validationService.validateSensorData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors?.[0]).toContain('out of range');
    });

    it('should reject values out of range for vibration', () => {
      const data = createValidSensorData();
      data.sensorType = 'vibration';
      data.value = -5; // Below min of 0

      const result = validationService.validateSensorData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors?.[0]).toContain('out of range');
    });

    it('should accept all valid sensor types', () => {
      const validTypes: Array<'temperature' | 'vibration' | 'voltage' | 'current' | 'pressure'> = [
        'temperature',
        'vibration',
        'voltage',
        'current',
        'pressure'
      ];

      validTypes.forEach(type => {
        const data = createValidSensorData();
        data.sensorType = type;
        data.value = 50; // Safe value within all ranges

        const result = validationService.validateSensorData(data);

        expect(result.isValid).toBe(true);
      });
    });

    it('should reject missing asset ID', () => {
      const data = createValidSensorData();
      data.assetId = '';

      const result = validationService.validateSensorData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Asset ID is required');
    });

    it('should reject missing unit', () => {
      const data = createValidSensorData();
      data.unit = '';

      const result = validationService.validateSensorData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unit is required');
    });

    it('should return multiple errors for multiple validation failures', () => {
      const data = createValidSensorData();
      data.timestamp = new Date(Date.now() + 1000 * 60); // Future
      data.value = 300; // Out of range
      data.assetId = ''; // Missing

      const result = validationService.validateSensorData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('validateAssetExists', () => {
    it('should return true for any asset ID (placeholder)', async () => {
      const result = await validationService.validateAssetExists('asset-123');
      expect(result).toBe(true);
    });
  });
});
