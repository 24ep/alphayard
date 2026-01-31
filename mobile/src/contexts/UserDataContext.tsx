import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { safetyApi, locationApi } from '../services/api';
import { emotionService, EmotionRecord } from '../services/emotionService';
import { locationService, CircleLocation } from '../services/location/locationService';
import collectionService from '../services/collectionService';

// Define types based on what was in HomeScreen
export interface CircleMember {
    id: string;
    name: string;
    userName: string;
    role: string;
    notifications: number;
    lastLocationUpdate: string;
    address?: string;
    placeLabel?: string;
    isOnline: boolean;
    avatar?: string;

    // Status fields
    status: 'online' | 'offline';
    lastActive: Date;
    heartRate: number | null;
    heartRateHistory: any[];
    steps: number | null;
    sleepHours: number | null;
    location: string;
    batteryLevel: number | null;
    isEmergency: boolean;
    mood: string | null;
    activity: string | null;
    temperature: number | null;
}

export interface Circle {
    id: string;
    name: string;
    type: string;
    description: string;
    inviteCode: string;
    createdAt: string;
    ownerId: string;
    avatar_url: string | null;
    members: CircleMember[];
    stats: {
        totalMessages: number;
        totalLocations: number;
        totalMembers: number;
    };
}

interface UserDataContextValue {
    families: Circle[];
    selectedCircle: string | null; // Name of the selected circle
    setSelectedCircle: (name: string) => void;

    circleStatusMembers: CircleMember[];
    circleLocations: CircleLocation[];

    emotionData: EmotionRecord[];
    safetyStats: any;
    locationStats: any;

    loading: boolean;
    refreshing: boolean;

    loadData: () => Promise<void>;
    onRefresh: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextValue | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const [families, setFamilies] = useState<Circle[]>([]);
    const [selectedCircle, setSelectedCircle] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [emotionData, setEmotionData] = useState<EmotionRecord[]>([]);
    const [circleLocations, setCircleLocations] = useState<CircleLocation[]>([]);

    const [safetyStats, setSafetyStats] = useState<any>(null);
    const [locationStats, setLocationStats] = useState<any>(null);

    // Backend integration functions
    const loadFamilies = async () => {
        try {
            // Updated to use the dynamic collection system
            // We fetch the 'circles' collection which contains the circle metadata
            const response = await collectionService.getCollectionItems('circles');
            
            if (response.items && response.items.length > 0) {
                // Map dynamic items to the app's internal Circle structure
                const circles = response.items.map((item: any) => {
                    // Try to map members if they exist in the dynamic data (e.g. relation)
                    // If not, we might need a separate fetch for 'circle_members', but for now handle what we have
                    const membersRaw = item.members || []; 
                    
                    const members = membersRaw.map((member: any) => ({
                         id: member.id,
                        name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email || 'Member',
                        userName: `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email || 'Member',
                        role: member.role || 'member',
                        notifications: 0,
                        lastLocationUpdate: member.joinedAt || new Date().toISOString(),
                        address: member.address,
                        placeLabel: member.placeLabel,
                        isOnline: !!member.isOnline,
                        avatar: member.avatar || member.avatarUrl || '',
                        status: member.isOnline ? ('online' as const) : ('offline' as const),
                        lastActive: new Date(),
                        heartRate: 0,
                        heartRateHistory: [],
                        steps: 0,
                        sleepHours: 0,
                        location: member.location || 'Not Available',
                        batteryLevel: 0,
                        isEmergency: false,
                        mood: member.mood,
                        activity: null,
                        temperature: null,
                    }));

                    return {
                        id: item.id,
                        name: item.name || item.title || 'My Circle',
                        type: item.type || 'family',
                        description: item.description || '',
                        inviteCode: item.inviteCode || item.invite_code || '',
                        createdAt: item.createdAt,
                        ownerId: item.ownerId || item.owner_id,
                        avatar_url: item.avatar || item.avatarUrl || null,
                        members,
                        stats: item.stats || {
                             totalMessages: 0,
                            totalLocations: 0,
                            totalMembers: members.length
                        }
                    };
                });

                setFamilies(circles);

                if (!selectedCircle && circles.length > 0) {
                    setSelectedCircle(circles[0].name);
                }
            } else {
                setFamilies([]);
            }
        } catch (error: any) {
            console.error('Error loading circles from collection:', error);
            // Fallback or empty state
            setFamilies([]);
        }
    };

    const loadSafetyStats = async () => {
        try {
            const response = await safetyApi.getSafetyStats();
            if (response?.success) {
                setSafetyStats(response.stats);
            }
        } catch (error: any) {
            if (error?.code === 'NOT_FOUND' || error?.response?.status === 404) return;
            console.error('Error loading safety stats:', error);
        }
    };

    const loadLocationStats = async () => {
        try {
            const response = await locationApi.getLocationStats();
            if (response?.success) {
                setLocationStats(response.stats);
            }
        } catch (error: any) {
            if (error?.code === 'NOT_FOUND' || error?.response?.status === 404) return;
            console.error('Error loading location stats:', error);
        }
    };

    const loadEmotionData = async () => {
        try {
            const data = await emotionService.getUserEmotionHistory(365);
            setEmotionData(data);
        } catch (error) {
            console.error('Error loading emotion data:', error);
        }
    };

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            await Promise.all([
                loadFamilies(),
                loadSafetyStats(),
                loadLocationStats(),
                loadEmotionData(),
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Initial load
    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, loadData]);

    // Location service subscriptions
    useEffect(() => {
        if (user) {
            // Set up real-time location tracking
            const unsubscribe = locationService.subscribe((locations) => {
                setCircleLocations(locations);
            });
            locationService.setCurrentUser(user);

            return () => {
                unsubscribe();
            };
        }
        return undefined;
    }, [user]);

    useEffect(() => {
        if (families && families.length > 0) {
            locationService.setCircleData(families);
        }
    }, [families]);

    // Derived state: circleStatusMembers (including current user)
    const currentUserMember: CircleMember = {
        id: user?.id || 'current-user',
        name: user ? `${user.firstName} ${user.lastName}` : 'You',
        userName: user ? `${user.firstName} ${user.lastName}` : 'You', // Adding missing prop
        role: 'owner', // Adding missing prop
        notifications: 0, // Adding missing prop
        lastLocationUpdate: new Date().toISOString(), // Adding missing prop
        isOnline: true,
        avatar: user?.avatar || undefined,
        status: 'online',
        lastActive: new Date(),
        heartRate: null,
        heartRateHistory: [],
        steps: null,
        sleepHours: null,
        location: 'Not Available',
        batteryLevel: null,
        isEmergency: false,
        mood: null,
        activity: 'Not Available',
        temperature: null,
    };

    // Combine members from all families (or selected)
    // For now just taking members from the first loaded circle or empty
    const loadedMembers = families.length > 0 ? families[0].members : [];

    // Filter out current user from loaded members if they exist there to avoid dupe, 
    // though usually backend separates them. 
    // Actually HomeScreen implementation just flattens all members.
    const otherMembers = loadedMembers.filter(m => m.id !== user?.id);

    const circleStatusMembers = [currentUserMember, ...otherMembers];

    return (
        <UserDataContext.Provider value={{
            families,
            selectedCircle,
            setSelectedCircle,
            circleStatusMembers,
            circleLocations,
            emotionData,
            safetyStats,
            locationStats,
            loading,
            refreshing,
            loadData,
            onRefresh,
        }}>
            {children}
        </UserDataContext.Provider>
    );
};

export const useUserData = (): UserDataContextValue => {
    const ctx = useContext(UserDataContext);
    if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
    return ctx;
};

