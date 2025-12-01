import { api } from './index';

export interface hourse {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
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
    allowFamilyInvites: boolean;
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
    allowFamilyHistory: boolean;
    allowMemberHistory: boolean;
    allowAdminHistory: boolean;
    allowSettingsHistory: boolean;
    allowBillingHistory: boolean;
    allowSubscriptionHistory: boolean;
    allowDataHistory: boolean;
    allowPrivacyHistory: boolean;
    allowNotificationHistory: boolean;
  };
  createdAt: string;
  updatedAt: string;
  members?: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  familyId: string;
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

export interface FamilyInvitation {
  id: string;
  familyId: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyRequest {
  name: string;
  description?: string;
  settings?: Partial<hourse['settings']>;
}

export interface UpdateFamilyRequest {
  name?: string;
  description?: string;
  settings?: Partial<hourse['settings']>;
}

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'member';
}

export const familyApi = {
  // Create hourse
  createFamily: async (data: CreateFamilyRequest): Promise<{ success: boolean; hourse: hourse }> => {
    const response = await api.post('/families', data);
    return response.data;
  },

  // Get user's families
  getFamilies: async (): Promise<{ success: boolean; families: hourse[] }> => {
    const response = await api.get('/families');
    return response.data;
  },

  // Get hourse by ID
  getFamily: async (familyId: string): Promise<{ success: boolean; hourse: hourse }> => {
    const response = await api.get(`/families/${familyId}`);
    return response.data;
  },

  // Update hourse
  updateFamily: async (familyId: string, data: UpdateFamilyRequest): Promise<{ success: boolean; hourse: hourse }> => {
    const response = await api.put(`/families/${familyId}`, data);
    return response.data;
  },

  // Delete hourse
  deleteFamily: async (familyId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/families/${familyId}`);
    return response.data;
  },

  // Get hourse members
  getFamilyMembers: async (familyId: string): Promise<{ success: boolean; members: FamilyMember[] }> => {
    const response = await api.get(`/families/${familyId}/members`);
    return response.data;
  },

  // Add hourse member
  addFamilyMember: async (familyId: string, data: InviteMemberRequest): Promise<{ success: boolean; invitation: FamilyInvitation }> => {
    const response = await api.post(`/families/${familyId}/members`, data);
    return response.data;
  },

  // Remove hourse member
  removeFamilyMember: async (familyId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/families/${familyId}/members/${userId}`);
    return response.data;
  },

  // Update hourse member role
  updateFamilyMemberRole: async (familyId: string, userId: string, role: 'admin' | 'member'): Promise<{ success: boolean; member: FamilyMember }> => {
    const response = await api.put(`/families/${familyId}/members/${userId}`, { role });
    return response.data;
  },

  // Get hourse invitations (for a specific family)
  getFamilyInvitations: async (familyId: string): Promise<{ success: boolean; invitations: FamilyInvitation[] }> => {
    const response = await api.get(`/families/${familyId}/invitations`);
    return response.data;
  },

  // Get pending invitations for current user
  getPendingInvitations: async (): Promise<{ invitations: Array<{
    id: string;
    familyId: string;
    email: string;
    message?: string;
    status: string;
    createdAt: string;
    expiresAt: string;
    family: { id: string; name: string; description?: string } | null;
    invitedBy: string;
  }> }> => {
    const response = await api.get('/families/invitations/pending');
    return response.data;
  },

  // Invite member to family
  inviteMember: async (email: string, message?: string): Promise<{ message: string; invitation: any }> => {
    const response = await api.post('/families/invite', { email, message });
    return response.data;
  },

  // Accept hourse invitation
  acceptFamilyInvitation: async (invitationId: string): Promise<{ message: string; family?: any; alreadyMember?: boolean }> => {
    const response = await api.post(`/families/invitations/${invitationId}/accept`);
    return response.data;
  },

  // Decline hourse invitation
  declineFamilyInvitation: async (invitationId: string): Promise<{ message: string }> => {
    const response = await api.post(`/families/invitations/${invitationId}/decline`);
    return response.data;
  },

  // Leave hourse
  leaveFamily: async (familyId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/families/${familyId}/leave`);
    return response.data;
  },

  // Join hourse by invitation code
  joinFamilyByCode: async (invitationCode: string): Promise<{ success: boolean; hourse: hourse }> => {
    const response = await api.post('/families/join', { invitationCode });
    return response.data;
  },

  // Get hourse events
  getEvents: async (familyId: string): Promise<{ success: boolean; events: any[] }> => {
    const response = await api.get(`/families/${familyId}/events`);
    return response.data;
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
    const response = await api.get('/families/shopping-list');
    return response.data;
  },

  createShoppingItem: async (data: {
    item: string;
    quantity?: string;
    category?: string;
    list?: string;
  }): Promise<{ item: any }> => {
    const response = await api.post('/families/shopping-list', data);
    return response.data;
  },

  updateShoppingItem: async (itemId: string, data: {
    item?: string;
    quantity?: string;
    category?: string;
    completed?: boolean;
    list?: string;
  }): Promise<{ item: any }> => {
    const response = await api.put(`/families/shopping-list/${itemId}`, data);
    return response.data;
  },

  deleteShoppingItem: async (itemId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/families/shopping-list/${itemId}`);
    return response.data;
  },
};
