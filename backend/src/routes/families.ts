import express, { Response } from 'express';
import { body } from 'express-validator';
import { getSupabaseClient } from '../services/supabaseService';
import { emailService } from '../services/emailService';
import { authenticateToken, requireFamilyMember } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { query } from 'express-validator';
// Online user tracking is currently handled inside the socket service;
// the isUserOnline helper has been removed to simplify typings.
const isUserOnline = (_userId: string): boolean => false;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken as any);

// List all families user belongs to
router.get('/', authenticateToken as any, async (req: any, res: Response): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    const userId = req.user.id;

    // Get all families the user is a member of
    const { data: memberships, error: membershipError } = await supabase
      .from('family_members')
      .select(`
        family_id,
        role,
        joined_at,
        families (
          id,
          name,
          type,
          description,
          invite_code,
          created_at,
          updated_at,
          owner_id
        )
      `)
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error fetching user families:', membershipError);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch families'
      });
      return;
    }

    // Get member counts for each family
    const familiesWithCounts = await Promise.all(
      (memberships || []).map(async (membership: any) => {
        const family = membership.families;
        if (!family) return null;

        // Get member count
        const { count } = await supabase
          .from('family_members')
          .select('id', { count: 'exact' })
          .eq('family_id', family.id);

        return {
          id: family.id,
          name: family.name,
          description: family.description,
          type: family.type,
          inviteCode: family.invite_code,
          createdAt: family.created_at,
          updatedAt: family.updated_at,
          ownerId: family.owner_id,
          role: membership.role,
          joinedAt: membership.joined_at,
          membersCount: count || 0
        };
      })
    );

    // Filter out null values
    const families = familiesWithCounts.filter(f => f !== null);

    res.json({
      families,
      count: families.length
    });

  } catch (error) {
    console.error('List families error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
    return;
  }
});

// Get family by ID (for admin or if user is a member)
router.get('/:familyId', authenticateToken as any, async (req: any, res: Response): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    const { familyId } = req.params;
    const userId = req.user.id;

    // Check if user is admin (for admin console access)
    const isAdmin = req.user.role === 'admin' || req.user.type === 'admin';

    // Get family details
    const { data: hourse, error: familyError } = await supabase
      .from('families')
      .select(`
        id,
        name,
        type,
        description,
        invite_code,
        created_at,
        updated_at,
        owner_id,
        users!owner_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', familyId)
      .single();

    if (familyError || !hourse) {
      res.status(404).json({
        error: 'Family not found',
        message: 'Family not found'
      });
      return;
    }

    // If not admin, verify user is a member
    if (!isAdmin) {
      const { data: membership } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('family_id', familyId)
        .eq('user_id', userId)
        .single();

      if (!membership) {
        res.status(403).json({
          error: 'Access denied',
          message: 'You are not a member of this family'
        });
        return;
      }
    }

    // Get family members
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select(`
        user_id,
        role,
        joined_at,
        users (
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          created_at
        )
      `)
      .eq('family_id', familyId);

    if (membersError) {
      console.error('Error fetching family members:', membersError);
    }

    // Get stats
    const { count: messageCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('family_id', familyId);

    const { count: locationCount } = await supabase
      .from('location_history')
      .select('id', { count: 'exact' })
      .eq('family_id', familyId);

    res.json({
      id: hourse.id,
      name: hourse.name,
      description: hourse.description,
      type: hourse.type,
      invite_code: hourse.invite_code,
      created_at: hourse.created_at,
      updated_at: hourse.updated_at,
      owner_id: hourse.owner_id,
      owner: hourse.users ? {
        id: (hourse.users as any).id,
        first_name: (hourse.users as any).first_name,
        last_name: (hourse.users as any).last_name,
        email: (hourse.users as any).email
      } : null,
      member_count: members?.length || 0,
      members: members?.map(member => ({
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        user: member.users ? {
          id: (member.users as any).id,
          first_name: (member.users as any).first_name,
          last_name: (member.users as any).last_name,
          email: (member.users as any).email,
          avatar_url: (member.users as any).avatar_url
        } : null
      })) || [],
      stats: {
        totalMessages: messageCount || 0,
        totalLocations: locationCount || 0,
        totalMembers: members?.length || 0
      }
    });

  } catch (error) {
    console.error('Get family error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
    return;
  }
});

// Get user's hourse
router.get('/my-hourse', requireFamilyMember as any, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;

    // Get hourse details
    const { data: hourse, error: familyError } = await supabase
      .from('families')
      .select(`
        id,
        name,
        type,
        description,
        invite_code,
        created_at,
        owner_id
      `)
      .eq('id', familyId)
      .single();

    if (familyError || !hourse) {
      return res.status(404).json({
        error: 'hourse not found',
        message: 'hourse not found'
      });
    }

    // Get hourse members
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select(`
        user_id,
        role,
        joined_at,
        users (
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq('family_id', familyId);

    if (membersError) {
      console.error('Error fetching hourse members:', membersError);
      return res.status(500).json({
        error: 'Failed to fetch hourse members',
        message: 'An error occurred while fetching hourse members'
      });
    }

    // Get hourse stats
    const { count: messageCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('family_id', familyId);

    const { count: locationCount } = await supabase
      .from('location_history')
      .select('id', { count: 'exact' })
      .eq('family_id', familyId);

    res.json({
      hourse: {
        ...hourse,
        members: members?.map(member => ({
          id: member.user_id,
          firstName: (member.users as any)?.first_name,
          lastName: (member.users as any)?.last_name,
          email: (member.users as any)?.email,
          avatar: (member.users as any)?.avatar_url,
          role: member.role,
          joinedAt: member.joined_at,
          isOnline: isUserOnline(member.user_id),
          notifications: Math.floor(Math.random() * 5)
        })) || [],
        stats: {
          totalMessages: messageCount || 0,
          totalLocations: locationCount || 0,
          totalMembers: members?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Get hourse error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Update hourse
router.put('/my-hourse', [
  requireFamilyMember as any,
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('type').optional().isIn(['hourse', 'friends', 'sharehouse'])
], validateRequest, async (req: any, res: Response): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;
    const familyRole = req.familyRole;
    const { name, description, type } = req.body;

    // Check if user is owner or admin
    if (familyRole !== 'owner' && familyRole !== 'admin') {
      res.status(403).json({
        error: 'Access denied',
        message: 'Only hourse owners and admins can update hourse details'
      });
      return;
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type) updateData.type = type;

    const { data: hourse, error } = await supabase
      .from('families')
      .update(updateData)
      .eq('id', familyId)
      .select()
      .single();

    if (error) {
      console.error('Update hourse error:', error);
      res.status(500).json({
        error: 'Failed to update hourse',
        message: 'An error occurred while updating hourse details'
      });
      return;
    }

    res.json({
      message: 'hourse updated successfully',
      hourse
    });

  } catch (error) {
    console.error('Update hourse error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
    return;
  }
});

// Invite member to hourse
router.post('/invite', [
  requireFamilyMember as any,
  body('email').isEmail().normalizeEmail(),
  body('message').optional().trim()
], validateRequest, async (req: any, res: Response): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;
    const familyRole = req.familyRole;
    const { email, message } = req.body;

    // Check if user can invite members
    if (familyRole !== 'owner' && familyRole !== 'admin') {
      res.status(403).json({
        error: 'Access denied',
        message: 'Only hourse owners and admins can invite members'
      });
      return;
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('user_id, users(email)')
      .eq('family_id', familyId);

    const isAlreadyMember = existingMember?.some(
      member => (member.users as any)?.email === email
    );

    if (isAlreadyMember) {
      res.status(400).json({
        error: 'User already a member',
        message: 'This user is already a member of your hourse'
      });
      return;
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('family_invitations')
      .select('id')
      .eq('family_id', familyId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      res.status(400).json({
        error: 'Invitation already sent',
        message: 'An invitation has already been sent to this email'
      });
      return;
    }

    // Ensure hourse has an invite code (used in email + join links)
    let inviteCode = null;
    const { data: family } = await supabase
      .from('families')
      .select('id, name, invite_code')
      .eq('id', familyId)
      .single();

    if (family) {
      inviteCode = family.invite_code;

      // If no invite_code yet, generate a simple one and persist it
      if (!inviteCode) {
        inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const { error: codeError } = await supabase
          .from('families')
          .update({ invite_code: inviteCode, updated_at: new Date().toISOString() })
          .eq('id', familyId);

        if (codeError) {
          console.warn('Failed to persist generated invite code:', codeError);
        }
      }
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('family_invitations')
      .insert({
        family_id: familyId,
        email,
        invited_by: req.user.id,
        message: message || '',
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single();

    if (error || !invitation) {
      console.error('Create invitation error:', error);
      res.status(500).json({
        error: 'Failed to send invitation',
        message: 'An error occurred while sending the invitation'
      });
      return;
    }

    // Send email invitation (best-effort)
    try {
      const inviterSourceList = (existingMember as any[]) || [];
      const inviterMatch: any = inviterSourceList.find(
        (m: any) => m.user_id === req.user.id && m.users && (m.users as any).first_name
      );
      const inviterName =
        inviterMatch?.users?.first_name || req.user.email;

      const frontendBaseUrl =
        process.env.FRONTEND_URL ||
        process.env.MOBILE_APP_URL ||
        'https://bondarys.com';

      const inviteUrl = `${frontendBaseUrl.replace(/\/+$/, '')}/invite?code=${inviteCode || ''}`;

      await emailService.sendFamilyInvitation(
        {
          inviterName,
          familyName: family?.name || 'Your hourse',
          inviteCode: inviteCode || '',
          inviteUrl,
          message,
        },
        email
      );
    } catch (emailError) {
      console.error('Failed to send family invitation email:', emailError);
      // Do not fail the HTTP request just because email sending failed
    }

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation
    });

  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
    return;
  }
});

// Get hourse invitations
router.get('/invitations', requireFamilyMember as any, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;

    const { data: invitations, error } = await supabase
      .from('family_invitations')
      .select(`
        id,
        email,
        message,
        status,
        created_at,
        expires_at,
        users!invited_by (
          first_name,
          last_name
        )
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get invitations error:', error);
      return res.status(500).json({
        error: 'Failed to fetch invitations',
        message: 'An error occurred while fetching invitations'
      });
    }

    res.json({
      invitations: invitations?.map(invitation => ({
        id: invitation.id,
        email: invitation.email,
        message: invitation.message,
        status: invitation.status,
        createdAt: invitation.created_at,
        expiresAt: invitation.expires_at,
        invitedBy: invitation.users ? 
          `${(invitation.users as any).first_name} ${(invitation.users as any).last_name}` : 
          'Unknown'
      })) || []
    });

  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Accept invitation (by invitation ID or code)
router.post('/invitations/:invitationId/accept', authenticateToken as any, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const { invitationId } = req.params;

    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('family_invitations')
      .select('*, families(id, name)')
      .eq('id', invitationId)
      .single();

    if (inviteError || !invitation) {
      return res.status(404).json({
        error: 'Invitation not found',
        message: 'This invitation does not exist or has expired'
      });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        error: 'Invitation already processed',
        message: `This invitation has already been ${invitation.status}`
      });
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('family_invitations')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', invitationId);

      return res.status(400).json({
        error: 'Invitation expired',
        message: 'This invitation has expired'
      });
    }

    // Verify email matches (if invitation has email)
    if (invitation.email && invitation.email !== req.user.email) {
      return res.status(403).json({
        error: 'Email mismatch',
        message: 'This invitation was sent to a different email address'
      });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', invitation.family_id)
      .eq('user_id', req.user.id)
      .single();

    if (existingMember) {
      // Mark invitation as accepted even if already a member
      await supabase
        .from('family_invitations')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', invitationId);

      return res.status(200).json({
        message: 'You are already a member of this hourse',
        alreadyMember: true
      });
    }

    // Add user as member
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: invitation.family_id,
        user_id: req.user.id,
        role: 'member', // Default role, can be changed by admin later
        joined_at: new Date().toISOString()
      });

    if (memberError) {
      console.error('Add member error:', memberError);
      return res.status(500).json({
        error: 'Failed to join hourse',
        message: 'An error occurred while joining the hourse'
      });
    }

    // Mark invitation as accepted
    await supabase
      .from('family_invitations')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', invitationId);

    res.json({
      message: 'Successfully joined the hourse',
      family: invitation.families
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Decline invitation
router.post('/invitations/:invitationId/decline', authenticateToken as any, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const { invitationId } = req.params;

    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('family_invitations')
      .select('id, email, status')
      .eq('id', invitationId)
      .single();

    if (inviteError || !invitation) {
      return res.status(404).json({
        error: 'Invitation not found',
        message: 'This invitation does not exist'
      });
    }

    // Verify email matches (if invitation has email)
    if (invitation.email && invitation.email !== req.user.email) {
      return res.status(403).json({
        error: 'Email mismatch',
        message: 'This invitation was sent to a different email address'
      });
    }

    // Mark invitation as declined
    const { error: updateError } = await supabase
      .from('family_invitations')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', invitationId);

    if (updateError) {
      console.error('Decline invitation error:', updateError);
      return res.status(500).json({
        error: 'Failed to decline invitation',
        message: 'An error occurred while declining the invitation'
      });
    }

    res.json({
      message: 'Invitation declined successfully'
    });

  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Get user's pending invitations (invitations sent to their email)
router.get('/invitations/pending', authenticateToken as any, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const userEmail = req.user.email;

    const { data: invitations, error } = await supabase
      .from('family_invitations')
      .select(`
        id,
        family_id,
        email,
        message,
        status,
        created_at,
        expires_at,
        families (
          id,
          name,
          description
        ),
        users!invited_by (
          first_name,
          last_name
        )
      `)
      .eq('email', userEmail)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get pending invitations error:', error);
      return res.status(500).json({
        error: 'Failed to fetch invitations',
        message: 'An error occurred while fetching invitations'
      });
    }

    res.json({
      invitations: invitations?.map(inv => ({
        id: inv.id,
        familyId: inv.family_id,
        email: inv.email,
        message: inv.message,
        status: inv.status,
        createdAt: inv.created_at,
        expiresAt: inv.expires_at,
        family: inv.families ? {
          id: (inv.families as any).id,
          name: (inv.families as any).name,
          description: (inv.families as any).description
        } : null,
        invitedBy: inv.users ? 
          `${(inv.users as any).first_name} ${(inv.users as any).last_name}` : 
          'Unknown'
      })) || []
    });

  } catch (error) {
    console.error('Get pending invitations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Leave hourse
router.post('/leave', requireFamilyMember as any, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;
    const familyRole = req.familyRole;

    // Check if user is the owner
    if (familyRole === 'owner') {
      // Check if there are other members
      const { count } = await supabase
        .from('family_members')
        .select('user_id', { count: 'exact' })
        .eq('family_id', familyId);

      if (count && count > 1) {
        return res.status(400).json({
          error: 'Cannot leave hourse',
          message: 'As the owner, you must transfer ownership or remove all other members before leaving'
        });
      }

      // If owner is the only member, delete the hourse
      await supabase
        .from('families')
        .delete()
        .eq('id', familyId);
    } else {
      // Remove user from hourse
      await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', req.user.id);
    }

    res.json({
      message: 'Successfully left the hourse'
    });

  } catch (error) {
    console.error('Leave hourse error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Shopping List Routes
// Get shopping list items for hourse
router.get('/shopping-list', requireFamilyMember as any, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;

    const { data: items, error } = await supabase
      .from('shopping_items')
      .select(`
        id,
        family_id,
        item,
        quantity,
        category,
        completed,
        list_name,
        created_by,
        created_at,
        updated_at,
        users!created_by (
          first_name,
          last_name
        )
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get shopping list error:', error);
      return res.status(500).json({
        error: 'Failed to fetch shopping list',
        message: 'An error occurred while fetching shopping items'
      });
    }

    res.json({
      items: items?.map(item => ({
        id: item.id,
        item: item.item,
        quantity: item.quantity || '1',
        category: item.category || 'general',
        completed: item.completed || false,
        list: item.list_name || 'Groceries',
        createdBy: item.users ? 
          `${(item.users as any).first_name} ${(item.users as any).last_name}` : 
          'Unknown',
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })) || []
    });

  } catch (error) {
    console.error('Get shopping list error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Create shopping list item
router.post('/shopping-list', [
  requireFamilyMember as any,
  body('item').isString().trim().isLength({ min: 1 }),
  body('quantity').optional().isString(),
  body('category').optional().isString(),
  body('list').optional().isString(),
], validateRequest, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;
    const { item, quantity, category, list } = req.body;

    const { data: newItem, error } = await supabase
      .from('shopping_items')
      .insert({
        family_id: familyId,
        item: item.trim(),
        quantity: quantity || '1',
        category: category || 'general',
        list_name: list || 'Groceries',
        completed: false,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Create shopping item error:', error);
      return res.status(500).json({
        error: 'Failed to create shopping item',
        message: 'An error occurred while creating the item'
      });
    }

    res.status(201).json({
      item: {
        id: newItem.id,
        item: newItem.item,
        quantity: newItem.quantity,
        category: newItem.category,
        completed: newItem.completed,
        list: newItem.list_name,
        createdAt: newItem.created_at,
        updatedAt: newItem.updated_at
      }
    });

  } catch (error) {
    console.error('Create shopping item error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Update shopping list item
router.put('/shopping-list/:itemId', [
  requireFamilyMember as any,
  body('item').optional().isString().trim().isLength({ min: 1 }),
  body('quantity').optional().isString(),
  body('category').optional().isString(),
  body('completed').optional().isBoolean(),
  body('list').optional().isString(),
], validateRequest, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;
    const { itemId } = req.params;
    const { item, quantity, category, completed, list } = req.body;

    // Verify item belongs to hourse
    const { data: existing } = await supabase
      .from('shopping_items')
      .select('id, family_id')
      .eq('id', itemId)
      .single();

    if (!existing || existing.family_id !== familyId) {
      return res.status(404).json({
        error: 'Item not found',
        message: 'Shopping item not found'
      });
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };

    if (item !== undefined) updatePayload.item = item.trim();
    if (quantity !== undefined) updatePayload.quantity = quantity;
    if (category !== undefined) updatePayload.category = category;
    if (completed !== undefined) updatePayload.completed = completed;
    if (list !== undefined) updatePayload.list_name = list;

    const { data: updatedItem, error } = await supabase
      .from('shopping_items')
      .update(updatePayload)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Update shopping item error:', error);
      return res.status(500).json({
        error: 'Failed to update shopping item',
        message: 'An error occurred while updating the item'
      });
    }

    res.json({
      item: {
        id: updatedItem.id,
        item: updatedItem.item,
        quantity: updatedItem.quantity,
        category: updatedItem.category,
        completed: updatedItem.completed,
        list: updatedItem.list_name,
        createdAt: updatedItem.created_at,
        updatedAt: updatedItem.updated_at
      }
    });

  } catch (error) {
    console.error('Update shopping item error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Delete shopping list item
router.delete('/shopping-list/:itemId', requireFamilyMember as any, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;
    const { itemId } = req.params;

    // Verify item belongs to hourse
    const { data: existing } = await supabase
      .from('shopping_items')
      .select('id, family_id')
      .eq('id', itemId)
      .single();

    if (!existing || existing.family_id !== familyId) {
      return res.status(404).json({
        error: 'Item not found',
        message: 'Shopping item not found'
      });
    }

    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Delete shopping item error:', error);
      return res.status(500).json({
        error: 'Failed to delete shopping item',
        message: 'An error occurred while deleting the item'
      });
    }

    res.json({
      success: true,
      message: 'Shopping item deleted successfully'
    });

  } catch (error) {
    console.error('Delete shopping item error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

export default router;

// Get events for a specific hourse (must be a member of that hourse)
router.get(
  '/:familyId/events',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('type').optional().isString(),
    query('createdBy').optional().isUUID(),
  ],
  validateRequest,
  async (req: any, res: Response) => {
    try {
      const supabase = getSupabaseClient();
      const { familyId } = req.params as { familyId: string };
      const { startDate, endDate, type, createdBy } = req.query as Record<string, string>;

      // Verify requester is a member of the requested hourse
      const { data: membership } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('family_id', familyId)
        .eq('user_id', req.user.id)
        .single();
      if (!membership) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not a member of this hourse',
        });
      }

      let queryBuilder = supabase
        .from('events')
        .select('*')
        .eq('family_id', familyId)
        .order('start_date', { ascending: true });

      if (startDate) queryBuilder = queryBuilder.gte('start_date', startDate);
      if (endDate) queryBuilder = queryBuilder.lte('end_date', endDate);
      if (type) queryBuilder = queryBuilder.eq('event_type', type);
      if (createdBy) queryBuilder = queryBuilder.eq('created_by', createdBy);

      const { data, error } = await queryBuilder;
      if (error) {
        console.error('Get hourse events error:', error);
        return res.status(500).json({ error: 'Failed to fetch hourse events' });
      }

      return res.json({ events: data || [] });
    } catch (error) {
      console.error('Get hourse events error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);
