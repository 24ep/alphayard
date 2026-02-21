import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticateToken } from '../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken as any);

// Get all notifications for current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { limit = 50, offset = 0 } = req.query as { limit?: number, offset?: number };

    if (!userId) {
      return res.json({ success: true, data: [] });
    }

    const result = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const notifications = result.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      type: row.type,
      title: row.title,
      message: row.body,
      data: row.data,
      status: row.isRead,
      actionUrl: row.actionUrl,
      senderId: row.senderId,
      senderName: row.senderName,
      metadata: row.metadata,
      timestamp: row.createdAt,
      scheduledAt: row.scheduledAt,
    }));

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.json({ success: true, data: [] });
  }
});

// Get unread count
router.get('/unread-count', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.json({ success: true, data: { count: 0 } });
    }

    const count = await prisma.notification.count({
      where: { 
        userId,
        isRead: false
      }
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.json({ success: true, data: { count: 0 } });
  }
});

// Get notification settings
router.get('/settings/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const result = await prisma.userSettings.findFirst({
      where: { 
        userId,
        applicationId: null
      }
    });

    if (result) {
      return res.json({ success: true, data: result.settings });
    }

    // Return default settings
    res.json({
      success: true,
      data: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        types: {
          info: true,
          success: true,
          warning: true,
          error: true,
          system: true,
          Circle: true,
          finance: true,
          health: true
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.json({
      success: true,
      data: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        types: {
          info: true,
          success: true,
          warning: true,
          error: true,
          system: true,
          Circle: true,
          finance: true,
          health: true
        }
      }
    });
  }
});

// Update notification settings
router.put('/settings/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const settings = req.body;

    // First try to find existing settings
    const existing = await prisma.userSettings.findFirst({
      where: { 
        userId,
        applicationId: null
      }
    });

    if (existing) {
      // Update existing
      await prisma.userSettings.update({
        where: { id: existing.id },
        data: { settings }
      });
    } else {
      // Create new
      await prisma.userSettings.create({
        data: {
          userId,
          applicationId: null,
          settings
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

// Create a new notification
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, data, actionUrl, metadata } = req.body;
    const targetUserId = userId || (req as any).user?.id;

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: type || 'info',
        title,
        body: message,
        data: data || {},
        actionUrl,
        isRead: false
      }
    });

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        type: type || 'info',
        title,
        message,
        data,
        status: 'unread',
        actionUrl,
        metadata,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, error: 'Failed to create notification' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark as read' });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || (req as any).user?.id;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false
      },
      data: { 
        isRead: true, 
        readAt: new Date() 
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all as read' });
  }
});

// Delete notification
router.delete('/:notificationId', async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
});

// Delete all notifications
router.delete('/all', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId || (req as any).user?.id;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    await prisma.notification.deleteMany({
      where: { userId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to delete all notifications' });
  }
});

// Delete old notifications
router.delete('/old', async (req: Request, res: Response) => {
  try {
    const { userId, days = 30 } = req.query;
    const targetUserId = userId || (req as any).user?.id;

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days as string));

    await prisma.notification.deleteMany({
      where: {
        userId: targetUserId,
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting old notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to delete old notifications' });
  }
});

// Register push token
router.post('/register-token', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { token, platform, deviceInfo } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ success: false, error: 'User ID and token required' });
    }

    // Store push token in user_push_tokens table
    await prisma.userPushToken.upsert({
      where: { token },
      update: { 
        platform,
        deviceId: deviceInfo?.deviceId || null,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        userId,
        token,
        platform,
        deviceId: deviceInfo?.deviceId || null
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ success: false, error: 'Failed to register token' });
  }
});

// Unregister push token
router.post('/unregister-token', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token required' });
    }

    if (userId) {
      await prisma.userPushToken.deleteMany({
        where: { 
          userId,
          token
        }
      });
    } else {
      await prisma.userPushToken.delete({
        where: { token }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error unregistering push token:', error);
    res.status(500).json({ success: false, error: 'Failed to unregister token' });
  }
});

// Schedule notification
router.post('/schedule', async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, scheduledAt, data } = req.body;
    const targetUserId = userId || (req as any).user?.id;
    const id = uuidv4();

    await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: targetUserId,
        type: type || 'info',
        title,
        body: message,
        data: data || {},
        isRead: false
      }
    });

    res.json({
      success: true,
      data: {
        id,
        userId: targetUserId,
        type: type || 'info',
        title,
        message,
        data,
        status: 'scheduled',
        scheduledAt,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    res.status(500).json({ success: false, error: 'Failed to schedule notification' });
  }
});

// Cancel scheduled notification
router.delete('/schedule/:notificationId', async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error cancelling scheduled notification:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel scheduled notification' });
  }
});

// Send notification to all circle members
router.post('/circle', async (req: Request, res: Response) => {
  try {
    const { circleId, type, title, message, data } = req.body;
    const senderId = (req as any).user?.id;

    // Get all circle members
    const members = await prisma.circleMember.findMany({
      where: { circleId },
      select: { userId: true }
    });

    const notificationIds: string[] = [];

    // Create notification for each member
    for (const member of members) {
      if (member.userId !== senderId) {
        const id = uuidv4();
        notificationIds.push(id);
        
        await prisma.notification.create({
          data: {
            id,
            userId: member.userId,
            type: type || 'Circle',
            title,
            body: message,
            data: data || {},
            isRead: false
          }
        });
      }
    }

    res.json({ success: true, data: { notificationIds, recipientCount: notificationIds.length } });
  } catch (error) {
    console.error('Error sending circle notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send circle notification' });
  }
});

export default router;
