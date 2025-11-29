import { supabase } from '../../config/supabase';
import { hourse, FamilyMember, FamilyInvitation } from '../../types/hourse';

export class FamilyService {
  private static instance: FamilyService;

  private constructor() {}

  static getInstance(): FamilyService {
    if (!FamilyService.instance) {
      FamilyService.instance = new FamilyService();
    }
    return FamilyService.instance;
  }

  // Check if Supabase is available
  private async checkSupabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return !error;
    } catch (error) {
      console.warn('Supabase connection not available:', error);
      return false;
    }
  }

  // Create a new hourse
  async createFamily(data: Partial<hourse>, creatorId: string): Promise<hourse> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        // Return mock data for development
        const mockFamily: hourse = {
          id: 'mock-hourse-1',
          name: data.name || 'Demo hourse',
          description: data.description || 'A demo hourse',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCurrent: true,
          settings: data.settings || {},
          members: [],
          invitations: [],
          statistics: {
            totalMembers: 1,
            activeMembers: 1,
            totalEvents: 0,
            upcomingEvents: 0,
            totalMessages: 0,
            totalPhotos: 0,
            totalVideos: 0,
            totalDocuments: 0,
            safetyChecksSent: 0,
            emergencyAlerts: 0,
            lastActivity: new Date().toISOString(),
          },
        };
        return mockFamily;
      }

      const { data: hourse, error } = await supabase
        .from('families')
        .insert({
          name: data.name,
          description: data.description,
          created_by: creatorId,
          settings: data.settings || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      await this.addMember(hourse.id, creatorId, 'admin');

      return {
        id: hourse.id,
        name: hourse.name,
        description: hourse.description,
        createdBy: hourse.created_by,
        members: [],
        settings: hourse.settings,
        createdAt: hourse.created_at,
        updatedAt: hourse.updated_at,
      };
    } catch (error) {
      console.error('Error creating hourse:', error);
      throw new Error('Failed to create hourse');
    }
  }

  // Get hourse by ID
  async getFamily(familyId: string): Promise<hourse | null> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        // Return mock data for development
        const mockFamily: hourse = {
          id: familyId,
          name: 'Demo hourse',
          description: 'A demo hourse for development',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCurrent: true,
          settings: {},
          members: [
            {
              id: 'member-1',
              userId: 'user-1',
              familyId: familyId,
              role: 'admin',
              joinedAt: new Date().toISOString(),
              isActive: true,
              lastActiveAt: new Date().toISOString(),
              permissions: {
                inviteMembers: true,
                removeMembers: true,
                updateMemberRoles: true,
                updateFamilySettings: true,
                updateFamilyInfo: true,
                deleteFamily: true,
                createEvents: true,
                editEvents: true,
                deleteEvents: true,
                createPosts: true,
                editPosts: true,
                deletePosts: true,
                viewEmergencyContacts: true,
                editEmergencyContacts: true,
                viewLocationHistory: true,
                sendSafetyChecks: true,
                sendMessages: true,
                initiateCalls: true,
                initiateVideoCalls: true,
                shareFiles: true,
                viewBilling: true,
                manageBilling: true,
                viewShopping: true,
                manageShopping: true,
              },
              user: {
                id: 'user-1',
                firstName: 'Demo',
                lastName: 'User',
                email: 'demo@bondarys.com',
                avatar: 'https://via.placeholder.com/150',
                phoneNumber: '+1234567890',
                isOnline: true,
                lastSeen: new Date().toISOString(),
              },
            },
          ],
          invitations: [],
          statistics: {
            totalMembers: 1,
            activeMembers: 1,
            totalEvents: 0,
            upcomingEvents: 0,
            totalMessages: 0,
            totalPhotos: 0,
            totalVideos: 0,
            totalDocuments: 0,
            safetyChecksSent: 0,
            emergencyAlerts: 0,
            lastActivity: new Date().toISOString(),
          },
        };
        return mockFamily;
      }

      const { data: hourse, error } = await supabase
        .from('families')
        .select(`
          *,
          members:family_members(
            id,
            user_id,
            role,
            joined_at,
            users(
              id,
              first_name,
              last_name,
              email,
              avatar_url
            )
          )
        `)
        .eq('id', familyId)
        .single();

      if (error) throw error;

      return {
        id: hourse.id,
        name: hourse.name,
        description: hourse.description,
        createdBy: hourse.created_by,
        members: hourse.members.map((member: any) => ({
          id: member.id,
          userId: member.user_id,
          role: member.role,
          joinedAt: member.joined_at,
          user: {
            id: member.users.id,
            firstName: member.users.first_name,
            lastName: member.users.last_name,
            email: member.users.email,
            avatar: member.users.avatar_url,
          },
        })),
        settings: hourse.settings,
        createdAt: hourse.created_at,
        updatedAt: hourse.updated_at,
      };
    } catch (error) {
      console.error('Error getting hourse:', error);
      return null;
    }
  }

  // Get user's families
  async getUserFamilies(userId: string): Promise<hourse[]> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        // Return mock data for development
        const mockFamily: hourse = {
          id: 'mock-hourse-1',
          name: 'Demo hourse',
          description: 'A demo hourse for development',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCurrent: true,
          settings: {},
          members: [],
          invitations: [],
          statistics: {
            totalMembers: 1,
            activeMembers: 1,
            totalEvents: 0,
            upcomingEvents: 0,
            totalMessages: 0,
            totalPhotos: 0,
            totalVideos: 0,
            totalDocuments: 0,
            safetyChecksSent: 0,
            emergencyAlerts: 0,
            lastActivity: new Date().toISOString(),
          },
        };
        return [mockFamily];
      }

      const { data: families, error } = await supabase
        .from('family_members')
        .select(`
          family_id,
          families(
            id,
            name,
            description,
            created_by,
            settings,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return families.map((item: any) => ({
        id: item.families.id,
        name: item.families.name,
        description: item.families.description,
        createdBy: item.families.created_by,
        members: [],
        settings: item.families.settings,
        createdAt: item.families.created_at,
        updatedAt: item.families.updated_at,
      }));
    } catch (error) {
      console.error('Error getting user families:', error);
      return [];
    }
  }

  // Add member to hourse
  async addMember(familyId: string, userId: string, role: string = 'member'): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Adding member to hourse');
        return;
      }

      const { error } = await supabase
        .from('family_members')
        .insert({
          family_id: familyId,
          user_id: userId,
          role,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding member:', error);
      throw new Error('Failed to add member to hourse');
    }
  }

  // Remove member from hourse
  async removeMember(familyId: string, userId: string): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Removing member from hourse');
        return;
      }

      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing member:', error);
      throw new Error('Failed to remove member from hourse');
    }
  }

  // Update member role
  async updateMemberRole(familyId: string, userId: string, role: string): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Updating member role');
        return;
      }

      const { error } = await supabase
        .from('family_members')
        .update({ role })
        .eq('family_id', familyId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw new Error('Failed to update member role');
    }
  }

  // Send invitation
  async sendInvitation(familyId: string, email: string, role: string = 'member'): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Sending invitation');
        return;
      }

      const { error } = await supabase
        .from('family_invitations')
        .insert({
          family_id: familyId,
          email,
          role,
          status: 'pending',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw new Error('Failed to send invitation');
    }
  }

  // Get pending invitations
  async getPendingInvitations(email: string): Promise<FamilyInvitation[]> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        // Return mock data for development
        return [];
      }

      const { data: invitations, error } = await supabase
        .from('family_invitations')
        .select(`
          *,
          families(
            id,
            name,
            description
          )
        `)
        .eq('email', email)
        .eq('status', 'pending');

      if (error) throw error;

      return invitations.map((invitation: any) => ({
        id: invitation.id,
        familyId: invitation.family_id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        createdAt: invitation.created_at,
        hourse: {
          id: invitation.families.id,
          name: invitation.families.name,
          description: invitation.families.description,
        },
      }));
    } catch (error) {
      console.error('Error getting invitations:', error);
      return [];
    }
  }

  // Accept invitation
  async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Accepting invitation');
        return;
      }

      // Get invitation details
      const { data: invitation, error: inviteError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (inviteError) throw inviteError;

      // Add user to hourse
      await this.addMember(invitation.family_id, userId, invitation.role);

      // Update invitation status
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw new Error('Failed to accept invitation');
    }
  }

  // Decline invitation
  async declineInvitation(invitationId: string): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Declining invitation');
        return;
      }

      const { error } = await supabase
        .from('family_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw new Error('Failed to decline invitation');
    }
  }

  // Update hourse settings
  async updateFamilySettings(familyId: string, settings: any): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Updating hourse settings');
        return;
      }

      const { error } = await supabase
        .from('families')
        .update({ settings })
        .eq('id', familyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating hourse settings:', error);
      throw new Error('Failed to update hourse settings');
    }
  }
}

export const familyService = FamilyService.getInstance(); 