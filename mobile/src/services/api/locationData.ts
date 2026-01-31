import { api } from './index';
import { LocationData } from '../../types/home';

export interface LocationFilters {
  circleId?: string;
  userId?: string;
  type?: LocationData['type'];
  isOnline?: boolean;
  limit?: number;
  offset?: number;
}

export interface LocationUpdate {
  userId: string;
  latitude: number;
  longitude: number;
  address?: string;
  type?: LocationData['type'];
  accuracy?: number;
  timestamp: string;
  batteryLevel?: number;
  isOnline?: boolean;
}

export interface LocationHistory {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
  accuracy?: number;
}

export interface LocationStats {
  totalLocations: number;
  onlineUsers: number;
  offlineUsers: number;
  byType: Record<string, number>;
  lastUpdated: string;
}

export const locationDataApi = {
  // Get locations
  getLocations: async (filters?: LocationFilters): Promise<{ success: boolean; locations: LocationData[] }> => {
    const params = new URLSearchParams();
    if (filters?.circleId) params.append('circleId', filters.circleId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isOnline !== undefined) params.append('isOnline', filters.isOnline.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await api.get(`/locations?${params.toString()}`);
    return response.data;
  },

  // Get location by ID
  getLocationById: async (locationId: string): Promise<{ success: boolean; location: LocationData }> => {
    const response = await api.get(`/locations/${locationId}`);
    return response.data;
  },

  // Update location
  updateLocation: async (locationUpdate: LocationUpdate): Promise<{ success: boolean; location: LocationData }> => {
    const response = await api.post('/locations/update', locationUpdate);
    return response.data;
  },

  // Get circle locations
  getCircleLocations: async (circleId: string): Promise<{ success: boolean; locations: LocationData[] }> => {
    const response = await api.get(`/locations/families/${circleId}`);
    return response.data;
  },

  // Get user location history
  getUserLocationHistory: async (userId: string, days: number = 7): Promise<{ success: boolean; history: LocationHistory[] }> => {
    const response = await api.get(`/locations/users/${userId}/history?days=${days}`);
    return response.data;
  },

  // Get location stats
  getLocationStats: async (circleId?: string): Promise<{ success: boolean; stats: LocationStats }> => {
    const params = circleId ? `?circleId=${circleId}` : '';
    const response = await api.get(`/locations/stats${params}`);
    return response.data;
  },

  // Get nearby locations
  getNearbyLocations: async (latitude: number, longitude: number, radius: number = 1000): Promise<{ success: boolean; locations: LocationData[] }> => {
    const response = await api.get('/locations/nearby', {
      params: {
        latitude,
        longitude,
        radius
      }
    });
    return response.data;
  },

  // Set location type
  setLocationType: async (userId: string, type: LocationData['type']): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(`/locations/users/${userId}/type`, { type });
    return response.data;
  },

  // Set online status
  setOnlineStatus: async (userId: string, isOnline: boolean): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(`/locations/users/${userId}/status`, { isOnline });
    return response.data;
  },

  // Get location types
  getLocationTypes: async (): Promise<{ success: boolean; types: string[] }> => {
    const response = await api.get('/locations/types');
    return response.data;
  },

  // Get geofence alerts
  getGeofenceAlerts: async (circleId: string): Promise<{ success: boolean; alerts: any[] }> => {
    const response = await api.get(`/locations/families/${circleId}/geofence-alerts`);
    return response.data;
  },

  // Create geofence
  createGeofence: async (geofenceData: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    circleId: string;
    notifications: {
      enter: boolean;
      exit: boolean;
    };
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/locations/geofences', geofenceData);
    return response.data;
  },

  // Get geofences
  getGeofences: async (circleId: string): Promise<{ success: boolean; geofences: any[] }> => {
    const response = await api.get(`/locations/families/${circleId}/geofences`);
    return response.data;
  },

  // Delete geofence
  deleteGeofence: async (geofenceId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/locations/geofences/${geofenceId}`);
    return response.data;
  }
};

