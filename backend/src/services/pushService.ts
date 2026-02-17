// @ts-ignore
import * as admin from 'firebase-admin';
// @ts-ignore
import * as webpush from 'web-push';
import { prisma } from '../lib/prisma';

export interface PushNotification {
  title: string;
  body: string;
  image?: string;
  icon?: string;
  tag?: string;
  url?: string;
  data?: any;
  priority?: 'normal' | 'high';
  requireInteraction?: boolean;
  actions?: any[];
}

class PushService {
  private initialized = false;
  private fcm?: admin.messaging.Messaging;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      // Initialize Firebase Admin SDK
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        if (admin.apps.length === 0) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
          });
        }

        this.fcm = admin.messaging();
        console.log('Firebase Admin SDK initialized');
      }

      // Initialize Web Push
      if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
          'mailto:' + (process.env.SUPPORT_EMAIL || 'support@boundary.com'),
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
        console.log('Web Push initialized');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Push service initialization error:', error);
    }
  }

  // Send push notification to specific user
  async sendToUser(userId: string, notification: PushNotification) {
    try {
      if (!this.initialized) {
        throw new Error('Push service not initialized');
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new Error('User not found');
      }

      const results: any[] = [];

      // Get FCM tokens from UserPushToken table
      const fcmTokens = await prisma.userPushToken.findMany({
        where: {
          userId,
          platform: { in: ['fcm', 'android', 'ios'] },
          isActive: true,
        },
        select: { token: true },
      });

      const deviceTokens = fcmTokens.map(t => t.token);
      if (deviceTokens.length > 0) {
        const fcmResult = await this.sendToFCM(deviceTokens, notification);
        results.push(...fcmResult);
      }

      // Get web push subscriptions from UserPushToken table
      const webPushTokens = await prisma.userPushToken.findMany({
        where: {
          userId,
          platform: 'web',
          isActive: true,
        },
        select: { token: true },
      });

      // Parse JSON subscriptions stored in token field
      const webPushSubscriptions = webPushTokens
        .map(t => {
          try {
            return JSON.parse(t.token);
          } catch {
            return null;
          }
        })
        .filter((sub): sub is any => sub !== null);

      if (webPushSubscriptions.length > 0) {
        const webResult = await this.sendToWebPush(webPushSubscriptions, notification);
        results.push(...webResult);
      }

      return results;
    } catch (error) {
      console.error('Send to user error:', error);
      throw error;
    }
  }

  // Send to multiple users
  async sendToUsers(userIds: string[], notification: PushNotification) {
    try {
      const results: any[] = [];
      
      for (const userId of userIds) {
        try {
          const result = await this.sendToUser(userId, notification);
          results.push(...result);
        } catch (error: any) {
          console.error(`Failed to send to user ${userId}:`, error);
          results.push({ userId, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Send to users error:', error);
      throw error;
    }
  }

  // Send to FCM (mobile devices)
  async sendToFCM(tokens: string[], notification: PushNotification) {
    try {
      if (!this.fcm) {
        throw new Error('FCM not initialized');
      }

      const message: any = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.image,
        },
        data: notification.data || {},
        android: {
          notification: {
            sound: 'default',
            channelId: 'boundary_channel',
            priority: notification.priority || 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              alert: {
                title: notification.title,
                body: notification.body,
              },
            },
          },
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: notification.icon || '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: notification.tag,
            requireInteraction: notification.requireInteraction || false,
            actions: notification.actions || [],
          },
          fcmOptions: {
            link: notification.url || '/',
          },
        },
      };

      const response = await this.fcm.sendEachForMulticast({
        tokens,
        ...message,
      });

      const results: any[] = [];
      response.responses.forEach((resp: any, idx: number) => {
        results.push({
          token: tokens[idx],
          success: resp.success,
          messageId: resp.messageId,
          error: resp.error,
        });
      });

      return results;
    } catch (error) {
      console.error('FCM send error:', error);
      throw error;
    }
  }

  // Send to Web Push (browsers)
  async sendToWebPush(subscriptions: any[], notification: PushNotification) {
    try {
      const results: any[] = [];
      
      for (const subscription of subscriptions) {
        try {
          const payload = JSON.stringify({
            title: notification.title,
            body: notification.body,
            icon: notification.icon || '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: notification.tag,
            requireInteraction: notification.requireInteraction || false,
            actions: notification.actions || [],
            data: notification.data || {},
            url: notification.url || '/',
          });

          const result = await webpush.sendNotification(subscription, payload);
          
          results.push({
            subscription: subscription.endpoint,
            success: true,
            statusCode: result.statusCode,
          });
        } catch (error: any) {
          results.push({
            subscription: subscription.endpoint,
            success: false,
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Web Push send error:', error);
      throw error;
    }
  }

  // Send to topic (for broadcast messages)
  async sendToTopic(topic: string, notification: PushNotification) {
    try {
      if (!this.fcm) {
        throw new Error('FCM not initialized');
      }

      const message: any = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        topic,
      };

      const response = await this.fcm.send(message);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Topic send error:', error);
      throw error;
    }
  }

  // Subscribe user to topic
  async subscribeToTopic(tokens: string[], topic: string) {
    try {
      if (!this.fcm) {
        throw new Error('FCM not initialized');
      }

      const response = await this.fcm.subscribeToTopic(tokens, topic);
      return response;
    } catch (error) {
      console.error('Subscribe to topic error:', error);
      throw error;
    }
  }

  // Unsubscribe user from topic
  async unsubscribeFromTopic(tokens: string[], topic: string) {
    try {
      if (!this.fcm) {
        throw new Error('FCM not initialized');
      }

      const response = await this.fcm.unsubscribeFromTopic(tokens, topic);
      return response;
    } catch (error) {
      console.error('Unsubscribe from topic error:', error);
      throw error;
    }
  }

  // Add FCM token for user
  async addFCMToken(userId: string, token: string, platform: string = 'fcm', deviceId?: string) {
    try {
      // Use upsert to avoid duplicates (token has unique constraint)
      await prisma.userPushToken.upsert({
        where: { token },
        update: {
          userId,
          platform,
          deviceId,
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          userId,
          token,
          platform,
          deviceId,
          isActive: true,
        },
      });

      return true;
    } catch (error) {
      console.error('Add FCM token error:', error);
      throw error;
    }
  }

  // Remove FCM token for user
  async removeFCMToken(userId: string, token: string) {
    try {
      // Delete the token or mark as inactive
      await prisma.userPushToken.deleteMany({
        where: {
          userId,
          token,
          platform: { in: ['fcm', 'android', 'ios'] },
        },
      });

      return true;
    } catch (error) {
      console.error('Remove FCM token error:', error);
      throw error;
    }
  }

  // Add web push subscription for user
  async addWebPushSubscription(userId: string, subscription: any) {
    try {
      // Store subscription as JSON string in token field, use endpoint as unique identifier
      const subscriptionJson = JSON.stringify(subscription);
      const endpoint = subscription.endpoint;

      // Use upsert based on endpoint (stored in token JSON)
      // First check if a token with this endpoint exists
      const existing = await prisma.userPushToken.findFirst({
        where: {
          userId,
          platform: 'web',
          token: { contains: endpoint },
        },
      });

      if (existing) {
        await prisma.userPushToken.update({
          where: { id: existing.id },
          data: {
            token: subscriptionJson,
            isActive: true,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.userPushToken.create({
          data: {
            userId,
            token: subscriptionJson,
            platform: 'web',
            isActive: true,
          },
        });
      }

      return true;
    } catch (error) {
      console.error('Add web push subscription error:', error);
      throw error;
    }
  }

  // Remove web push subscription for user
  async removeWebPushSubscription(userId: string, endpoint: string) {
    try {
      // Find and delete web push subscriptions by endpoint (stored in token JSON)
      await prisma.userPushToken.deleteMany({
        where: {
          userId,
          platform: 'web',
          token: { contains: endpoint },
        },
      });

      return true;
    } catch (error) {
      console.error('Remove web push subscription error:', error);
      throw error;
    }
  }

  // Clean up invalid tokens
  async cleanupInvalidTokens() {
    try {
      // Mark tokens as inactive that haven't been updated recently
      // This is a placeholder - actual cleanup logic would depend on business requirements
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

      const result = await prisma.userPushToken.updateMany({
        where: {
          isActive: true,
          updatedAt: { lt: cutoffDate },
        },
        data: {
          isActive: false,
        },
      });

      console.log(`Cleaned up ${result.count} inactive tokens`);
      return { cleaned: result.count };
    } catch (error) {
      console.error('Cleanup invalid tokens error:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string, days = 30) {
    try {
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        successRate: 0,
      };
    } catch (error) {
      console.error('Get notification stats error:', error);
      throw error;
    }
  }
}

// Create push service instance
export const pushService = new PushService();

// Export functions for convenience
export const sendPushNotification = (userId: string, notification: PushNotification) => pushService.sendToUser(userId, notification);
export const sendToTopic = (topic: string, notification: PushNotification) => pushService.sendToTopic(topic, notification);
export const subscribeToTopic = (tokens: string[], topic: string) => pushService.subscribeToTopic(tokens, topic);
export const unsubscribeFromTopic = (tokens: string[], topic: string) => pushService.unsubscribeFromTopic(tokens, topic);
export const addFCMToken = (userId: string, token: string) => pushService.addFCMToken(userId, token);
export const removeFCMToken = (userId: string, token: string) => pushService.removeFCMToken(userId, token);
export const addWebPushSubscription = (userId: string, subscription: any) => pushService.addWebPushSubscription(userId, subscription);
export const removeWebPushSubscription = (userId: string, endpoint: string) => pushService.removeWebPushSubscription(userId, endpoint);
export const cleanupInvalidTokens = () => pushService.cleanupInvalidTokens();
export const getNotificationStats = (userId: string, days: number) => pushService.getNotificationStats(userId, days);

export default pushService;
