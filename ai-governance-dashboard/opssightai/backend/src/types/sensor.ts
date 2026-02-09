export type SensorType = 'temperature' | 'vibration' | 'voltage' | 'current' | 'pressure';

export interface SensorDataPoint {
  assetId: string;
  timestamp: Date;
  sensorType: SensorType;
  value: number;
  unit: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export interface SensorRange {
  min: number;
  max: number;
}

// Define expected ranges for each sensor type
export const SENSOR_RANGES: Record<SensorType, SensorRange> = {
  temperature: { min: -50, max: 200 },    // Celsius
  vibration: { min: 0, max: 100 },        // mm/s
  voltage: { min: 0, max: 50000 },        // Volts
  current: { min: 0, max: 10000 },        // Amperes
  pressure: { min: 0, max: 1000 }         // PSI
};

export const VALID_SENSOR_TYPES: SensorType[] = [
  'temperature',
  'vibration',
  'voltage',
  'current',
  'pressure'
];
