import { api } from '../api';
import { CircleStatusMember } from '../../types/circle';
import { CircleStatusFilters, CircleStatusUpdate, CircleLocationUpdate } from '../api/circleStatus';
export type { CircleStatusFilters, CircleStatusUpdate, CircleLocationUpdate };

export class CircleStatusService {
  private baseUrl = '/circles/status';

  async getCircleMembers(circleId: string): Promise<CircleStatusMember[]> {
    try {
      const response = await api.get(`${this.baseUrl}/circles/${circleId}/members`);
      return response.data.members || [];
    } catch (error) {
      console.error('Error fetching circle members:', error);
      return [];
    }
  }

  async getMemberStatus(memberId: string): Promise<CircleStatusMember | null> {
    try {
      const response = await api.get(`${this.baseUrl}/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching member status:', error);
      return null;
    }
  }

  async updateMemberStatus(update: CircleStatusUpdate): Promise<CircleStatusMember> {
    try {
      const response = await api.put(`${this.baseUrl}/members/${update.memberId}`, update);
      return response.data;
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  }

  async updateMemberLocation(locationUpdate: CircleLocationUpdate): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/members/${locationUpdate.memberId}/location`, locationUpdate);
    } catch (error) {
      console.error('Error updating member location:', error);
      throw error;
    }
  }

  async getCircleLocations(circleId: string): Promise<CircleLocationUpdate[]> {
    try {
      const response = await api.get(`${this.baseUrl}/circles/${circleId}/locations`);
      return response.data.locations || [];
    } catch (error) {
      console.error('Error fetching circle locations:', error);
      return [];
    }
  }

  async getEmergencyStatus(circleId: string): Promise<CircleStatusMember[]> {
    try {
      const response = await api.get(`${this.baseUrl}/circles/${circleId}/emergency`);
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

  async subscribeToCircleUpdates(circleId: string, callback: (data: any) => void): Promise<() => void> {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll implement a polling mechanism
    const interval = setInterval(async () => {
      try {
        const members = await this.getCircleMembers(circleId);
        callback({ type: 'members_update', data: members });
      } catch (error) {
        console.error('Error in circle updates subscription:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
}

export const circleStatusService = new CircleStatusService();
