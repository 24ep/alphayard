import { api } from '../api/apiClient';
import { FamilyStatusMember, FamilyMember } from '../../types/home';

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

class FamilyStatusService {
  private baseUrl = '/family/status';

  async getFamilyMembers(familyId: string): Promise<FamilyStatusMember[]> {
    try {
      const response = await api.get(`${this.baseUrl}/families/${familyId}/members`);
      return response.data.members || [];
    } catch (error) {
      console.error('Error fetching family members:', error);
      return [];
    }
  }

  async getMemberStatus(memberId: string): Promise<FamilyStatusMember | null> {
    try {
      const response = await api.get(`${this.baseUrl}/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching member status:', error);
      return null;
    }
  }

  async updateMemberStatus(update: FamilyStatusUpdate): Promise<FamilyStatusMember> {
    try {
      const response = await api.put(`${this.baseUrl}/members/${update.memberId}`, update);
      return response.data;
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  }

  async updateMemberLocation(locationUpdate: FamilyLocationUpdate): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/members/${locationUpdate.memberId}/location`, locationUpdate);
    } catch (error) {
      console.error('Error updating member location:', error);
      throw error;
    }
  }

  async getFamilyLocations(familyId: string): Promise<FamilyLocationUpdate[]> {
    try {
      const response = await api.get(`${this.baseUrl}/families/${familyId}/locations`);
      return response.data.locations || [];
    } catch (error) {
      console.error('Error fetching family locations:', error);
      return [];
    }
  }

  async getEmergencyStatus(familyId: string): Promise<FamilyStatusMember[]> {
    try {
      const response = await api.get(`${this.baseUrl}/families/${familyId}/emergency`);
      return response.data.members || [];
    } catch (error) {
      console.error('Error fetching emergency status:', error);
      return [];
    }
  }

  async sendEmergencyAlert(memberId: string, message?: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/members/${memberId}/emergency`, { message });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      throw error;
    }
  }

  async getHealthMetrics(memberId: string, dateFrom?: string, dateTo?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await api.get(`${this.baseUrl}/members/${memberId}/health?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      return null;
    }
  }

  async updateHealthMetrics(memberId: string, metrics: {
    heartRate?: number;
    steps?: number;
    sleepHours?: number;
    timestamp?: string;
  }): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/members/${memberId}/health`, metrics);
    } catch (error) {
      console.error('Error updating health metrics:', error);
      throw error;
    }
  }

  async getActivityHistory(memberId: string, days: number = 7): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/members/${memberId}/activity?days=${days}`);
      return response.data.activities || [];
    } catch (error) {
      console.error('Error fetching activity history:', error);
      return [];
    }
  }

  async subscribeToFamilyUpdates(familyId: string, callback: (data: any) => void): Promise<() => void> {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll implement a polling mechanism
    const interval = setInterval(async () => {
      try {
        const members = await this.getFamilyMembers(familyId);
        callback({ type: 'members_update', data: members });
      } catch (error) {
        console.error('Error in family updates subscription:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
}

export const familyStatusService = new FamilyStatusService();
