import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notification/NotificationService';
import { useAuth } from './useAuth';
import { Notification, NotificationType } from '../services/notification/NotificationService.types';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications when user is authenticated
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [user]);

  const loadNotifications = async (limit: number = 50, offset: number = 0) => {
    if (!user) return;

    try {
      setLoading(true);
      const userNotifications = await notificationService.getNotifications(user.id, limit, offset);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user) return;

    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'read' }
            : notification
        )
      );
      
      // Update unread count
      await loadUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'read' }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
    }
  }, [user]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // Update unread count
      await loadUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');
    }
  }, [user]);

  const createNotification = useCallback(async (
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ) => {
    if (!user) return;

    try {
      const newNotification = await notificationService.createNotification(
        user.id,
        type,
        title,
        message,
        data
      );
      
      // Add to local state
      setNotifications(prev => [newNotification, ...prev]);
      
      // Update unread count
      await loadUnreadCount();
    } catch (error) {
      console.error('Error creating notification:', error);
      setError('Failed to create notification');
    }
  }, [user]);

  const scheduleNotification = useCallback(async (
    type: NotificationType,
    title: string,
    message: string,
    scheduledAt: Date,
    data?: any
  ) => {
    if (!user) return;

    try {
      await notificationService.scheduleNotification(
        user.id,
        type,
        title,
        message,
        scheduledAt,
        data
      );
    } catch (error) {
      console.error('Error scheduling notification:', error);
      setError('Failed to schedule notification');
    }
  }, [user]);

  const cancelScheduledNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      await notificationService.cancelScheduledNotification(notificationId);
    } catch (error) {
      console.error('Error cancelling scheduled notification:', error);
      setError('Failed to cancel scheduled notification');
    }
  }, [user]);

  const sendFamilyNotification = useCallback(async (
    familyId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ) => {
    try {
      await notificationService.sendFamilyNotification(
        familyId,
        type,
        title,
        message,
        data
      );
    } catch (error) {
      console.error('Error sending hourse notification:', error);
      setError('Failed to send hourse notification');
    }
  }, []);

  const getNotificationSettings = useCallback(async () => {
    if (!user) return null;

    try {
      return await notificationService.getNotificationSettings(user.id);
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }, [user]);

  const updateNotificationSettings = useCallback(async (settings: any) => {
    if (!user) return;

    try {
      await notificationService.updateNotificationSettings(user.id, settings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setError('Failed to update notification settings');
    }
  }, [user]);

  const clearOldNotifications = useCallback(async (days: number = 30) => {
    if (!user) return;

    try {
      await notificationService.clearOldNotifications(user.id, days);
      
      // Reload notifications
      await loadNotifications();
    } catch (error) {
      console.error('Error clearing old notifications:', error);
      setError('Failed to clear old notifications');
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    scheduleNotification,
    cancelScheduledNotification,
    sendFamilyNotification,
    getNotificationSettings,
    updateNotificationSettings,
    clearOldNotifications,
    clearError,
  };
}; 