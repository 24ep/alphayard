import { api } from './index';

export interface CircleType {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  sort_order: number;
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  circleTypeId?: string;
  circleType?: CircleType;
  settings: {
    allowLocationSharing: boolean;
    allowChatMessages: boolean;
    allowFileSharing: boolean;
    allowCalendarEvents: boolean;
    allowTaskAssignment: boolean;
    allowSafetyAlerts: boolean;
    allowGeofenceAlerts: boolean;
    allowInactivityAlerts: boolean;
    allowPanicAlerts: boolean;
    allowEmergencyContacts: boolean;
    allowCircleInvites: boolean;
    allowMemberRemoval: boolean;
    allowAdminPromotion: boolean;
    allowSettingsChange: boolean;
    allowBillingManagement: boolean;
    allowSubscriptionUpgrade: boolean;
    allowSubscriptionDowngrade: boolean;
    allowSubscriptionCancel: boolean;
    allowDataExport: boolean;
    allowDataDeletion: boolean;
    allowPrivacySettings: boolean;
    allowNotificationSettings: boolean;
    allowLocationHistory: boolean;
    allowChatHistory: boolean;
    allowFileHistory: boolean;
    allowCalendarHistory: boolean;
    allowTaskHistory: boolean;
    allowSafetyHistory: boolean;
    allowGeofenceHistory: boolean;
    allowInactivityHistory: boolean;
    allowPanicHistory: boolean;
    allowEmergencyHistory: boolean;
    allowCircleHistory: boolean;
    allowMemberHistory: boolean;
    allowAdminHistory: boolean;
    allowSettingsHistory: boolean;
    allowBillingHistory: boolean;
    allowSubscriptionHistory: boolean;
    allowDataHistory: boolean;
    allowPrivacyHistory: boolean;
    allowNotificationHistory: boolean;
    allowCircleExpenses: boolean;
    allowCircleShopping: boolean;
    allowCircleHealth: boolean;
    allowCircleEntertainment: boolean;
  };
  createdAt: string;
  updatedAt: string;
  members?: CircleMember[];
}

export interface CircleMember {
  id: string;
  circleId: string;
  userId: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
  invitedBy?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    phoneNumber?: string;
  };
}

export interface CircleInvitation {
  id: string;
  circleId: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCircleRequest {
  name: string;
  description?: string;
  circleTypeId?: string;
  type?: string;
  settings?: Partial<Circle['settings']>;
}

export interface UpdateCircleRequest {
  name?: string;
  description?: string;
  settings?: Partial<Circle['settings']>;
}

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'member';
}

export const circleApi = {
  // Create circle
  createCircle: async (data: CreateCircleRequest): Promise<{ success: boolean; circle: Circle }> => {
    const response = await api.post('/circles', data);
    return response as any;
  },

  // Get user's circles
  getCircles: async (): Promise<{ success: boolean; circles: Circle[] }> => {
    const response = await api.get('/circles');
    return response as any;
  },

  // Get circle by ID
  getCircle: async (circleId: string): Promise<{ success: boolean; circle: Circle }> => {
    const response = await api.get(`/circles/${circleId}`);
    return response as any;
  },

  // Update circle
  updateCircle: async (circleId: string, data: UpdateCircleRequest): Promise<{ success: boolean; circle: Circle }> => {
    const response = await api.put(`/circles/${circleId}`, data);
    return response as any;
  },

  // Delete circle
  deleteCircle: async (circleId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/circles/${circleId}`);
    return response as any;
  },

  // Get circle members
  getCircleMembers: async (circleId: string): Promise<{ success: boolean; members: CircleMember[] }> => {
    const response = await api.get(`/circles/${circleId}/members`);
    return response as any;
  },

  // Add circle member
  addCircleMember: async (circleId: string, data: InviteMemberRequest): Promise<{ success: boolean; invitation: CircleInvitation }> => {
    const response = await api.post(`/circles/${circleId}/members`, data);
    return response as any;
  },

  // Remove circle member
  removeCircleMember: async (circleId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/circles/${circleId}/members/${userId}`);
    return response as any;
  },

  // Update circle member role
  updateCircleMemberRole: async (circleId: string, userId: string, role: 'admin' | 'member'): Promise<{ success: boolean; member: CircleMember }> => {
    const response = await api.put(`/circles/${circleId}/members/${userId}`, { role });
    return response as any;
  },

  // Get circle invitations (for a specific circle)
  getCircleInvitations: async (circleId: string): Promise<{ success: boolean; invitations: CircleInvitation[] }> => {
    const response = await api.get(`/circles/${circleId}/invitations`);
    return response as any;
  },

  // Get pending invitations for current user
  getPendingInvitations: async (): Promise<{ invitations: Array<{
    id: string;
    circleId: string;
    email: string;
    message?: string;
    status: string;
    createdAt: string;
    expiresAt: string;
    circle: { id: string; name: string; description?: string } | null;
    invitedBy: string;
  }> }> => {
    const response = await api.get('/circles/invitations/pending');
    return response as any;
  },

  // Invite member to circle
  inviteMember: async (circleId: string, email: string, message?: string): Promise<{ message: string; invitation: any }> => {
    const response = await api.post(`/circles/${circleId}/invite`, { email, message });
    return response as any;
  },

  // Accept circle invitation
  acceptCircleInvitation: async (invitationId: string): Promise<{ message: string; circle?: any; alreadyMember?: boolean }> => {
    const response = await api.post(`/circles/invitations/${invitationId}/accept`);
    return response as any;
  },

  // Decline circle invitation
  declineCircleInvitation: async (invitationId: string): Promise<{ message: string }> => {
    const response = await api.post(`/circles/invitations/${invitationId}/decline`);
    return response as any;
  },

  // Leave circle
  leaveCircle: async (circleId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/circles/${circleId}/leave`);
    return response as any;
  },

  // Join circle by invitation code
  joinCircleByCode: async (invitationCode: string): Promise<{ success: boolean; circle: Circle }> => {
    const response = await api.post('/circles/join', { invitationCode });
    return response as any;
  },

  // Get circle events
  getEvents: async (circleId: string): Promise<{ success: boolean; events: any[] }> => {
    const response = await api.get(`/circles/${circleId}/events`);
    return response as any;
  },

  // Shopping List APIs
  getShoppingList: async (): Promise<{ items: Array<{
    id: string;
    item: string;
    quantity: string;
    category: string;
    completed: boolean;
    list?: string;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
  }> }> => {
    const response = await api.get('/circles/shopping-list');
    return response as any;
  },

  createShoppingItem: async (data: {
    item: string;
    quantity?: string;
    category?: string;
    list?: string;
  }): Promise<{ item: any }> => {
    const response = await api.post('/circles/shopping-list', data);
    return response as any;
  },

  updateShoppingItem: async (itemId: string, data: {
    item?: string;
    quantity?: string;
    category?: string;
    completed?: boolean;
    list?: string;
  }): Promise<{ item: any }> => {
    const response = await api.put(`/circles/shopping-list/${itemId}`, data);
    return response as any;
  },

  deleteShoppingItem: async (itemId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/circles/shopping-list/${itemId}`);
    return response as any;
  },

  getCircleTypes: async (): Promise<{ success: boolean; data: CircleType[] }> => {
    try {
        const response = await api.get('/circle-types');
        return response as any;
    } catch (error) {
        console.warn('Failed to fetch circle types, using fallback:', error);
        // Fallback data
        return {
            success: true,
            data: [
                { id: '1', name: 'Circle', code: 'circle', sort_order: 1, icon: 'home-heart' },
                { id: '2', name: 'Sharehouse', code: 'sharehouse', sort_order: 2, icon: 'home-group' },
                { id: '3', name: 'Team', code: 'team', sort_order: 3, icon: 'briefcase-outline' },
                { id: '4', name: 'Friendship', code: 'friend', sort_order: 4, icon: 'account-multiple-outline' },
                { id: '5', name: 'Club', code: 'club', sort_order: 5, icon: 'cards-club' },
                { id: '6', name: 'Other', code: 'other', sort_order: 6, icon: 'dots-horizontal' }
            ]
        };
    }
  },
};

// Backward compatibility (optional but helpful during transition)
export const CircleApi = circleApi;
// export const circleApi = circleApi;
export const createCircle = circleApi.createCircle;
export const getFamilies = circleApi.getCircles;

