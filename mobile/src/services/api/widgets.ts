import { api } from './index';
import { WidgetType } from '../../types/home';

export interface WidgetFilters {
  category?: string;
  enabled?: boolean;
  circleId?: string;
  userId?: string;
}

export interface WidgetConfiguration {
  widgetId: string;
  userId: string;
  circleId?: string;
  enabled: boolean;
  position: number;
  settings: Record<string, any>;
}

export interface WidgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  order: number;
}

export const widgetApi = {
  // Get widget types
  getWidgetTypes: async (filters?: WidgetFilters): Promise<{ success: boolean; widgets: WidgetType[] }> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.enabled !== undefined) params.append('enabled', filters.enabled.toString());
    if (filters?.circleId) params.append('circleId', filters.circleId);
    if (filters?.userId) params.append('userId', filters.userId);

    const response = await api.get(`/widgets/types?${params.toString()}`);
    return response.data;
  },

  // Get widget categories
  getWidgetCategories: async (): Promise<{ success: boolean; categories: WidgetCategory[] }> => {
    const response = await api.get('/widgets/categories');
    return response.data;
  },

  // Get user widget configuration
  getUserWidgetConfiguration: async (userId: string, circleId?: string): Promise<{ success: boolean; configurations: WidgetConfiguration[] }> => {
    const params = circleId ? `?circleId=${circleId}` : '';
    const response = await api.get(`/widgets/users/${userId}/configuration${params}`);
    return response.data;
  },

  // Update widget configuration
  updateWidgetConfiguration: async (configuration: WidgetConfiguration): Promise<{ success: boolean; configuration: WidgetConfiguration }> => {
    const response = await api.put('/widgets/configuration', configuration);
    return response.data;
  },

  // Enable widget
  enableWidget: async (widgetId: string, userId: string, circleId?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/widgets/enable', {
      widgetId,
      userId,
      circleId
    });
    return response.data;
  },

  // Disable widget
  disableWidget: async (widgetId: string, userId: string, circleId?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/widgets/disable', {
      widgetId,
      userId,
      circleId
    });
    return response.data;
  },

  // Reorder widgets
  reorderWidgets: async (userId: string, widgetIds: string[], circleId?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/widgets/reorder', {
      userId,
      widgetIds,
      circleId
    });
    return response.data;
  },

  // Get widget data
  getWidgetData: async (widgetId: string, userId: string, circleId?: string): Promise<{ success: boolean; data: any }> => {
    const params = new URLSearchParams();
    params.append('userId', userId);
    if (circleId) params.append('circleId', circleId);

    const response = await api.get(`/widgets/${widgetId}/data?${params.toString()}`);
    return response.data;
  },

  // Update widget settings
  updateWidgetSettings: async (widgetId: string, userId: string, settings: Record<string, any>, circleId?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/widgets/${widgetId}/settings`, {
      userId,
      settings,
      circleId
    });
    return response.data;
  }
};

