// Maintenance Management Types

export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'emergency';
export type TriggerType = 'time_based' | 'usage_based';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
export type IntervalUnit = 'days' | 'weeks' | 'months' | 'hours' | 'cycles';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type WorkOrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type AvailabilityStatus = 'available' | 'busy' | 'off_duty';
export type RecommendationType = 'risk_based' | 'anomaly_based' | 'predictive';
export type Urgency = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationStatus = 'pending' | 'accepted' | 'deferred' | 'dismissed';

export interface Technician {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  certifications?: Record<string, any>;
  availabilityStatus: AvailabilityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MaintenanceSchedule {
  id?: string;
  assetId: string;
  scheduleName: string;
  scheduleType: MaintenanceType;
  triggerType: TriggerType;
  frequency?: ScheduleFrequency;
  intervalValue?: number;
  intervalUnit?: IntervalUnit;
  usageThreshold?: number;
  nextDueDate?: Date;
  taskDescription: string;
  estimatedDuration?: number; // minutes
  requiredParts?: Record<string, any>;
  assignedTechnicianId?: string;
  priority: Priority;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkOrder {
  id?: string;
  assetId: string;
  scheduleId?: string;
  workOrderNumber?: string;
  title: string;
  description: string;
  maintenanceType: MaintenanceType;
  priority: Priority;
  status: WorkOrderStatus;
  assignedTechnicianId?: string;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  estimatedCost?: number;
  actualCost?: number;
  createdAt?: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  completionNotes?: string;
  createdBy?: string;
  updatedAt?: Date;
}

export interface MaintenanceHistory {
  id?: string;
  assetId: string;
  workOrderId?: string;
  performedAt: Date;
  maintenanceType: MaintenanceType;
  description: string;
  technicianId?: string;
  duration?: number; // minutes
  laborCost?: number;
  partsCost?: number;
  contractorCost?: number;
  otherCost?: number;
  totalCost?: number;
  partsUsed?: Record<string, any>;
  notes?: string;
  attachments?: Record<string, any>;
  createdAt?: Date;
}

export interface MaintenanceRecommendation {
  id?: string;
  assetId: string;
  recommendationType: RecommendationType;
  urgency: Urgency;
  title: string;
  description: string;
  suggestedActions: string;
  estimatedCost?: number;
  estimatedDowntime?: number; // minutes
  riskIfDeferred?: string;
  generatedAt?: Date;
  status: RecommendationStatus;
  statusUpdatedAt?: Date;
  statusUpdatedBy?: string;
  deferralReason?: string;
  relatedAnomalyId?: string;
  relatedRiskScore?: number;
}

export interface MaintenanceCostSummary {
  assetId: string;
  assetName: string;
  totalCost: number;
  laborCost: number;
  partsCost: number;
  contractorCost: number;
  otherCost: number;
  maintenanceCount: number;
  averageCostPerMaintenance: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface TechnicianWorkload {
  technicianId: string;
  technicianName: string;
  activeWorkOrders: number;
  totalEstimatedHours: number;
  completedThisMonth: number;
  availabilityStatus: AvailabilityStatus;
}
