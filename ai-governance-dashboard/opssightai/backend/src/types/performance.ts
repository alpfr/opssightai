// Performance Metrics Types

export type EventType = 'uptime' | 'downtime';
export type DowntimeCategory = 'planned_maintenance' | 'unplanned_failure' | 'no_demand' | 'other';
export type TimePeriod = 'shift' | 'daily' | 'weekly' | 'monthly';

export interface UptimeEvent {
  id?: string;
  assetId: string;
  eventType: EventType;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  downtimeCategory?: DowntimeCategory;
  downtimeReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssetMetrics {
  id?: string;
  assetId: string;
  metricDate: Date;
  uptimeHours: number;
  downtimeHours: number;
  plannedDowntimeHours: number;
  unplannedDowntimeHours: number;
  unitsProduced: number;
  defects: number;
  goodUnits?: number;
  energyConsumed?: number; // kWh
  operatingCost?: number;
  maintenanceCost?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssetKPIs {
  id?: string;
  assetId: string;
  calculatedAt?: Date;
  timePeriod: TimePeriod;
  periodStart: Date;
  periodEnd: Date;
  availability?: number; // percentage
  performance?: number; // percentage
  quality?: number; // percentage
  oee?: number; // percentage
  mtbf?: number; // hours
  mttr?: number; // hours
  uptimePercentage?: number;
  costPerOperatingHour?: number;
  failureCount: number;
  repairCount: number;
  totalOperatingHours?: number;
}

export interface OEECalculation {
  assetId: string;
  assetName: string;
  timePeriod: TimePeriod;
  periodStart: Date;
  periodEnd: Date;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  details: {
    operatingTime: number;
    plannedProductionTime: number;
    actualOutput: number;
    maxPossibleOutput: number;
    goodOutput: number;
    totalOutput: number;
  };
}

export interface MTBFCalculation {
  assetId: string;
  assetName: string;
  mtbf: number; // hours
  totalOperatingTime: number; // hours
  failureCount: number;
  periodStart: Date;
  periodEnd: Date;
  trend: 'improving' | 'stable' | 'declining';
  percentageChange?: number;
}

export interface MTTRCalculation {
  assetId: string;
  assetName: string;
  mttr: number; // hours
  totalRepairTime: number; // hours
  repairCount: number;
  periodStart: Date;
  periodEnd: Date;
  trend: 'improving' | 'stable' | 'declining';
  percentageChange?: number;
}

export interface PerformanceDashboard {
  assetId: string;
  assetName: string;
  currentStatus: string;
  oee: OEECalculation;
  mtbf: MTBFCalculation;
  mttr: MTTRCalculation;
  uptimePercentage: number;
  costPerOperatingHour: number;
  lastUpdated: Date;
}

export interface PerformanceTrend {
  date: Date;
  oee?: number;
  availability?: number;
  performance?: number;
  quality?: number;
  mtbf?: number;
  mttr?: number;
}

export interface DowntimeAnalysis {
  assetId: string;
  assetName: string;
  totalDowntime: number; // hours
  plannedDowntime: number; // hours
  unplannedDowntime: number; // hours
  downtimeByCategory: {
    category: DowntimeCategory;
    hours: number;
    percentage: number;
  }[];
  topReasons: {
    reason: string;
    occurrences: number;
    totalHours: number;
  }[];
  periodStart: Date;
  periodEnd: Date;
}
