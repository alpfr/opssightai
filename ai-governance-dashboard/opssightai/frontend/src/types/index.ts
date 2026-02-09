export type AssetType = 'transformer' | 'motor' | 'generator' | 'pump' | 'compressor';
export type AssetStatus = 'active' | 'maintenance' | 'offline' | 'decommissioned';
export type SensorType = 'temperature' | 'vibration' | 'voltage' | 'current' | 'pressure';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  location: {
    plantId: string;
    building: string;
    floor?: string;
  };
  metadata: {
    manufacturer: string;
    model: string;
    serialNumber: string;
    installationDate: string;
    capacity?: string;
  };
  status: AssetStatus;
  currentRiskScore?: number;
  lastMaintenanceDate?: string;
  nextScheduledMaintenance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SensorData {
  timestamp: string;
  assetId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
}

export interface HealthStatus {
  status: string;
  uptime: number;
  timestamp: string;
  environment: string;
  database?: string;
}
