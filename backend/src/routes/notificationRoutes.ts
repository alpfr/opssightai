import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { NotificationService } from '../services/notificationService';
import { logger } from '../utils/logger';
import { CreateNotificationRequest, NotificationSeverity } from '../types/notification';

const router = Router();
const notificationService = new NotificationService(pool);

// GET /api/notifications - Get user notifications
router.get('/', async (req: Request, res: Response) => {
  try {
    // In production, userId would come from authenticated session
    const userId = req.query.userId as string || 'admin@opssightai.com';
    const unreadOnly = req.query.unreadOnly === 'true';
    const severity = req.query.severity as NotificationSeverity | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await notificationService.getUserNotifications(userId, {
      unreadOnly,
      severity,
      limit,
      offset
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

// POST /api/notifications - Create a new notification
router.post('/', async (req: Request, res: Response) => {
  try {
    const request: CreateNotificationRequest = req.body;

    if (!request.userId || !request.type || !request.severity || !request.title || !request.message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, type, severity, title, message'
      });
    }

    const notification = await notificationService.createNotification(request);

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error: any) {
    if (error.message.includes('Duplicate') || error.message.includes('filtered')) {
      return res.status(200).json({
        success: true,
        message: error.message
      });
    }

    logger.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // In production, userId would come from authenticated session
    const userId = req.body.userId || 'admin@opssightai.com';

    await notificationService.markAsRead(id, userId);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    // In production, userId would come from authenticated session
    const userId = req.body.userId || 'admin@opssightai.com';

    const count = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: `Marked ${count} notifications as read`,
      count
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read'
    });
  }
});

// GET /api/notifications/preferences - Get user notification preferences
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    // In production, userId would come from authenticated session
    const userId = req.query.userId as string || 'admin@opssightai.com';

    const preferences = await notificationService.getUserPreferences(userId);

    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    logger.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification preferences'
    });
  }
});

// POST /api/notifications/preferences - Update user notification preferences
router.post('/preferences', async (req: Request, res: Response) => {
  try {
    // In production, userId would come from authenticated session
    const userId = req.body.userId || 'admin@opssightai.com';
    const preferences = req.body.preferences;

    if (!preferences) {
      return res.status(400).json({
        success: false,
        error: 'Missing preferences in request body'
      });
    }

    const updatedPreferences = await notificationService.updateUserPreferences(
      userId,
      preferences
    );

    res.json({
      success: true,
      preferences: updatedPreferences
    });
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification preferences'
    });
  }
});

export default router;
