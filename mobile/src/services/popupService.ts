import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PopupContent {
  id: string;
  type: 'ad' | 'promotion' | 'announcement' | 'emergency';
  title: string;
  message: string;
  imageUrl?: string;
  actionText?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate: Date;
  targetAudience: 'all' | 'premium' | 'hourse' | 'children' | 'seniors';
  isActive: boolean;
  showCount: number;
  maxShows: number;
  conditions?: {
    userType?: string;
    location?: string;
    deviceType?: string;
    appVersion?: string;
  };
}

export interface PopupAnalytics {
  popupId: string;
  userId: string;
  action: 'view' | 'close' | 'click';
  timestamp: Date;
  sessionId: string;
}

export const popupService = {
  // Fetch active popups for user
  getActivePopups: async (userId: string, userType: string): Promise<PopupContent[]> => {
    try {
      const response = await api.get('/popups/active', {
        params: {
          userId,
          userType,
          timestamp: new Date().toISOString(),
        },
      });
      
      return response.data.popups.map((popup: any) => ({
        ...popup,
        startDate: new Date(popup.startDate),
        endDate: new Date(popup.endDate),
      }));
    } catch (error) {
      console.error('Failed to fetch active popups:', error);
      return [];
    }
  },

  // Get next popup to show
  getNextPopup: async (userId: string, userType: string): Promise<PopupContent | null> => {
    try {
      const activePopups = await popupService.getActivePopups(userId, userType);
      
      // Filter by priority and conditions
      const eligiblePopups = activePopups.filter(popup => {
        // Check if popup is within date range
        const now = new Date();
        if (now < popup.startDate || now > popup.endDate) return false;
        
        // Check if popup has been shown too many times
        if (popup.showCount >= popup.maxShows) return false;
        
        // Check target audience
        if (popup.targetAudience !== 'all' && popup.targetAudience !== userType) return false;
        
        return true;
      });

      // Sort by priority (critical > high > medium > low)
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      eligiblePopups.sort((a, b) => 
        priorityOrder[b.priority] - priorityOrder[a.priority]
      );

      return eligiblePopups.length > 0 ? eligiblePopups[0] : null;
    } catch (error) {
      console.error('Failed to get next popup:', error);
      return null;
    }
  },

  // Record popup analytics
  recordPopupAction: async (analytics: PopupAnalytics): Promise<void> => {
    try {
      await api.post('/popups/analytics', analytics);
    } catch (error) {
      console.error('Failed to record popup analytics:', error);
    }
  },

  // Mark popup as shown
  markPopupAsShown: async (popupId: string, userId: string): Promise<void> => {
    try {
      await api.post(`/popups/${popupId}/shown`, { userId });
    } catch (error) {
      console.error('Failed to mark popup as shown:', error);
    }
  },

  // Get popup settings for user
  getPopupSettings: async (userId: string): Promise<any> => {
    try {
      const response = await api.get(`/users/${userId}/popup-settings`);
      return response.data;
    } catch (error) {
      console.error('Failed to get popup settings:', error);
      return {
        enabled: true,
        frequency: 'daily',
        maxPerDay: 3,
        categories: ['announcement', 'promotion'],
      };
    }
  },

  // Update popup settings
  updatePopupSettings: async (userId: string, settings: any): Promise<void> => {
    try {
      await api.put(`/users/${userId}/popup-settings`, settings);
    } catch (error) {
      console.error('Failed to update popup settings:', error);
    }
  },

  // Get dismissed popups (to avoid showing again)
  getDismissedPopups: async (userId: string): Promise<string[]> => {
    try {
      const dismissed = await AsyncStorage.getItem(`dismissed_popups_${userId}`);
      return dismissed ? JSON.parse(dismissed) : [];
    } catch (error) {
      console.error('Failed to get dismissed popups:', error);
      return [];
    }
  },

  // Dismiss popup
  dismissPopup: async (popupId: string, userId: string): Promise<void> => {
    try {
      const dismissed = await popupService.getDismissedPopups(userId);
      dismissed.push(popupId);
      await AsyncStorage.setItem(`dismissed_popups_${userId}`, JSON.stringify(dismissed));
    } catch (error) {
      console.error('Failed to dismiss popup:', error);
    }
  },

  // Check if popup should be shown
  shouldShowPopup: async (userId: string, userType: string): Promise<boolean> => {
    try {
      // Get user settings
      const settings = await popupService.getPopupSettings(userId);
      if (!settings.enabled) return false;

      // Check frequency limits
      const lastShown = await AsyncStorage.getItem(`last_popup_${userId}`);
      if (lastShown) {
        const lastShownDate = new Date(lastShown);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60);
        
        if (settings.frequency === 'daily' && hoursDiff < 24) return false;
        if (settings.frequency === 'weekly' && hoursDiff < 168) return false;
      }

      // Check daily limit
      const todayShown = await AsyncStorage.getItem(`popups_shown_today_${userId}`);
      if (todayShown) {
        const { date, count } = JSON.parse(todayShown);
        const today = new Date().toDateString();
        if (date === today && count >= settings.maxPerDay) return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check if popup should be shown:', error);
      return false;
    }
  },

  // Update popup show count
  updateShowCount: async (userId: string): Promise<void> => {
    try {
      const today = new Date().toDateString();
      const todayShown = await AsyncStorage.getItem(`popups_shown_today_${userId}`);
      
      if (todayShown) {
        const { date, count } = JSON.parse(todayShown);
        if (date === today) {
          await AsyncStorage.setItem(`popups_shown_today_${userId}`, JSON.stringify({
            date: today,
            count: count + 1,
          }));
        } else {
          await AsyncStorage.setItem(`popups_shown_today_${userId}`, JSON.stringify({
            date: today,
            count: 1,
          }));
        }
      } else {
        await AsyncStorage.setItem(`popups_shown_today_${userId}`, JSON.stringify({
          date: today,
          count: 1,
        }));
      }

      await AsyncStorage.setItem(`last_popup_${userId}`, new Date().toISOString());
    } catch (error) {
      console.error('Failed to update show count:', error);
    }
  },
}; 