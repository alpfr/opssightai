import { Pool } from 'pg';
import { logger } from '../utils/logger';
import {
  Notification,
  NotificationPreferences,
  CreateNotificationRequest,
  NotificationType,
  NotificationSeverity,
  NotificationChannel
} from '../types/notification';

class NotificationService {
  private pool: Pool;
  private readonly DEDUPLICATION_WINDOW_HOURS = 1;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async createNotification(request: CreateNotificationRequest): Promise<Notification> {
    try {
      // Check for duplicate notifications within deduplication window
      const isDuplicate = await this.checkDuplicate(
        request.userId,
        request.type,
        request.assetId
      );

      if (isDuplicate) {
        logger.info(`Duplicate notification suppressed for user ${request.userId}, type ${request.type}`);
        throw new Error('Duplicate notification within deduplication window');
      }

      // Get user preferences
      const preferences = await this.getUserPreferences(request.userId);

      // Check if notification should be sent based on preferences
      if (!this.shouldSendNotification(request, preferences)) {
        logger.info(`Notification filtered by user preferences for user ${request.userId}`);
        throw new Error('Notification filtered by user preferences');
      }

      // Determine channels to use
      const channels = request.channels || preferences.channels || [NotificationChannel.IN_APP];

      // Insert notification into database
      const result = await this.pool.query(
        `INSERT INTO notifications 
         (user_id, asset_id, type, severity, title, message, channels, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING id, user_id as "userId", asset_id as "assetId", type, severity, 
                   title, message, timestamp, read_at as "readAt", channels`,
        [
          request.userId,
          request.assetId || null,
          request.type,
          request.severity,
          request.title,
          request.message,
          channels
        ]
      );

      const notification: Notification = {
        ...result.rows[0],
        timestamp: new Date(result.rows[0].timestamp),
        readAt: result.rows[0].readAt ? new Date(result.rows[0].readAt) : undefined,
        metadata: request.metadata
      };

      logger.info(`Notification created: ${notification.id} for user ${request.userId}`);

      // Queue notification for delivery (async)
      this.queueNotificationDelivery(notification).catch(err => {
        logger.error(`Failed to queue notification delivery: ${err.message}`);
      });

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  private async checkDuplicate(
    userId: string,
    type: NotificationType,
    assetId?: string
  ): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT COUNT(*) as count
       FROM notifications
       WHERE user_id = $1
       AND type = $2
       AND ($3::uuid IS NULL OR asset_id = $3)
       AND timestamp > NOW() - INTERVAL '${this.DEDUPLICATION_WINDOW_HOURS} hours'`,
      [userId, type, assetId || null]
    );

    return parseInt(result.rows[0].count) > 0;
  }

  private shouldSendNotification(
    request: CreateNotificationRequest,
    preferences: NotificationPreferences
  ): boolean {
    // Check severity threshold
    const severityOrder = {
      [NotificationSeverity.LOW]: 1,
      [NotificationSeverity.MEDIUM]: 2,
      [NotificationSeverity.HIGH]: 3,
      [NotificationSeverity.CRITICAL]: 4
    };

    if (severityOrder[request.severity] < severityOrder[preferences.severityThreshold]) {
      return false;
    }

    // Check if notification type is enabled
    if (!preferences.enabledTypes.includes(request.type)) {
      return false;
    }

    // Check quiet hours
    if (this.isQuietHours(preferences)) {
      // Only send critical notifications during quiet hours
      if (request.severity !== NotificationSeverity.CRITICAL) {
        return false;
      }
    }

    return true;
  }

  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  private async queueNotificationDelivery(notification: Notification): Promise<void> {
    // In a production system, this would queue the notification to RabbitMQ or Redis
    // For now, we'll just log it
    logger.info(`Queued notification ${notification.id} for delivery via channels: ${notification.channels.join(', ')}`);

    // Simulate delivery (in production, this would be handled by a separate worker)
    for (const channel of notification.channels) {
      await this.deliverNotification(notification, channel);
    }
  }

  private async deliverNotification(
    notification: Notification,
    channel: NotificationChannel
  ): Promise<void> {
    try {
      switch (channel) {
        case NotificationChannel.IN_APP:
          // Already stored in database, no additional action needed
          logger.info(`In-app notification ${notification.id} ready for display`);
          break;

        case NotificationChannel.EMAIL:
          await this.sendEmail(notification);
          break;

        case NotificationChannel.SMS:
          await this.sendSMS(notification);
          break;

        default:
          logger.warn(`Unknown notification channel: ${channel}`);
      }
    } catch (error) {
      logger.error(`Failed to deliver notification ${notification.id} via ${channel}:`, error);
      // In production, implement retry logic here
    }
  }

  private async sendEmail(notification: Notification): Promise<void> {
    // TODO: Integrate with SendGrid or similar email service
    logger.info(`[EMAIL] Would send to user ${notification.userId}: ${notification.title}`);
    // Placeholder for email integration
    // await sendgrid.send({
    //   to: userEmail,
    //   subject: notification.title,
    //   text: notification.message
    // });
  }

  private async sendSMS(notification: Notification): Promise<void> {
    // TODO: Integrate with Twilio or similar SMS service
    logger.info(`[SMS] Would send to user ${notification.userId}: ${notification.title}`);
    // Placeholder for SMS integration
    // await twilio.messages.create({
    //   to: userPhone,
    //   body: `${notification.title}: ${notification.message}`
    // });
  }

  async getUserNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      severity?: NotificationSeverity;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { unreadOnly = false, severity, limit = 50, offset = 0 } = options;

    let query = `
      SELECT id, user_id as "userId", asset_id as "assetId", type, severity,
             title, message, timestamp, read_at as "readAt", channels
      FROM notifications
      WHERE user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (unreadOnly) {
      query += ` AND read_at IS NULL`;
    }

    if (severity) {
      query += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    query += ` ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1`;
    const countParams: any[] = [userId];

    if (unreadOnly) {
      countQuery += ` AND read_at IS NULL`;
    }

    if (severity) {
      countQuery += ` AND severity = $2`;
      countParams.push(severity);
    }

    const countResult = await this.pool.query(countQuery, countParams);

    return {
      notifications: result.rows.map(row => ({
        ...row,
        timestamp: new Date(row.timestamp),
        readAt: row.readAt ? new Date(row.readAt) : undefined
      })),
      total: parseInt(countResult.rows[0].count)
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE notifications
       SET read_at = NOW()
       WHERE id = $1 AND user_id = $2 AND read_at IS NULL`,
      [notificationId, userId]
    );

    logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.pool.query(
      `UPDATE notifications
       SET read_at = NOW()
       WHERE user_id = $1 AND read_at IS NULL
       RETURNING id`,
      [userId]
    );

    logger.info(`Marked ${result.rowCount} notifications as read for user ${userId}`);
    return result.rowCount || 0;
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const result = await this.pool.query(
      `SELECT notification_preferences
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default preferences
      return {
        userId,
        channels: [NotificationChannel.IN_APP],
        severityThreshold: NotificationSeverity.MEDIUM,
        enabledTypes: Object.values(NotificationType)
      };
    }

    const prefs = result.rows[0].notification_preferences || {};

    return {
      userId,
      channels: prefs.channels || [NotificationChannel.IN_APP],
      severityThreshold: prefs.severityThreshold || NotificationSeverity.MEDIUM,
      quietHoursStart: prefs.quietHoursStart,
      quietHoursEnd: prefs.quietHoursEnd,
      enabledTypes: prefs.enabledTypes || Object.values(NotificationType)
    };
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const currentPrefs = await this.getUserPreferences(userId);
    const updatedPrefs = { ...currentPrefs, ...preferences };

    await this.pool.query(
      `UPDATE users
       SET notification_preferences = $1
       WHERE id = $2`,
      [JSON.stringify(updatedPrefs), userId]
    );

    logger.info(`Updated notification preferences for user ${userId}`);

    return updatedPrefs;
  }
}

export { NotificationService };
