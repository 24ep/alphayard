import { api } from './index';
import { Appointment } from '../../types/home';

export interface AppointmentFilters {
  circleId?: string;
  userId?: string;
  type?: Appointment['type'];
  dateFrom?: string;
  dateTo?: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
  limit?: number;
  offset?: number;
}

export interface CreateAppointmentRequest {
  title: string;
  time: string;
  location: string;
  type: Appointment['type'];
  attendees: string[];
  circleId: string;
  description?: string;
  duration?: number; // in minutes
  reminders?: {
    type: 'push' | 'email' | 'sms';
    minutesBefore: number;
  }[];
}

export interface UpdateAppointmentRequest {
  title?: string;
  time?: string;
  location?: string;
  type?: Appointment['type'];
  attendees?: string[];
  description?: string;
  duration?: number;
  status?: 'upcoming' | 'completed' | 'cancelled';
}

export interface AppointmentResponse {
  id: string;
  title: string;
  time: string;
  location: string;
  type: Appointment['type'];
  attendees: string[];
  circleId: string;
  description?: string;
  duration?: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reminders: {
    id: string;
    type: 'push' | 'email' | 'sms';
    minutesBefore: number;
    sent: boolean;
    sentAt?: string;
  }[];
}

export const appointmentApi = {
  // Get appointments
  getAppointments: async (filters?: AppointmentFilters): Promise<{ success: boolean; appointments: AppointmentResponse[] }> => {
    const params = new URLSearchParams();
    if (filters?.circleId) params.append('circleId', filters.circleId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string): Promise<{ success: boolean; appointment: AppointmentResponse }> => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Create appointment
  createAppointment: async (appointmentData: CreateAppointmentRequest): Promise<{ success: boolean; appointment: AppointmentResponse }> => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Update appointment
  updateAppointment: async (appointmentId: string, appointmentData: UpdateAppointmentRequest): Promise<{ success: boolean; appointment: AppointmentResponse }> => {
    const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
  },

  // Delete appointment
  deleteAppointment: async (appointmentId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Get today's appointments
  getTodaysAppointments: async (circleId?: string): Promise<{ success: boolean; appointments: AppointmentResponse[] }> => {
    const today = new Date().toISOString().split('T')[0];
    const params = new URLSearchParams();
    params.append('dateFrom', today);
    params.append('dateTo', today);
    if (circleId) params.append('circleId', circleId);

    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (circleId?: string, days: number = 7): Promise<{ success: boolean; appointments: AppointmentResponse[] }> => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const params = new URLSearchParams();
    params.append('dateFrom', today.toISOString().split('T')[0]);
    params.append('dateTo', futureDate.toISOString().split('T')[0]);
    params.append('status', 'upcoming');
    if (circleId) params.append('circleId', circleId);

    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  },

  // Mark appointment as completed
  markAppointmentCompleted: async (appointmentId: string): Promise<{ success: boolean; appointment: AppointmentResponse }> => {
    const response = await api.patch(`/appointments/${appointmentId}/complete`);
    return response.data;
  },

  // Add reminder
  addReminder: async (appointmentId: string, reminder: {
    type: 'push' | 'email' | 'sms';
    minutesBefore: number;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/appointments/${appointmentId}/reminders`, reminder);
    return response.data;
  },

  // Remove reminder
  removeReminder: async (appointmentId: string, reminderId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/appointments/${appointmentId}/reminders/${reminderId}`);
    return response.data;
  },

  // Get appointment types
  getAppointmentTypes: async (): Promise<{ success: boolean; types: string[] }> => {
    const response = await api.get('/appointments/types');
    return response.data;
  },

  // Get appointment stats
  getAppointmentStats: async (circleId?: string, dateFrom?: string, dateTo?: string): Promise<{ success: boolean; stats: any }> => {
    const params = new URLSearchParams();
    if (circleId) params.append('circleId', circleId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await api.get(`/appointments/stats?${params.toString()}`);
    return response.data;
  }
};

