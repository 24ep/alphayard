import { api } from '../api/apiClient';
import { RecentlyUsedApp } from '../../types/home';

export interface RecentlyUsedFilters {
  userId?: string;
  familyId?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface AppUsageRecord {
  appId: string;
  appName: string;
  category: string;
  icon: string;
  lastUsed: string;
  usageCount: number;
  totalTimeSpent: number; // in minutes
  userId: string;
  familyId?: string;
}

export interface AppCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}

class RecentlyUsedService {
  private baseUrl = '/apps/recently-used';

  async getRecentlyUsedApps(filters?: RecentlyUsedFilters): Promise<RecentlyUsedApp[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.familyId) params.append('familyId', filters.familyId);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      return response.data.apps || [];
    } catch (error) {
      console.error('Error fetching recently used apps:', error);
      return [];
    }
  }

  async recordAppUsage(appData: {
    appId: string;
    appName: string;
    category: string;
    icon: string;
    userId: string;
    familyId?: string;
    timeSpent?: number; // in minutes
  }): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/usage`, appData);
    } catch (error) {
      console.error('Error recording app usage:', error);
      // Don't throw error for usage tracking failures
    }
  }

  async getAppUsageStats(userId?: string, familyId?: string, days: number = 30): Promise<{
    totalApps: number;
    totalTimeSpent: number;
    mostUsedApps: AppUsageRecord[];
    byCategory: Record<string, number>;
    dailyUsage: Array<{ date: string; timeSpent: number; appCount: number }>;
  }> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (familyId) params.append('familyId', familyId);
      params.append('days', days.toString());

      const response = await api.get(`${this.baseUrl}/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching app usage stats:', error);
      return {
        totalApps: 0,
        totalTimeSpent: 0,
        mostUsedApps: [],
        byCategory: {},
        dailyUsage: []
      };
    }
  }

  async getAppCategories(): Promise<AppCategory[]> {
    try {
      const response = await api.get(`${this.baseUrl}/categories`);
      return response.data.categories || [];
    } catch (error) {
      console.error('Error fetching app categories:', error);
      // Return default categories if API fails
      return [
        { id: 'media', name: 'Media', icon: 'image', color: '#4F46E5', order: 1 },
        { id: 'productivity', name: 'Productivity', icon: 'briefcase', color: '#10B981', order: 2 },
        { id: 'storage', name: 'Storage', icon: 'folder', color: '#F59E0B', order: 3 },
        { id: 'communication', name: 'Communication', icon: 'message', color: '#EF4444', order: 4 },
        { id: 'entertainment', name: 'Entertainment', icon: 'play', color: '#8B5CF6', order: 5 },
        { id: 'health', name: 'Health', icon: 'heart', color: '#06B6D4', order: 6 },
        { id: 'finance', name: 'Finance', icon: 'wallet', color: '#84CC16', order: 7 },
        { id: 'education', name: 'Education', icon: 'book', color: '#F97316', order: 8 }
      ];
    }
  }

  async getMostUsedApps(userId?: string, familyId?: string, limit: number = 10): Promise<AppUsageRecord[]> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (familyId) params.append('familyId', familyId);
      params.append('limit', limit.toString());

      const response = await api.get(`${this.baseUrl}/most-used?${params.toString()}`);
      return response.data.apps || [];
    } catch (error) {
      console.error('Error fetching most used apps:', error);
      return [];
    }
  }

  async clearUsageHistory(userId?: string, familyId?: string): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (familyId) params.append('familyId', familyId);

      await api.delete(`${this.baseUrl}/history?${params.toString()}`);
    } catch (error) {
      console.error('Error clearing usage history:', error);
      throw error;
    }
  }

  async getAppRecommendations(userId?: string, familyId?: string): Promise<RecentlyUsedApp[]> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (familyId) params.append('familyId', familyId);

      const response = await api.get(`${this.baseUrl}/recommendations?${params.toString()}`);
      return response.data.apps || [];
    } catch (error) {
      console.error('Error fetching app recommendations:', error);
      return [];
    }
  }

  async getFamilyAppUsage(familyId: string, days: number = 7): Promise<{
    familyStats: {
      totalApps: number;
      totalTimeSpent: number;
      mostActiveUser: string;
    };
    memberStats: Array<{
      userId: string;
      userName: string;
      appCount: number;
      timeSpent: number;
      mostUsedApp: string;
    }>;
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/family/${familyId}/usage?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching family app usage:', error);
      return {
        familyStats: {
          totalApps: 0,
          totalTimeSpent: 0,
          mostActiveUser: ''
        },
        memberStats: []
      };
    }
  }

  async trackAppLaunch(appId: string, appName: string, category: string, icon: string, userId: string, familyId?: string): Promise<void> {
    try {
      await this.recordAppUsage({
        appId,
        appName,
        category,
        icon,
        userId,
        familyId
      });
    } catch (error) {
      console.error('Error tracking app launch:', error);
    }
  }

  async trackAppClose(appId: string, userId: string, timeSpent: number): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/close`, {
        appId,
        userId,
        timeSpent
      });
    } catch (error) {
      console.error('Error tracking app close:', error);
    }
  }
}

export const recentlyUsedService = new RecentlyUsedService();
