export type AssetType = 'transformer' | 'motor' | 'generator' | 'pump' | 'compressor';
export type AssetStatus = 'active' | 'maintenance' | 'offline' | 'decommissioned';

export interface AssetLocation {
  plantId: string;
  building: string;
  floor?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AssetMetadata {
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: Date;
  capacity?: string;
  specifications?: Record<string, any>;
}

export interface Asset {
  id?: string;
  name: string;
  type: AssetType;
  location: AssetLocation;
  metadata: AssetMetadata;
  status: AssetStatus;
  currentRiskScore?: number;
  lastMaintenanceDate?: Date;
  nextScheduledMaintenance?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssetValidationResult {
  isValid: boolean;
  errors?: string[];
}

export const VALID_ASSET_TYPES: AssetType[] = [
  'transformer',
  'motor',
  'generator',
  'pump',
  'compressor'
];

export const VALID_ASSET_STATUSES: AssetStatus[] = [
  'active',
  'maintenance',
  'offline',
  'decommissioned'
];
