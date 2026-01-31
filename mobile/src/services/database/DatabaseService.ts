/**
 * Database Service - Refactored to use Backend API
 * All data operations now go through the backend API instead of direct Supabase access
 */

import { apiClient } from '../api/apiClient';

export interface Circle {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members?: User[];
}

export interface Message {
  id: string;
  senderId: string;
  circleId: string;
  content: string;
  messageType: 'text' | 'image' | 'location' | 'emergency';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

export interface LocationPoint {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface SafetyAlert {
  id: string;
  userId: string;
  alertType: 'emergency' | 'check-in' | 'geofence' | 'manual';
  locationLat?: number;
  locationLng?: number;
  status: 'active' | 'resolved' | 'false_alarm';
  metadata?: any;
  createdAt: string;
  resolvedAt?: string;
  user?: User;
}

export interface Geofence {
  id: string;
  circleId: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      push: boolean;
      email: boolean;
      sms: boolean;
    };
    privacy: {
      locationSharing: boolean;
      profileVisibility: 'public' | 'Circle' | 'private';
      dataSharing: boolean;
    };
  };
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
  circleId?: string;
  circleRole?: 'admin' | 'member';
  emergencyContacts: Array<{
    id: string;
    name: string;
    phoneNumber: string;
    relationship: string;
    isPrimary: boolean;
  }>;
  createdAt: string;
  lastActiveAt: string;
}

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Circle Operations
  async createCircle(name: string, description?: string): Promise<Circle> {
    try {
      const response = await apiClient.post('/circles', { name, description });
      return this.mapCircleData(response.data);
    } catch (error) {
      console.error('Create Circle error:', error);
      throw error;
    }
  }

  async getCircle(circleId: string): Promise<Circle | null> {
    try {
      const response = await apiClient.get(`/circles/${circleId}`);
      if (!response.data) return null;
      return this.mapCircleData(response.data);
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') return null;
      console.error('Get Circle error:', error);
      throw error;
    }
  }

  async getUserCircle(): Promise<Circle | null> {
    try {
      const response = await apiClient.get('/circles/my');
      if (!response.data) return null;
      return this.mapCircleData(response.data);
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') return null;
      console.error('Get user Circle error:', error);
      throw error;
    }
  }

  async updateCircle(circleId: string, updates: Partial<Circle>): Promise<Circle> {
    try {
      const response = await apiClient.put(`/circles/${circleId}`, {
        name: updates.name,
        description: updates.description,
      });
      return this.mapCircleData(response.data);
    } catch (error) {
      console.error('Update Circle error:', error);
      throw error;
    }
  }

  async deleteCircle(circleId: string): Promise<void> {
    try {
      await apiClient.delete(`/circles/${circleId}`);
    } catch (error) {
      console.error('Delete Circle error:', error);
      throw error;
    }
  }

  // Message Operations
  async sendMessage(circleId: string, content: string, messageType: Message['messageType'] = 'text', metadata?: any): Promise<Message> {
    try {
      const response = await apiClient.post('/chat/messages', {
        circleId,
        content,
        messageType,
        metadata,
      });
      return this.mapMessageData(response.data);
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async getCircleMessages(circleId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    try {
      const response = await apiClient.get(`/chat/messages?circleId=${circleId}&limit=${limit}&offset=${offset}`);
      return (response.data || []).map((msg: any) => this.mapMessageData(msg));
    } catch (error) {
      console.error('Get Circle messages error:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await apiClient.delete(`/chat/messages/${messageId}`);
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  }

  // Location Operations
  async saveLocation(latitude: number, longitude: number, accuracy?: number): Promise<LocationPoint> {
    try {
      const response = await apiClient.post('/location', {
        latitude,
        longitude,
        accuracy,
      });
      return this.mapLocationData(response.data);
    } catch (error) {
      console.error('Save location error:', error);
      throw error;
    }
  }

  async getLocationHistory(userId: string, limit: number = 100): Promise<LocationPoint[]> {
    try {
      const response = await apiClient.get(`/location/history?userId=${userId}&limit=${limit}`);
      return (response.data || []).map((loc: any) => this.mapLocationData(loc));
    } catch (error) {
      console.error('Get location history error:', error);
      throw error;
    }
  }

  async getCircleLocations(circleId: string): Promise<LocationPoint[]> {
    try {
      const response = await apiClient.get(`/location/circle/${circleId}`);
      return (response.data || []).map((loc: any) => this.mapLocationData(loc));
    } catch (error) {
      console.error('Get Circle locations error:', error);
      throw error;
    }
  }

  // Safety Alert Operations
  async createSafetyAlert(alertType: SafetyAlert['alertType'], locationLat?: number, locationLng?: number, metadata?: any): Promise<SafetyAlert> {
    try {
      const response = await apiClient.post('/safety/alerts', {
        alertType,
        locationLat,
        locationLng,
        metadata,
      });
      return this.mapSafetyAlertData(response.data);
    } catch (error) {
      console.error('Create safety alert error:', error);
      throw error;
    }
  }

  async getSafetyAlerts(circleId?: string, status?: SafetyAlert['status']): Promise<SafetyAlert[]> {
    try {
      let url = '/safety/alerts?';
      if (circleId) url += `circleId=${circleId}&`;
      if (status) url += `status=${status}&`;
      
      const response = await apiClient.get(url);
      return (response.data || []).map((alert: any) => this.mapSafetyAlertData(alert));
    } catch (error) {
      console.error('Get safety alerts error:', error);
      throw error;
    }
  }

  async resolveSafetyAlert(alertId: string): Promise<void> {
    try {
      await apiClient.put(`/safety/alerts/${alertId}/resolve`);
    } catch (error) {
      console.error('Resolve safety alert error:', error);
      throw error;
    }
  }

  // Geofence Operations
  async createGeofence(name: string, centerLat: number, centerLng: number, radiusMeters: number): Promise<Geofence> {
    try {
      const response = await apiClient.post('/safety/geofences', {
        name,
        centerLat,
        centerLng,
        radiusMeters,
      });
      return this.mapGeofenceData(response.data);
    } catch (error) {
      console.error('Create geofence error:', error);
      throw error;
    }
  }

  async getCircleGeofences(circleId: string): Promise<Geofence[]> {
    try {
      const response = await apiClient.get(`/safety/geofences?circleId=${circleId}`);
      return (response.data || []).map((geo: any) => this.mapGeofenceData(geo));
    } catch (error) {
      console.error('Get Circle geofences error:', error);
      throw error;
    }
  }

  async updateGeofence(geofenceId: string, updates: Partial<Geofence>): Promise<Geofence> {
    try {
      const response = await apiClient.put(`/safety/geofences/${geofenceId}`, {
        name: updates.name,
        centerLat: updates.centerLat,
        centerLng: updates.centerLng,
        radiusMeters: updates.radiusMeters,
        isActive: updates.isActive,
      });
      return this.mapGeofenceData(response.data);
    } catch (error) {
      console.error('Update geofence error:', error);
      throw error;
    }
  }

  async deleteGeofence(geofenceId: string): Promise<void> {
    try {
      await apiClient.delete(`/safety/geofences/${geofenceId}`);
    } catch (error) {
      console.error('Delete geofence error:', error);
      throw error;
    }
  }

  // Emergency Contact Operations
  async addEmergencyContact(name: string, phoneNumber: string, relationship: string, isPrimary: boolean = false): Promise<void> {
    try {
      await apiClient.post('/users/emergency-contacts', {
        name,
        phoneNumber,
        relationship,
        isPrimary,
      });
    } catch (error) {
      console.error('Add emergency contact error:', error);
      throw error;
    }
  }

  async getEmergencyContacts(): Promise<Array<{
    id: string;
    name: string;
    phoneNumber: string;
    relationship: string;
    isPrimary: boolean;
  }>> {
    try {
      const response = await apiClient.get('/users/emergency-contacts');
      return response.data || [];
    } catch (error) {
      console.error('Get emergency contacts error:', error);
      throw error;
    }
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/emergency-contacts/${contactId}`);
    } catch (error) {
      console.error('Delete emergency contact error:', error);
      throw error;
    }
  }

  // Data Mapping Functions
  private mapCircleData(data: any): Circle {
    if (!data) return data;
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdBy: data.created_by || data.createdBy,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
      members: data.users?.map((u: any) => this.mapUserData(u)) || data.members || [],
    };
  }

  private mapMessageData(data: any): Message {
    if (!data) return data;
    return {
      id: data.id,
      senderId: data.sender_id || data.senderId,
      circleId: data.circle_id || data.circleId,
      content: data.content,
      messageType: data.message_type || data.messageType,
      metadata: data.metadata,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
      sender: data.sender ? this.mapUserData(data.sender) : undefined,
    };
  }

  private mapLocationData(data: any): LocationPoint {
    if (!data) return data;
    return {
      id: data.id,
      userId: data.user_id || data.userId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      timestamp: data.timestamp,
    };
  }

  private mapSafetyAlertData(data: any): SafetyAlert {
    if (!data) return data;
    return {
      id: data.id,
      userId: data.user_id || data.userId,
      alertType: data.alert_type || data.alertType,
      locationLat: data.location_lat || data.locationLat,
      locationLng: data.location_lng || data.locationLng,
      status: data.status,
      metadata: data.metadata,
      createdAt: data.created_at || data.createdAt,
      resolvedAt: data.resolved_at || data.resolvedAt,
      user: data.user ? this.mapUserData(data.user) : undefined,
    };
  }

  private mapGeofenceData(data: any): Geofence {
    if (!data) return data;
    return {
      id: data.id,
      circleId: data.circle_id || data.circleId,
      name: data.name,
      centerLat: data.center_lat || data.centerLat,
      centerLng: data.center_lng || data.centerLng,
      radiusMeters: data.radius_meters || data.radiusMeters,
      isActive: data.is_active ?? data.isActive ?? true,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
    };
  }

  private mapUserData(data: any): User {
    if (!data) return data;
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name || data.firstName,
      lastName: data.last_name || data.lastName,
      phoneNumber: data.phone_number || data.phoneNumber,
      avatar: data.avatar_url || data.avatar,
      dateOfBirth: data.date_of_birth || data.dateOfBirth,
      gender: data.gender,
      bio: data.bio,
      preferences: data.preferences || {
        language: 'en',
        theme: 'auto',
        notifications: { push: true, email: true, sms: false },
        privacy: { locationSharing: true, profileVisibility: 'Circle', dataSharing: false }
      },
      subscription: data.subscription,
      circleId: data.circle_id || data.circleId,
      circleRole: data.circle_role || data.circleRole,
      emergencyContacts: data.emergency_contacts || data.emergencyContacts || [],
      createdAt: data.created_at || data.createdAt,
      lastActiveAt: data.last_active_at || data.lastActiveAt,
    };
  }
}

export default DatabaseService.getInstance();
