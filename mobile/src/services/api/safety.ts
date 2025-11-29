import { api } from './index';

export interface SafetyAlert {
  id: string;
  userId: string;
  familyId: string;
  alertType: 'panic' | 'inactivity' | 'geofence_exit' | 'geofence_enter' | 'low_battery' | 'device_offline';
  title: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress?: string;
  metadata?: any;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SafetyStats {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  panicAlerts: number;
  inactivityAlerts: number;
  geofenceAlerts: number;
  lastAlert?: SafetyAlert;
}

export interface CreatePanicAlertRequest {
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress?: string;
  message?: string;
}

export interface CreateInactivityAlertRequest {
  inactivityDuration: number;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress?: string;
}

export interface CreateEmergencyContactRequest {
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: string;
  isPrimary?: boolean;
}

export const safetyApi = {
  // Create panic alert
  createPanicAlert: async (data: CreatePanicAlertRequest): Promise<{ success: boolean; alert: SafetyAlert }> => {
    const response = await api.post('/safety/panic', data);
    return response.data;
  },

  // Create inactivity alert
  createInactivityAlert: async (data: CreateInactivityAlertRequest): Promise<{ success: boolean; alert: SafetyAlert }> => {
    const response = await api.post('/safety/inactivity', data);
    return response.data;
  },

  // Get user's alerts
  getAlerts: async (params?: { status?: string; limit?: number; offset?: number }): Promise<{ success: boolean; alerts: SafetyAlert[]; pagination: any }> => {
    const response = await api.get('/safety/alerts', { params });
    return response.data;
  },

  // Get hourse alerts
  getFamilyAlerts: async (params?: { status?: string; limit?: number; offset?: number }): Promise<{ success: boolean; alerts: SafetyAlert[]; pagination: any }> => {
    const response = await api.get('/safety/alerts/hourse', { params });
    return response.data;
  },

  // Get active alerts
  getActiveAlerts: async (): Promise<{ success: boolean; alerts: SafetyAlert[] }> => {
    const response = await api.get('/safety/alerts/active');
    return response.data;
  },

  // Get alert by ID
  getAlert: async (alertId: string): Promise<{ success: boolean; alert: SafetyAlert }> => {
    const response = await api.get(`/safety/alerts/${alertId}`);
    return response.data;
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId: string): Promise<{ success: boolean; alert: SafetyAlert }> => {
    const response = await api.put(`/safety/alerts/${alertId}/acknowledge`);
    return response.data;
  },

  // Resolve alert
  resolveAlert: async (alertId: string): Promise<{ success: boolean; alert: SafetyAlert }> => {
    const response = await api.put(`/safety/alerts/${alertId}/resolve`);
    return response.data;
  },

  // Get emergency contacts
  getEmergencyContacts: async (): Promise<{ success: boolean; emergencyContacts: EmergencyContact[] }> => {
    const response = await api.get('/safety/emergency-contacts');
    return response.data;
  },

  // Create emergency contact
  createEmergencyContact: async (data: CreateEmergencyContactRequest): Promise<{ success: boolean; contact: EmergencyContact }> => {
    const response = await api.post('/safety/emergency-contacts', data);
    return response.data;
  },

  // Update emergency contact
  updateEmergencyContact: async (contactId: string, data: Partial<CreateEmergencyContactRequest>): Promise<{ success: boolean; contact: EmergencyContact }> => {
    const response = await api.put(`/safety/emergency-contacts/${contactId}`, data);
    return response.data;
  },

  // Delete emergency contact
  deleteEmergencyContact: async (contactId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/safety/emergency-contacts/${contactId}`);
    return response.data;
  },

  // Get safety statistics
  getSafetyStats: async (): Promise<{ success: boolean; stats: SafetyStats }> => {
    const response = await api.get('/safety/stats');
    return response.data;
  },
};
