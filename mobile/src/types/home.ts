export interface hourse {
  id: string;
  name: string;
  memberCount: number;
  isActive: boolean;
  avatar?: string;
  lastActive?: Date;
}

export interface FamilyMember {
  id: string;
  name: string;
  notifications: number;
  isComposite?: boolean;
  type?: string;
  familyId: string;
  avatarUrl?: string;
  avatarSeed?: string;
}

export interface AssetCard {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
  progress?: number;
}

export interface AttentionApp {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  icon: string;
  color: string;
  notifications: number;
  isUrgent: boolean;
  priority?: 'high' | 'medium' | 'low';
  time?: string;
}

export interface SocialPost {
  id: string;
  author: {
    id?: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  timestamp: string;
  created_at?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  location?: string;
  tags?: string[];
}

export interface CustomTab {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  widgets: string[];
}

export interface Widget {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

export interface ReportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface LocationOption {
  id: string;
  name: string;
  type: 'hourse' | 'nearby' | 'place';
  distance?: string;
  isSelected?: boolean;
}

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  balance: number;
  targetValue?: number;
  bankAccount?: string;
}

export interface FamilyStatusMember {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastActive: Date;
  heartRate: number;
  heartRateHistory: number[];
  steps: number;
  sleepHours: number;
  location?: string;
  batteryLevel?: number;
  isEmergency?: boolean;
}

export interface Appointment {
  id: string;
  title: string;
  time: string;
  location: string;
  type: 'medical' | 'education' | 'hourse' | 'work' | 'other';
  attendees: string[];
}

export interface ShoppingItem {
  id: string;
  item: string;
  category: string;
  quantity: string;
  assignedTo: string;
  completed: boolean;
}

export interface RecentlyUsedApp {
  id: string;
  name: string;
  icon: string;
  lastUsed: string;
  category: string;
}

export interface LocationData {
  id: string;
  name: string;
  type: 'home' | 'work' | 'school' | 'other';
  address: string;
  distance: string;
  lastSeen: string;
  isOnline: boolean;
  batteryLevel?: number;
}

export interface WidgetType {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  category: string;
}

export interface FamilyData {
  name: string;
  type: string;
  members: string[];
}
