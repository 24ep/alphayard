interface FamilyLocation {
  id: string;
  userName: string;
  latitude: number;
  longitude: number;
  lastUpdated: Date;
  isOnline: boolean;
}

interface FamilyMember {
  id: string;
  name: string;
  notifications: number;
  isComposite: boolean;
  type: string;
  familyId: string;
  avatarUrl?: string;
}

interface FamilyStatusMember {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastActive: Date;
  heartRate: number;
  heartRateHistory: number[];
  steps: number;
  sleepHours: number;
  location: string;
  batteryLevel: number;
  isEmergency: boolean;
}

export const transformFamilyLocationsToMembers = (familyLocations: FamilyLocation[]): FamilyMember[] => {
  return familyLocations.map(member => ({
    id: member.id,
    name: member.userName,
    notifications: 0,
    isComposite: false,
    type: 'individual',
    familyId: '1',
    avatarUrl: undefined,
  }));
};

export const transformFamilyLocationsToStatusMembers = (familyLocations: FamilyLocation[]): FamilyStatusMember[] => {
  return familyLocations.map(member => ({
    id: member.id,
    name: member.userName,
    avatar: 'https://via.placeholder.com/48',
    status: 'online' as const,
    lastActive: new Date(),
    heartRate: 72,
    heartRateHistory: [70, 72, 75, 73, 71, 74, 76],
    steps: 8500,
    sleepHours: 7.5,
    location: 'Home',
    batteryLevel: 85,
    isEmergency: false,
  }));
};
