import { CircleLocation, CircleMember, CircleStatusMember } from '../types/circle';

export const transformCircleLocationsToMembers = (circleLocations: CircleLocation[]): CircleMember[] => {
  return circleLocations.map(member => ({
    id: member.id,
    name: member.userName,
    notifications: 0,
    isComposite: false,
    type: 'individual',
    circleId: '1',
    avatarUrl: undefined,
  }));
};

export const transformCircleLocationsToStatusMembers = (circleLocations: CircleLocation[]): CircleStatusMember[] => {
  return circleLocations.map(member => ({
    id: member.id,
    name: member.userName,
    avatar: 'https://placehold.co/48',
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
