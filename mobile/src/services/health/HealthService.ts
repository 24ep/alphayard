import { apiClient } from '../api/apiClient';
import { analyticsService } from '../analytics/AnalyticsService';

export interface HealthRecord {
  id: string;
  userId: string;
  familyId: string;
  type: 'medication' | 'appointment' | 'symptom' | 'vital' | 'allergy' | 'vaccination' | 'test' | 'procedure';
  title: string;
  description?: string;
  value?: string;
  unit?: string;
  date: Date;
  doctor?: string;
  location?: string;
  notes?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  nextDate?: Date;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthGoal {
  id: string;
  userId: string;
  familyId: string;
  title: string;
  description?: string;
  type: 'fitness' | 'nutrition' | 'mental' | 'medical' | 'lifestyle';
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  targetDate?: Date;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  milestones: Array<{
    id: string;
    title: string;
    targetValue: number;
    achieved: boolean;
    achievedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationSchedule {
  id: string;
  userId: string;
  familyId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
  reminders: boolean;
  reminderTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthStats {
  totalRecords: number;
  activeMedications: number;
  upcomingAppointments: number;
  completedGoals: number;
  activeGoals: number;
  averageHealthScore: number;
  lastCheckup: Date;
  nextCheckup?: Date;
}

class HealthService {
  async getHealthRecords(userId: string, familyId: string): Promise<HealthRecord[]> {
    try {
      const response = await apiClient.get(`/health/records?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get health records:', error);
      throw error;
    }
  }

  async getHealthRecord(recordId: string): Promise<HealthRecord> {
    try {
      const response = await apiClient.get(`/health/records/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get health record:', error);
      throw error;
    }
  }

  async createHealthRecord(record: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthRecord> {
    try {
      const response = await apiClient.post('/health/records', record);
      
      analyticsService.trackEvent('health_record_created', {
        recordType: record.type,
        priority: record.priority,
        userId: record.userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create health record:', error);
      throw error;
    }
  }

  async updateHealthRecord(recordId: string, updates: Partial<HealthRecord>): Promise<HealthRecord> {
    try {
      const response = await apiClient.put(`/health/records/${recordId}`, updates);
      
      analyticsService.trackEvent('health_record_updated', {
        recordId,
        recordType: updates.type,
        userId: updates.userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update health record:', error);
      throw error;
    }
  }

  async deleteHealthRecord(recordId: string): Promise<void> {
    try {
      await apiClient.delete(`/health/records/${recordId}`);
      
      analyticsService.trackEvent('health_record_deleted', {
        recordId
      });
    } catch (error) {
      console.error('Failed to delete health record:', error);
      throw error;
    }
  }

  async getHealthGoals(userId: string, familyId: string): Promise<HealthGoal[]> {
    try {
      const response = await apiClient.get(`/health/goals?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get health goals:', error);
      throw error;
    }
  }

  async createHealthGoal(goal: Omit<HealthGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthGoal> {
    try {
      const response = await apiClient.post('/health/goals', goal);
      
      analyticsService.trackEvent('health_goal_created', {
        goalType: goal.type,
        userId: goal.userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create health goal:', error);
      throw error;
    }
  }

  async updateHealthGoal(goalId: string, updates: Partial<HealthGoal>): Promise<HealthGoal> {
    try {
      const response = await apiClient.put(`/health/goals/${goalId}`, updates);
      
      analyticsService.trackEvent('health_goal_updated', {
        goalId,
        progress: updates.progress,
        status: updates.status
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update health goal:', error);
      throw error;
    }
  }

  async deleteHealthGoal(goalId: string): Promise<void> {
    try {
      await apiClient.delete(`/health/goals/${goalId}`);
      
      analyticsService.trackEvent('health_goal_deleted', {
        goalId
      });
    } catch (error) {
      console.error('Failed to delete health goal:', error);
      throw error;
    }
  }

  async getMedicationSchedules(userId: string, familyId: string): Promise<MedicationSchedule[]> {
    try {
      const response = await apiClient.get(`/health/medications?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get medication schedules:', error);
      throw error;
    }
  }

  async createMedicationSchedule(schedule: Omit<MedicationSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicationSchedule> {
    try {
      const response = await apiClient.post('/health/medications', schedule);
      
      analyticsService.trackEvent('medication_schedule_created', {
        medicationName: schedule.medicationName,
        userId: schedule.userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create medication schedule:', error);
      throw error;
    }
  }

  async updateMedicationSchedule(scheduleId: string, updates: Partial<MedicationSchedule>): Promise<MedicationSchedule> {
    try {
      const response = await apiClient.put(`/health/medications/${scheduleId}`, updates);
      
      analyticsService.trackEvent('medication_schedule_updated', {
        scheduleId,
        isActive: updates.isActive
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update medication schedule:', error);
      throw error;
    }
  }

  async deleteMedicationSchedule(scheduleId: string): Promise<void> {
    try {
      await apiClient.delete(`/health/medications/${scheduleId}`);
      
      analyticsService.trackEvent('medication_schedule_deleted', {
        scheduleId
      });
    } catch (error) {
      console.error('Failed to delete medication schedule:', error);
      throw error;
    }
  }

  async getHealthStats(userId: string, familyId: string): Promise<HealthStats> {
    try {
      const response = await apiClient.get(`/health/stats?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get health stats:', error);
      throw error;
    }
  }

  async searchHealthRecords(query: string, userId: string, familyId: string): Promise<HealthRecord[]> {
    try {
      const response = await apiClient.get(`/health/search?q=${encodeURIComponent(query)}&userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search health records:', error);
      throw error;
    }
  }

  async getUpcomingAppointments(userId: string, familyId: string, days: number = 30): Promise<HealthRecord[]> {
    try {
      const response = await apiClient.get(`/health/appointments/upcoming?userId=${userId}&familyId=${familyId}&days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get upcoming appointments:', error);
      throw error;
    }
  }

  async getActiveMedications(userId: string, familyId: string): Promise<MedicationSchedule[]> {
    try {
      const response = await apiClient.get(`/health/medications/active?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get active medications:', error);
      throw error;
    }
  }

  async markMedicationTaken(scheduleId: string, takenAt: Date = new Date()): Promise<void> {
    try {
      await apiClient.post(`/health/medications/${scheduleId}/taken`, { takenAt });
      
      analyticsService.trackEvent('medication_taken', {
        scheduleId,
        takenAt
      });
    } catch (error) {
      console.error('Failed to mark medication as taken:', error);
      throw error;
    }
  }

  async getMedicationHistory(scheduleId: string, days: number = 30): Promise<Array<{ date: Date; taken: boolean; takenAt?: Date }>> {
    try {
      const response = await apiClient.get(`/health/medications/${scheduleId}/history?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get medication history:', error);
      throw error;
    }
  }

  async exportHealthData(userId: string, familyId: string, format: 'pdf' | 'csv' | 'json' = 'pdf'): Promise<string> {
    try {
      const response = await apiClient.get(`/health/export?userId=${userId}&familyId=${familyId}&format=${format}`);
      
      analyticsService.trackEvent('health_data_exported', {
        format,
        userId
      });
      
      return response.data.downloadUrl;
    } catch (error) {
      console.error('Failed to export health data:', error);
      throw error;
    }
  }

  async shareHealthRecord(recordId: string, recipients: string[]): Promise<void> {
    try {
      await apiClient.post(`/health/records/${recordId}/share`, { recipients });
      
      analyticsService.trackEvent('health_record_shared', {
        recordId,
        recipientsCount: recipients.length
      });
    } catch (error) {
      console.error('Failed to share health record:', error);
      throw error;
    }
  }

  async getHealthTips(category?: string): Promise<Array<{ id: string; title: string; content: string; category: string }>> {
    try {
      const response = await apiClient.get(`/health/tips${category ? `?category=${category}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get health tips:', error);
      throw error;
    }
  }

  async setHealthReminder(reminder: {
    userId: string;
    familyId: string;
    type: 'medication' | 'appointment' | 'checkup' | 'exercise';
    title: string;
    message: string;
    time: string;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    isActive: boolean;
  }): Promise<void> {
    try {
      await apiClient.post('/health/reminders', reminder);
      
      analyticsService.trackEvent('health_reminder_set', {
        reminderType: reminder.type,
        frequency: reminder.frequency,
        userId: reminder.userId
      });
    } catch (error) {
      console.error('Failed to set health reminder:', error);
      throw error;
    }
  }

  async getHealthReminders(userId: string, familyId: string): Promise<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
    frequency: string;
    isActive: boolean;
    nextReminder: Date;
  }>> {
    try {
      const response = await apiClient.get(`/health/reminders?userId=${userId}&familyId=${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get health reminders:', error);
      throw error;
    }
  }
}

export const healthService = new HealthService(); 