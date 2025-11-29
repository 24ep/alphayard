import { api } from './index';
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

export const recentlyUsedApi = {
  // Get recently used apps
  getRecentlyUsedApps: async (filters?: RecentlyUsedFilters): Promise<{ success: boolean; apps: RecentlyUsedApp[] }> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.familyId) params.append('familyId', filters.familyId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await api.get(`/apps/recently-used?${params.toString()}`);
    return response.data;
  },

  // Record app usage
  recordAppUsage: async (appData: {
    appId: string;
    appName: string;
    category: string;
    icon: string;
    userId: string;
    familyId?: string;
    timeSpent?: number; // in minutes
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/apps/recently-used/usage', appData);
    return response.data;
  },

  // Get app usage stats
  getAppUsageStats: async (userId?: string, familyId?: string, days: number = 30): Promise<{ success: boolean; stats: any }> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (familyId) params.append('familyId', familyId);
    params.append('days', days.toString());

    const response = await api.get(`/apps/recently-used/stats?${params.toString()}`);
    return response.data;
  },

  // Get app categories
  getAppCategories: async (): Promise<{ success: boolean; categories: AppCategory[] }> => {
    const response = await api.get('/apps/recently-used/categories');
    return response.data;
  },

  // Get most used apps
  getMostUsedApps: async (userId?: string, familyId?: string, limit: number = 10): Promise<{ success: boolean; apps: AppUsageRecord[] }> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (familyId) params.append('familyId', familyId);
    params.append('limit', limit.toString());

    const response = await api.get(`/apps/recently-used/most-used?${params.toString()}`);
    return response.data;
  },

  // Clear usage history
  clearUsageHistory: async (userId?: string, familyId?: string): Promise<{ success: boolean; message: string }> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (familyId) params.append('familyId', familyId);

    const response = await api.delete(`/apps/recently-used/history?${params.toString()}`);
    return response.data;
  },

  // Get app recommendations
  getAppRecommendations: async (userId?: string, familyId?: string): Promise<{ success: boolean; apps: RecentlyUsedApp[] }> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (familyId) params.append('familyId', familyId);

    const response = await api.get(`/apps/recently-used/recommendations?${params.toString()}`);
    return response.data;
  },

  // Get family app usage
  getFamilyAppUsage: async (familyId: string, days: number = 7): Promise<{ success: boolean; usage: any }> => {
    const response = await api.get(`/apps/recently-used/family/${familyId}/usage?days=${days}`);
    return response.data;
  },

  // Track app launch
  trackAppLaunch: async (appId: string, appName: string, category: string, icon: string, userId: string, familyId?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/apps/recently-used/launch', {
      appId,
      appName,
      category,
      icon,
      userId,
      familyId
    });
    return response.data;
  },

  // Track app close
  trackAppClose: async (appId: string, userId: string, timeSpent: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/apps/recently-used/close', {
      appId,
      userId,
      timeSpent
    });
    return response.data;
  }
};
