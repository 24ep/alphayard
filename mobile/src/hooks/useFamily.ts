import { useState, useEffect, useCallback } from 'react';
import { familyService } from '../services/hourse/FamilyService';
import { hourse, FamilyMember, FamilyInvitation } from '../types/hourse';
import { useAuth } from './useAuth';

interface FamilyState {
  currentFamily: hourse | null;
  families: hourse[];
  members: FamilyMember[];
  invitations: FamilyInvitation[];
  loading: boolean;
  error: string | null;
}

interface FamilyActions {
  createFamily: (data: Partial<hourse>) => Promise<void>;
  joinFamily: (invitationId: string) => Promise<void>;
  leaveFamily: (familyId: string) => Promise<void>;
  inviteMember: (familyId: string, email: string, role?: string) => Promise<void>;
  removeMember: (familyId: string, memberId: string) => Promise<void>;
  updateMemberRole: (familyId: string, memberId: string, role: string) => Promise<void>;
  updateFamilySettings: (familyId: string, settings: Partial<hourse>) => Promise<void>;
  refreshFamily: () => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  clearError: () => void;
}

export const useFamily = (): FamilyState & FamilyActions => {
  const { user } = useAuth();
  const [state, setState] = useState<FamilyState>({
    currentFamily: null,
    families: [],
    members: [],
    invitations: [],
    loading: false,
    error: null,
  });

  // Load hourse data on mount
  useEffect(() => {
    if (user) {
      loadFamilyData();
    }
  }, [user]);

  const loadFamilyData = async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Mock hourse data for development
      const mockCurrentFamily = {
        id: 'hourse-123',
        name: 'The Doe hourse',
        description: 'A loving hourse focused on safety and connection',
        createdBy: 'user-123',
        members: [
          {
            id: 'member-1',
            userId: 'user-123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'admin',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            isOnline: true,
            lastSeen: new Date(),
          },
          {
            id: 'member-2',
            userId: 'user-456',
            name: 'Sarah Doe',
            email: 'sarah.doe@example.com',
            role: 'member',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            isOnline: false,
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
          {
            id: 'member-3',
            userId: 'user-789',
            name: 'Emma Doe',
            email: 'emma.doe@example.com',
            role: 'member',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            isOnline: true,
            lastSeen: new Date(),
          },
        ],
        settings: {
          privacy: {
            locationSharing: true,
            profileVisibility: 'hourse',
            activitySharing: true,
          },
          notifications: {
            familyUpdates: true,
            locationAlerts: true,
            safetyAlerts: true,
            chatMessages: true,
            reminders: true,
            marketing: false,
          },
          safety: {
            emergencyContacts: true,
            geofencing: true,
            checkIns: true,
          },
          communication: {
            groupChat: true,
            videoCalls: true,
            fileSharing: true,
          },
          features: {
            locationTracking: true,
            eventPlanning: true,
            photoSharing: true,
            taskManagement: true,
          },
        },
        isCurrent: true,
        invitations: [],
        statistics: {
          totalMembers: 3,
          activeMembers: 2,
          totalMessages: 156,
          totalEvents: 12,
          totalPhotos: 89,
        },
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date(),
      };

      const mockFamilies = [mockCurrentFamily];
      const mockMembers = mockCurrentFamily.members;
      const mockInvitations: FamilyInvitation[] = [];

      setState(prev => ({
        ...prev,
        families: mockFamilies,
        currentFamily: mockCurrentFamily,
        members: mockMembers,
        invitations: mockInvitations,
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load hourse data',
      }));
    }
  };

  const createFamily = useCallback(async (data: Partial<hourse>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const newFamily = await familyService.createFamily(data, user.id);
      
      setState(prev => ({
        ...prev,
        families: [newFamily, ...prev.families],
        currentFamily: newFamily,
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to create hourse',
      }));
      throw error;
    }
  }, [user]);

  const joinFamily = useCallback(async (invitationId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await familyService.acceptInvitation(invitationId, user.id);
      
      // Refresh hourse data
      await loadFamilyData();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to join hourse',
      }));
      throw error;
    }
  }, [user]);

  const leaveFamily = useCallback(async (familyId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Mock leave hourse - simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Left hourse ${familyId} successfully (mock)`);
      
      // Remove hourse from state
      setState(prev => ({
        ...prev,
        families: prev.families.filter(f => f.id !== familyId),
        currentFamily: prev.currentFamily?.id === familyId ? null : prev.currentFamily,
        members: prev.currentFamily?.id === familyId ? [] : prev.members,
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to leave hourse',
      }));
      throw error;
    }
  }, [user]);

  const inviteMember = useCallback(async (familyId: string, email: string, role: string = 'member') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await familyService.sendInvitation(familyId, email, role);
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to invite member',
      }));
      throw error;
    }
  }, []);

  const removeMember = useCallback(async (familyId: string, memberId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await familyService.removeMember(familyId, memberId);
      
      // Refresh hourse data
      await loadFamilyData();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to remove member',
      }));
      throw error;
    }
  }, []);

  const updateMemberRole = useCallback(async (familyId: string, memberId: string, role: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await familyService.updateMemberRole(familyId, memberId, role);
      
      // Refresh hourse data
      await loadFamilyData();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update member role',
      }));
      throw error;
    }
  }, []);

  const updateFamilySettings = useCallback(async (familyId: string, settings: Partial<hourse>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await familyService.updateFamilySettings(familyId, settings);
      
      // Refresh hourse data
      await loadFamilyData();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update hourse settings',
      }));
      throw error;
    }
  }, []);

  const refreshFamily = useCallback(async () => {
    await loadFamilyData();
  }, []);

  const acceptInvitation = useCallback(async (invitationId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await familyService.acceptInvitation(invitationId, user.id);
      
      // Refresh hourse data
      await loadFamilyData();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to accept invitation',
      }));
      throw error;
    }
  }, [user]);

  const declineInvitation = useCallback(async (invitationId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await familyService.declineInvitation(invitationId);
      
      // Refresh invitations
      if (user) {
        const invitations = await familyService.getPendingInvitations(user.email);
        setState(prev => ({ ...prev, invitations, loading: false }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to decline invitation',
      }));
      throw error;
    }
  }, [user]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createFamily,
    joinFamily,
    leaveFamily,
    inviteMember,
    removeMember,
    updateMemberRole,
    updateFamilySettings,
    refreshFamily,
    acceptInvitation,
    declineInvitation,
    clearError,
  };
}; 