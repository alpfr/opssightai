export interface Notification {
  id: string;
  userId: string;
  assetId?: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: Date;
  readAt?: Date;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
}

export enum NotificationType {
  RISK_CHANGE = 'risk_change',
  CRITICAL_ANOMALY = 'critical_anomaly',
  HIGH_RISK_FORECAST = 'high_risk_forecast',
  ASSET_OFFLINE = 'asset_offline',
  MAINTENANCE_DUE = 'maintenance_due',
  SYSTEM_ALERT = 'system_alert'
}

export enum NotificationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms'
}

export interface NotificationPreferences {
  userId: string;
  channels: NotificationChannel[];
  severityThreshold: NotificationSeverity;
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string;   // HH:MM format
  enabledTypes: NotificationType[];
}

export interface CreateNotificationRequest {
  userId: string;
  assetId?: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  channels?: NotificationChannel[];
  metadata?: Record<string, any>;
}
