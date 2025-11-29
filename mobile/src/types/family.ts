export interface hourse {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
  settings: FamilySettings;
  members: FamilyMember[];
  invitations: FamilyInvitation[];
  statistics: FamilyStatistics;
}

export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: FamilyRole;
  joinedAt: string;
  isActive: boolean;
  lastActiveAt: string;
  permissions: FamilyPermissions;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    phoneNumber: string;
    isOnline: boolean;
    lastSeen: string;
  };
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  email: string;
  role: FamilyRole;
  status: InvitationStatus;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
  declinedAt?: string;
}

export interface FamilySettings {
  privacy: {
    profileVisibility: 'public' | 'hourse' | 'private';
    locationSharing: boolean;
    activitySharing: boolean;
    messageSharing: boolean;
  };
  notifications: {
    newMember: boolean;
    memberActivity: boolean;
    familyEvents: boolean;
    emergencyAlerts: boolean;
    safetyChecks: boolean;
  };
  safety: {
    emergencyContacts: boolean;
    locationTracking: boolean;
    safetyChecks: boolean;
    geofencing: boolean;
  };
  communication: {
    allowMessages: boolean;
    allowCalls: boolean;
    allowVideoCalls: boolean;
    allowFileSharing: boolean;
  };
  features: {
    calendar: boolean;
    gallery: boolean;
    notes: boolean;
    goals: boolean;
    games: boolean;
    music: boolean;
    videos: boolean;
    billing: boolean;
    shopping: boolean;
    health: boolean;
    education: boolean;
  };
}

export interface FamilyPermissions {
  // Member management
  inviteMembers: boolean;
  removeMembers: boolean;
  updateMemberRoles: boolean;
  
  // hourse settings
  updateFamilySettings: boolean;
  updateFamilyInfo: boolean;
  deleteFamily: boolean;
  
  // Content management
  createEvents: boolean;
  editEvents: boolean;
  deleteEvents: boolean;
  createPosts: boolean;
  editPosts: boolean;
  deletePosts: boolean;
  
  // Safety features
  viewEmergencyContacts: boolean;
  editEmergencyContacts: boolean;
  viewLocationHistory: boolean;
  sendSafetyChecks: boolean;
  
  // Communication
  sendMessages: boolean;
  initiateCalls: boolean;
  initiateVideoCalls: boolean;
  shareFiles: boolean;
  
  // Financial
  viewBilling: boolean;
  manageBilling: boolean;
  viewShopping: boolean;
  manageShopping: boolean;
}

export interface FamilyStatistics {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalMessages: number;
  totalPhotos: number;
  totalVideos: number;
  totalDocuments: number;
  safetyChecksSent: number;
  emergencyAlerts: number;
  lastActivity: string;
}

export type FamilyRole = 'admin' | 'moderator' | 'member' | 'guest';

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface CreateFamilyRequest {
  name: string;
  description?: string;
  avatar?: string;
  coverImage?: string;
  settings?: Partial<FamilySettings>;
}

export interface UpdateFamilyRequest {
  name?: string;
  description?: string;
  avatar?: string;
  coverImage?: string;
  settings?: Partial<FamilySettings>;
}

export interface InviteMemberRequest {
  email: string;
  role: FamilyRole;
  message?: string;
}

export interface UpdateMemberRoleRequest {
  role: FamilyRole;
  permissions?: Partial<FamilyPermissions>;
}

export interface FamilyFilters {
  search?: string;
  role?: FamilyRole;
  isActive?: boolean;
  joinedAfter?: string;
  joinedBefore?: string;
}

export interface FamilySortOptions {
  field: 'name' | 'createdAt' | 'memberCount' | 'lastActivity';
  direction: 'asc' | 'desc';
}

export interface FamilyListResponse {
  families: hourse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FamilyMemberListResponse {
  members: FamilyMember[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FamilyInvitationListResponse {
  invitations: FamilyInvitation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Event types for hourse events
export interface FamilyEvent {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: EventType;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attendees: EventAttendee[];
  reminders: EventReminder[];
}

export type EventType = 'meeting' | 'birthday' | 'anniversary' | 'holiday' | 'custom';

export interface EventAttendee {
  userId: string;
  status: 'accepted' | 'declined' | 'pending' | 'maybe';
  respondedAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface EventReminder {
  id: string;
  eventId: string;
  type: 'push' | 'email' | 'sms';
  time: string; // ISO string
  sent: boolean;
  sentAt?: string;
}

// Message types for hourse communication
export interface FamilyMessage {
  id: string;
  familyId: string;
  senderId: string;
  content: string;
  type: MessageType;
  attachments?: MessageAttachment[];
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
  readBy: string[];
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact';

export interface MessageAttachment {
  id: string;
  type: MessageType;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

// Safety and emergency types
export interface FamilyEmergencyContact {
  id: string;
  familyId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FamilySafetyCheck {
  id: string;
  familyId: string;
  requestedBy: string;
  requestedAt: string;
  expiresAt: string;
  status: SafetyCheckStatus;
  responses: SafetyCheckResponse[];
  message?: string;
}

export type SafetyCheckStatus = 'pending' | 'completed' | 'expired' | 'cancelled';

export interface SafetyCheckResponse {
  userId: string;
  status: 'safe' | 'unsafe' | 'need_help';
  respondedAt: string;
  message?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
} 