import { api } from './index';
import { CircleStatusMember } from '../../types/circle';

export interface CircleStatusFilters {
  circleId?: string;
  memberId?: string;
  status?: 'online' | 'offline' | 'away';
  isEmergency?: boolean;
}

export interface CircleStatusUpdate {
  memberId: string;
  status?: 'online' | 'offline' | 'away';
  location?: string;
  batteryLevel?: number;
  heartRate?: number;
  steps?: number;
  sleepHours?: number;
  isEmergency?: boolean;
}

export interface CircleLocationUpdate {
  memberId: string;
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp: string;
}

export const circleStatusApi = {
  // Get circle members status
  getCircleMembers: async (circleId: string): Promise<{ success: boolean; members: CircleStatusMember[] }> => {
    const response = await api.get(`/circles/status/circles/${circleId}/members`);
    return response.data;
  },

  // Get member status
  getMemberStatus: async (memberId: string): Promise<{ success: boolean; member: CircleStatusMember }> => {
    const response = await api.get(`/circles/status/members/${memberId}`);
    return response.data;
  },

  // Update member status
  updateMemberStatus: async (update: CircleStatusUpdate): Promise<{ success: boolean; member: CircleStatusMember }> => {
    const response = await api.put(`/circles/status/members/${update.memberId}`, update);
    return response.data;
  },

  // Update member location
  updateMemberLocation: async (locationUpdate: CircleLocationUpdate): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/circles/status/members/${locationUpdate.memberId}/location`, locationUpdate);
    return response.data;
  },

  // Get circle locations
  getCircleLocations: async (circleId: string): Promise<{ success: boolean; locations: CircleLocationUpdate[] }> => {
    const response = await api.get(`/circles/status/circles/${circleId}/locations`);
    return response.data;
  },

  // Get emergency status
  getEmergencyStatus: async (circleId: string): Promise<{ success: boolean; members: CircleStatusMember[] }> => {
    const response = await api.get(`/circles/status/circles/${circleId}/emergency`);
    return response.data;
  },

  // Send emergency alert
  sendEmergencyAlert: async (memberId: string, message?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/circles/status/members/${memberId}/emergency`, { message });
    return response.data;
  },

  // Get health metrics
  getHealthMetrics: async (memberId: string, dateFrom?: string, dateTo?: string): Promise<{ success: boolean; metrics: any }> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await api.get(`/circles/status/members/${memberId}/health?${params.toString()}`);
    return response.data;
  },

  // Update health metrics
  updateHealthMetrics: async (memberId: string, metrics: {
    heartRate?: number;
    steps?: number;
    sleepHours?: number;
    timestamp?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/circles/status/members/${memberId}/health`, metrics);
    return response.data;
  },

  // Get activity history
  getActivityHistory: async (memberId: string, days: number = 7): Promise<{ success: boolean; activities: any[] }> => {
    const response = await api.get(`/circles/status/members/${memberId}/activity?days=${days}`);
    return response.data;
  }
};
