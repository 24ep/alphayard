import { supabase } from '../../config/supabase';
import { Tables } from '../../config/supabase';

export interface hourse {
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
  familyId: string;
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
  familyId: string;
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
      profileVisibility: 'public' | 'hourse' | 'private';
      dataSharing: boolean;
    };
  };
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
  familyId?: string;
  familyRole?: 'admin' | 'member';
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

  // hourse Operations
  async createFamily(name: string, description?: string): Promise<hourse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('families')
        .insert({
          name,
          description,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Update user's family_id and role
      await supabase
        .from('users')
        .update({
          family_id: data.id,
          family_role: 'admin',
        })
        .eq('id', user.id);

      return this.mapFamilyData(data);
    } catch (error) {
      console.error('Create hourse error:', error);
      throw error;
    }
  }

  async getFamily(familyId: string): Promise<hourse | null> {
    try {
      const { data, error } = await supabase
        .from('families')
        .select(`
          *,
          users (
            id,
            email,
            first_name,
            last_name,
            phone_number,
            avatar_url,
            family_role,
            last_active_at
          )
        `)
        .eq('id', familyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw new Error(error.message);
      }

      return this.mapFamilyData(data);
    } catch (error) {
      console.error('Get hourse error:', error);
      throw error;
    }
  }

  async getUserFamily(): Promise<hourse | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('family_id')
        .eq('id', user.id)
        .single();

      if (!userData?.family_id) return null;

      return await this.getFamily(userData.family_id);
    } catch (error) {
      console.error('Get user hourse error:', error);
      throw error;
    }
  }

  async updateFamily(familyId: string, updates: Partial<hourse>): Promise<hourse> {
    try {
      const { data, error } = await supabase
        .from('families')
        .update({
          name: updates.name,
          description: updates.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', familyId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return this.mapFamilyData(data);
    } catch (error) {
      console.error('Update hourse error:', error);
      throw error;
    }
  }

  async deleteFamily(familyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('families')
        .delete()
        .eq('id', familyId);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Delete hourse error:', error);
      throw error;
    }
  }

  // Message Operations
  async sendMessage(familyId: string, content: string, messageType: Message['messageType'] = 'text', metadata?: any): Promise<Message> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          family_id: familyId,
          content,
          message_type: messageType,
          metadata,
        })
        .select(`
          *,
          users!messages_sender_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw new Error(error.message);

      return this.mapMessageData(data);
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async getFamilyMessages(familyId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          users!messages_sender_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw new Error(error.message);

      return data.map(this.mapMessageData);
    } catch (error) {
      console.error('Get hourse messages error:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  }

  // Location Operations
  async saveLocation(latitude: number, longitude: number, accuracy?: number): Promise<LocationPoint> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('location_history')
        .insert({
          user_id: user.id,
          latitude,
          longitude,
          accuracy,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return this.mapLocationData(data);
    } catch (error) {
      console.error('Save location error:', error);
      throw error;
    }
  }

  async getLocationHistory(userId: string, limit: number = 100): Promise<LocationPoint[]> {
    try {
      const { data, error } = await supabase
        .from('location_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);

      return data.map(this.mapLocationData);
    } catch (error) {
      console.error('Get location history error:', error);
      throw error;
    }
  }

  async getFamilyLocations(familyId: string): Promise<LocationPoint[]> {
    try {
      const { data, error } = await supabase
        .from('location_history')
        .select(`
          *,
          users!location_history_user_id_fkey (
            id,
            first_name,
            last_name,
            family_id
          )
        `)
        .eq('users.family_id', familyId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);

      return data.map(this.mapLocationData);
    } catch (error) {
      console.error('Get hourse locations error:', error);
      throw error;
    }
  }

  // Safety Alert Operations
  async createSafetyAlert(alertType: SafetyAlert['alertType'], locationLat?: number, locationLng?: number, metadata?: any): Promise<SafetyAlert> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('safety_alerts')
        .insert({
          user_id: user.id,
          alert_type: alertType,
          location_lat: locationLat,
          location_lng: locationLng,
          metadata,
        })
        .select(`
          *,
          users!safety_alerts_user_id_fkey (
            id,
            first_name,
            last_name,
            phone_number
          )
        `)
        .single();

      if (error) throw new Error(error.message);

      return this.mapSafetyAlertData(data);
    } catch (error) {
      console.error('Create safety alert error:', error);
      throw error;
    }
  }

  async getSafetyAlerts(familyId?: string, status?: SafetyAlert['status']): Promise<SafetyAlert[]> {
    try {
      let query = supabase
        .from('safety_alerts')
        .select(`
          *,
          users!safety_alerts_user_id_fkey (
            id,
            first_name,
            last_name,
            phone_number,
            family_id
          )
        `)
        .order('created_at', { ascending: false });

      if (familyId) {
        query = query.eq('users.family_id', familyId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.limit(50);

      if (error) throw new Error(error.message);

      return data.map(this.mapSafetyAlertData);
    } catch (error) {
      console.error('Get safety alerts error:', error);
      throw error;
    }
  }

  async resolveSafetyAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('safety_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Resolve safety alert error:', error);
      throw error;
    }
  }

  // Geofence Operations
  async createGeofence(name: string, centerLat: number, centerLng: number, radiusMeters: number): Promise<Geofence> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's hourse
      const { data: userData } = await supabase
        .from('users')
        .select('family_id')
        .eq('id', user.id)
        .single();

      if (!userData?.family_id) {
        throw new Error('User must be part of a hourse to create geofences');
      }

      const { data, error } = await supabase
        .from('geofences')
        .insert({
          family_id: userData.family_id,
          name,
          center_lat: centerLat,
          center_lng: centerLng,
          radius_meters: radiusMeters,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return this.mapGeofenceData(data);
    } catch (error) {
      console.error('Create geofence error:', error);
      throw error;
    }
  }

  async getFamilyGeofences(familyId: string): Promise<Geofence[]> {
    try {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return data.map(this.mapGeofenceData);
    } catch (error) {
      console.error('Get hourse geofences error:', error);
      throw error;
    }
  }

  async updateGeofence(geofenceId: string, updates: Partial<Geofence>): Promise<Geofence> {
    try {
      const { data, error } = await supabase
        .from('geofences')
        .update({
          name: updates.name,
          center_lat: updates.centerLat,
          center_lng: updates.centerLng,
          radius_meters: updates.radiusMeters,
          is_active: updates.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', geofenceId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return this.mapGeofenceData(data);
    } catch (error) {
      console.error('Update geofence error:', error);
      throw error;
    }
  }

  async deleteGeofence(geofenceId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('geofences')
        .delete()
        .eq('id', geofenceId);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Delete geofence error:', error);
      throw error;
    }
  }

  // Emergency Contact Operations
  async addEmergencyContact(name: string, phoneNumber: string, relationship: string, isPrimary: boolean = false): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // If this is a primary contact, unset other primary contacts
      if (isPrimary) {
        await supabase
          .from('emergency_contacts')
          .update({ is_primary: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          name,
          phone_number: phoneNumber,
          relationship,
          is_primary: isPrimary,
        });

      if (error) throw new Error(error.message);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) throw new Error(error.message);

      return data.map(contact => ({
        id: contact.id,
        name: contact.name,
        phoneNumber: contact.phone_number,
        relationship: contact.relationship,
        isPrimary: contact.is_primary,
      }));
    } catch (error) {
      console.error('Get emergency contacts error:', error);
      throw error;
    }
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Delete emergency contact error:', error);
      throw error;
    }
  }

  // Data Mapping Functions
  private mapFamilyData(data: any): hourse {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      members: data.users?.map(this.mapUserData) || [],
    };
  }

  private mapMessageData(data: any): Message {
    return {
      id: data.id,
      senderId: data.sender_id,
      familyId: data.family_id,
      content: data.content,
      messageType: data.message_type,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      sender: data.users ? this.mapUserData(data.users) : undefined,
    };
  }

  private mapLocationData(data: any): LocationPoint {
    return {
      id: data.id,
      userId: data.user_id,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      timestamp: data.timestamp,
    };
  }

  private mapSafetyAlertData(data: any): SafetyAlert {
    return {
      id: data.id,
      userId: data.user_id,
      alertType: data.alert_type,
      locationLat: data.location_lat,
      locationLng: data.location_lng,
      status: data.status,
      metadata: data.metadata,
      createdAt: data.created_at,
      resolvedAt: data.resolved_at,
      user: data.users ? this.mapUserData(data.users) : undefined,
    };
  }

  private mapGeofenceData(data: any): Geofence {
    return {
      id: data.id,
      familyId: data.family_id,
      name: data.name,
      centerLat: data.center_lat,
      centerLng: data.center_lng,
      radiusMeters: data.radius_meters,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapUserData(data: any): User {
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      phoneNumber: data.phone_number,
      avatar: data.avatar_url,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      bio: data.bio,
      preferences: data.preferences,
      subscription: data.subscription,
      familyId: data.family_id,
      familyRole: data.family_role,
      emergencyContacts: data.emergency_contacts || [],
      createdAt: data.created_at,
      lastActiveAt: data.last_active_at,
    };
  }
}

export default DatabaseService.getInstance(); 