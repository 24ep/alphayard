import { api } from './index';
import { FamilyStatusMember } from '../../types/home';

export interface FamilyStatusFilters {
  familyId?: string;
  memberId?: string;
  status?: 'online' | 'offline' | 'away';
  isEmergency?: boolean;
}

export interface FamilyStatusUpdate {
  memberId: string;
  status?: 'online' | 'offline' | 'away';
  location?: string;
  batteryLevel?: number;
  heartRate?: number;
  steps?: number;
  sleepHours?: number;
  isEmergency?: boolean;
}

export interface FamilyLocationUpdate {
  memberId: string;
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp: string;
}

export const familyStatusApi = {
  // Get family members status
  getFamilyMembers: async (familyId: string): Promise<{ success: boolean; members: FamilyStatusMember[] }> => {
    const response = await api.get(`/family/status/families/${familyId}/members`);
    return response.data;
  },

  // Get member status
  getMemberStatus: async (memberId: string): Promise<{ success: boolean; member: FamilyStatusMember }> => {
    const response = await api.get(`/family/status/members/${memberId}`);
    return response.data;
  },

  // Update member status
  updateMemberStatus: async (update: FamilyStatusUpdate): Promise<{ success: boolean; member: FamilyStatusMember }> => {
    const response = await api.put(`/family/status/members/${update.memberId}`, update);
    return response.data;
  },

  // Update member location
  updateMemberLocation: async (locationUpdate: FamilyLocationUpdate): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/family/status/members/${locationUpdate.memberId}/location`, locationUpdate);
    return response.data;
  },

  // Get family locations
  getFamilyLocations: async (familyId: string): Promise<{ success: boolean; locations: FamilyLocationUpdate[] }> => {
    const response = await api.get(`/family/status/families/${familyId}/locations`);
    return response.data;
  },

  // Get emergency status
  getEmergencyStatus: async (familyId: string): Promise<{ success: boolean; members: FamilyStatusMember[] }> => {
    const response = await api.get(`/family/status/families/${familyId}/emergency`);
    return response.data;
  },

  // Send emergency alert
  sendEmergencyAlert: async (memberId: string, message?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/family/status/members/${memberId}/emergency`, { message });
    return response.data;
  },

  // Get health metrics
  getHealthMetrics: async (memberId: string, dateFrom?: string, dateTo?: string): Promise<{ success: boolean; metrics: any }> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await api.get(`/family/status/members/${memberId}/health?${params.toString()}`);
    return response.data;
  },

  // Update health metrics
  updateHealthMetrics: async (memberId: string, metrics: {
    heartRate?: number;
    steps?: number;
    sleepHours?: number;
    timestamp?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/family/status/members/${memberId}/health`, metrics);
    return response.data;
  },

  // Get activity history
  getActivityHistory: async (memberId: string, days: number = 7): Promise<{ success: boolean; activities: any[] }> => {
    const response = await api.get(`/family/status/members/${memberId}/activity?days=${days}`);
    return response.data;
  }
};
