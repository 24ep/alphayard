import express, { Response } from 'express'; // refresh

import { body, query as queryParam } from 'express-validator'; // Rename express-validator query
import { emailService } from '../services/emailService';
import { authenticateToken, requireCircleMember } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { query as dbQuery } from '../config/database'; // Rename DB query

// Online user tracking is currently handled inside the socket service;
// the isUserOnline helper has been removed to simplify typings.
const isUserOnline = (_userId: string): boolean => false;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken as any);

// List all circles (admin endpoint)
router.get('/list-all', async (req: any, res: Response): Promise<void> => {
  try {
    const { rows: circles } = await dbQuery(`
      SELECT 
        f.id, f.name, f.type, f.description, f.created_at, f.owner_id,
        COUNT(fm.user_id) as member_count
      FROM circles f
      LEFT JOIN circle_members fm ON f.id = fm.circle_id
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `);
    
    res.json({ circles });
  } catch (error) {
    console.error('List all circles error:', error);
    res.status(500).json({ error: 'Failed to fetch circles' });
  }
});

// Create new circle
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Circle name is required'),
  body('description').optional().trim(),
  body('circleTypeId').optional().isUUID(),
  body('type').optional().trim(),
  body('settings').optional().isObject(),
], validateRequest, async (req: any, res: Response): Promise<void> => {
  try {
    const { name, description, settings, circleTypeId, type } = req.body;
    const userId = req.user.id;

    // Start a transaction
    await dbQuery('BEGIN');

    // 1. Create circle
    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const { rows: circles } = await dbQuery(`
      INSERT INTO circles (name, description, created_by, owner_id, invite_code, settings, circle_type_id, type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, [name, description || '', userId, userId, inviteCode, settings || {}, circleTypeId || null, type || null]);

    const circle = circles[0];

    // 2. Add creator as admin/owner
    await dbQuery(`
      INSERT INTO circle_members (circle_id, user_id, role, joined_at)
      VALUES ($1, $2, $3, NOW())
    `, [circle.id, userId, 'owner']);

    await dbQuery('COMMIT');

    res.status(201).json({
      message: 'Circle created successfully',
      circle: {
        id: circle.id,
        name: circle.name,
        description: circle.description,
        createdBy: circle.created_by,
        ownerId: circle.owner_id,
        inviteCode: circle.invite_code,
        settings: circle.settings,
        createdAt: circle.created_at,
        updatedAt: circle.updated_at,
        members: [] // Initial member list not strictly needed in response but good for completeness
      }
    });

  } catch (error) {
    await dbQuery('ROLLBACK');
    console.error('Create circle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Join circle by invite code
router.post('/join', [
  body('inviteCode').trim().isLength({ min: 1 }).withMessage('Invite code is required'),
], validateRequest, async (req: any, res: Response): Promise<void> => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    // Find circle by invite code
    const { rows: circles } = await dbQuery(
      'SELECT id, name, invite_code FROM circles WHERE invite_code = $1',
      [inviteCode.toUpperCase()]
    );

    if (circles.length === 0) {
      res.status(404).json({
        error: 'Circle not found',
        message: 'Invalid invite code'
      });
      return;
    }

    const circle = circles[0];

    // Check if user is already a member
    const { rows: existingMember } = await dbQuery(
      'SELECT id FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [circle.id, userId]
    );

    if (existingMember.length > 0) {
      res.json({
        message: 'You are already a member of this circle',
        circle: {
          id: circle.id,
          name: circle.name
        }
      });
      return;
    }

    // Add user as member
    await dbQuery(`
      INSERT INTO circle_members (circle_id, user_id, role, joined_at)
      VALUES ($1, $2, $3, NOW())
    `, [circle.id, userId, 'member']);

    res.json({
      message: 'Successfully joined the circle',
      circle: {
        id: circle.id,
        name: circle.name
      }
    });

  } catch (error) {
    console.error('Join circle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Leave a circle
router.post('/leave', [
  body('circleId').isUUID().withMessage('Valid circle ID is required'),
], validateRequest, async (req: any, res: Response): Promise<void> => {
  try {
    const { circleId } = req.body;
    const userId = req.user.id;

    // Check if member exists
    const { rows: member } = await dbQuery(
      'SELECT role FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [circleId, userId]
    );

    if (member.length === 0) {
      res.status(404).json({
        error: 'Not a member',
        message: 'You are not a member of this circle'
      });
      return;
    }

    // Optional: Prevent leaving if last owner (logic omitted for simplicity, but recommended)

    await dbQuery(
      'DELETE FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [circleId, userId]
    );

    res.json({
      message: 'Successfully left the circle'
    });
  } catch (error) {
    console.error('Leave circle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// List all circles user belongs to
router.get('/', authenticateToken as any, async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    // Special handling for hardcoded admin user (not in DB with UUID)
    if (userId === 'admin') {
      res.json({
        circles: [],
        count: 0
      });
      return;
    }

    // Get all circles the user is a member of with details
    const { rows: memberships } = await dbQuery(`
      SELECT 
        fm.circle_id,
        fm.role,
        fm.joined_at,
        f.id,
        f.name,
        f.type,
        f.description,
        f.invite_code,
        f.created_at,
        f.updated_at,
        f.owner_id,
        (SELECT count(*) FROM circle_members WHERE circle_id = f.id) as member_count
      FROM circle_members fm
      JOIN circles f ON fm.circle_id = f.id
      WHERE fm.user_id = $1
    `, [userId]);

    const circles = memberships.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      type: m.type,
      inviteCode: m.invite_code,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      ownerId: m.owner_id,
      role: m.role,
      joinedAt: m.joined_at,
      membersCount: parseInt(m.member_count) || 0
    }));

    res.json({
      circles,
      count: circles.length
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

// Get user's circle
router.get('/my-circle', authenticateToken as any, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // First, find the user's circle
    const { rows: memberships } = await dbQuery(
      'SELECT circle_id FROM circle_members WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (memberships.length === 0) {
      return res.json({
        circle: null,
        message: 'User does not belong to any circle yet'
      });
    }

    const circleId = memberships[0].circle_id;

    // Get circle details
    const { rows: circles } = await dbQuery(
      'SELECT id, name, type, description, invite_code, created_at, owner_id, settings FROM circles WHERE id = $1',
      [circleId]
    );

    if (circles.length === 0) {
      return res.json({
        circle: null,
        message: 'circle not found'
      });
    }

    const circle = circles[0];

    // Get circle members with user details
    const { rows: members } = await dbQuery(`
      SELECT 
        fm.user_id,
        fm.role,
        fm.joined_at,
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        u.raw_user_meta_data as user_meta
      FROM circle_members fm
      LEFT JOIN public.users u ON fm.user_id = u.id -- using public.users now
      WHERE fm.circle_id = $1
    `, [circleId]);

    // Get circle stats
    const { rows: msgStats } = await dbQuery(
      'SELECT count(*) FROM messages WHERE circle_id = $1',
      [circleId]
    );
    const { rows: locStats } = await dbQuery(
      'SELECT count(*) FROM location_history WHERE circle_id = $1',
      [circleId]
    );

    res.json({
      circle: {
        ...circle,
        members: members.map(member => {
          const meta = member.user_meta || {};
          return {
            id: member.user_id,
            firstName: member.first_name || meta.firstName || 'Unknown',
            lastName: member.last_name || meta.lastName || '',
            email: member.email,
            avatar: member.avatar_url,
            role: member.role,
            joinedAt: member.joined_at,
            isOnline: isUserOnline(member.user_id),
            notifications: 0 // Mock notification count
          };
        }),
        stats: {
          totalMessages: parseInt(msgStats[0].count) || 0,
          totalLocations: parseInt(locStats[0].count) || 0,
          totalMembers: members.length
        }
      }
    });

  } catch (error) {
    console.error('Get circle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Shopping List Routes - Moved up to avoid collision with /:circleId
// Get shopping list items for circle
router.get('/shopping-list', requireCircleMember as any, async (req: any, res: Response) => {
  try {
    const circleId = req.circleId;

    const { rows: items } = await dbQuery(`
      SELECT 
        si.id, si.circle_id, si.item, si.quantity, si.category, si.completed, si.list_name, si.created_by, si.created_at, si.updated_at,
        u.first_name, u.last_name
      FROM shopping_items si
      LEFT JOIN public.users u ON si.created_by = u.id
      WHERE si.circle_id = $1
      ORDER BY si.created_at DESC
    `, [circleId]);

    res.json({
      items: items.map(item => ({
        id: item.id,
        item: item.item,
        quantity: item.quantity || '1',
        category: item.category || 'general',
        completed: item.completed || false,
        list: item.list_name || 'Groceries',
        createdBy: item.first_name ?
          `${item.first_name} ${item.last_name}` : 'Unknown',
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))
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
  requireCircleMember as any,
  body('item').isString().trim().isLength({ min: 1 }),
  body('quantity').optional().isString(),
  body('category').optional().isString(),
  body('list').optional().isString(),
], validateRequest, async (req: any, res: Response) => {
  try {
    const circleId = req.circleId;
    const { item, quantity, category, list } = req.body;

    const { rows: newItem } = await dbQuery(`
      INSERT INTO shopping_items (circle_id, item, quantity, category, list_name, completed, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, false, $6, NOW(), NOW())
      RETURNING *
    `, [
      circleId,
      item.trim(),
      quantity || '1',
      category || 'general',
      list || 'Groceries',
      req.user.id
    ]);

    res.status(201).json({
      item: {
        id: newItem[0].id,
        item: newItem[0].item,
        quantity: newItem[0].quantity,
        category: newItem[0].category,
        completed: newItem[0].completed,
        list: newItem[0].list_name,
        createdAt: newItem[0].created_at,
        updatedAt: newItem[0].updated_at
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
  requireCircleMember as any,
  body('item').optional().isString().trim(),
  body('quantity').optional().isString(),
  body('category').optional().isString(),
  body('completed').optional().isBoolean(),
  body('list').optional().isString(),
], validateRequest, async (req: any, res: Response) => {
  try {
    const circleId = req.circleId;
    const { itemId } = req.params;
    const { item, quantity, category, completed, list } = req.body;

    // Verify item belongs to circle
    const { rows: existing } = await dbQuery(
      'SELECT id FROM shopping_items WHERE id = $1 AND circle_id = $2',
      [itemId, circleId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Item not found', message: 'Shopping item not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (item !== undefined) {
      updates.push(`item = $${idx++}`);
      values.push(item);
    }
    if (quantity !== undefined) {
      updates.push(`quantity = $${idx++}`);
      values.push(quantity);
    }
    if (category !== undefined) {
      updates.push(`category = $${idx++}`);
      values.push(category);
    }
    if (completed !== undefined) {
      updates.push(`completed = $${idx++}`);
      values.push(completed);
    }
    if (list !== undefined) {
      updates.push(`list_name = $${idx++}`);
      values.push(list);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(itemId); // itemId for WHERE
      
      const { rows: updatedItem } = await dbQuery(
        `UPDATE shopping_items SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      res.json({
        message: 'Item updated',
        item: {
          id: updatedItem[0].id,
          item: updatedItem[0].item,
          quantity: updatedItem[0].quantity,
          category: updatedItem[0].category,
          completed: updatedItem[0].completed,
          list: updatedItem[0].list_name,
          createdAt: updatedItem[0].created_at,
          updatedAt: updatedItem[0].updated_at
        }
      });
    } else {
      res.json({ message: 'No changes made' });
    }

  } catch (error) {
    console.error('Update shopping item error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Delete shopping list item
router.delete('/shopping-list/:itemId', requireCircleMember as any, async (req: any, res: Response) => {
  try {
    const circleId = req.circleId;
    const { itemId } = req.params;

    // Verify item belongs to circle
    const { rows: existing } = await dbQuery(
      'SELECT id FROM shopping_items WHERE id = $1 AND circle_id = $2',
      [itemId, circleId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Item not found', message: 'Shopping item not found' });
    }

    await dbQuery('DELETE FROM shopping_items WHERE id = $1', [itemId]);

    res.json({ message: 'Item deleted successfully' });

  } catch (error) {
    console.error('Delete shopping item error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Get circle by ID (for admin or if user is a member)
router.get('/:circleId', authenticateToken as any, async (req: any, res: Response): Promise<void> => {
  try {
    const { circleId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.type === 'admin';

    // If not admin, verify user is a member
    if (!isAdmin) {
      const { rows } = await dbQuery(
        'SELECT 1 FROM circle_members WHERE circle_id = $1 AND user_id = $2',
        [circleId, userId]
      );
      if (rows.length === 0) {
        res.status(403).json({
          error: 'Access denied',
          message: 'You are not a member of this circle'
        });
        return;
      }
    }

    // Get circle details with owner info
    const { rows: circles } = await dbQuery(`
      SELECT 
        f.id, f.name, f.type, f.description, f.invite_code, f.created_at, f.updated_at, f.owner_id, f.settings,
        u.first_name, u.last_name, u.email
      FROM circles f
      LEFT JOIN public.users u ON f.owner_id = u.id
      WHERE f.id = $1
    `, [circleId]);

    if (circles.length === 0) {
      res.status(404).json({
        error: 'Circle not found',
        message: 'Circle not found'
      });
      return;
    }

    const circle = circles[0];

    // Get circle members
    const { rows: members } = await dbQuery(`
      SELECT 
        fm.user_id, fm.role, fm.joined_at,
        u.id, u.first_name, u.last_name, u.email, u.avatar_url,
        u.raw_user_meta_data as user_meta
      FROM circle_members fm
      LEFT JOIN public.users u ON fm.user_id = u.id
      WHERE fm.circle_id = $1
    `, [circleId]);

    // Get stats
    const { rows: msgStats } = await dbQuery('SELECT count(*) FROM messages WHERE circle_id = $1', [circleId]);
    const { rows: locStats } = await dbQuery('SELECT count(*) FROM location_history WHERE circle_id = $1', [circleId]);

    res.json({
      id: circle.id,
      name: circle.name,
      description: circle.description,
      type: circle.type,
      invite_code: circle.invite_code,
      settings: circle.settings,
      created_at: circle.created_at,
      updated_at: circle.updated_at,
      owner_id: circle.owner_id,
      owner: {
        id: circle.owner_id,
        first_name: circle.first_name,
        last_name: circle.last_name,
        email: circle.email
      },
      member_count: members.length,
      members: members.map(member => ({
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        user: {
          id: member.id,
          first_name: member.first_name || (member.user_meta?.firstName) || 'Unknown',
          last_name: member.last_name || (member.user_meta?.lastName) || '',
          email: member.email,
          avatar_url: member.avatar_url
        }
      })),
      stats: {
        totalMessages: parseInt(msgStats[0].count) || 0,
        totalLocations: parseInt(locStats[0].count) || 0,
        totalMembers: members.length
      }
    });

  } catch (error) {
    console.error('Get circle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
    return;
  }
});

// Update circle
router.put('/my-circle', [
  requireCircleMember as any,
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('type').optional().isIn(['circle', 'friends', 'sharehouse']),
  body('settings').optional().isObject()
], validateRequest, async (req: any, res: Response): Promise<void> => {
  try {
    const circleId = req.circleId;
    const circleRole = req.circleRole;
    const { name, description, type, settings } = req.body;

    // Check if user is owner or admin
    if (circleRole !== 'owner' && circleRole !== 'admin') {
      res.status(403).json({
        error: 'Access denied',
        message: 'Only circle owners and admins can update circle details'
      });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(description);
    }
    if (type) {
      updates.push(`type = $${idx++}`);
      values.push(type);
    }
    if (settings) {
      updates.push(`settings = settings || $${idx++}`);
      values.push(settings);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(circleId); // circleId for WHERE clause

      const { rows } = await dbQuery(
        `UPDATE circles SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      res.json({
        message: 'circle updated successfully',
        circle: rows[0]
      });
    } else {
      res.json({ message: 'No changes made' });
    }

  } catch (error) {
    console.error('Update circle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
    return;
  }
});

// Invite member to circle
router.post('/invite', [
  requireCircleMember as any,
  body('email').isEmail().normalizeEmail(),
  body('message').optional().trim()
], validateRequest, async (req: any, res: Response): Promise<void> => {
  try {
    const circleId = req.circleId;
    const circleRole = req.circleRole;
    const { email, message } = req.body;

    // Check if user can invite members
    if (circleRole !== 'owner' && circleRole !== 'admin') {
      res.status(403).json({
        error: 'Access denied',
        message: 'Only circle owners and admins can invite members'
      });
      return;
    }

    // Check if user is already a member
    const { rows: existingMembers } = await dbQuery(`
      SELECT fm.user_id, u.email, u.first_name 
      FROM circle_members fm
      LEFT JOIN public.users u ON fm.user_id = u.id
      WHERE fm.circle_id = $1
    `, [circleId]);

    const isAlreadyMember = existingMembers.some(m => m.email === email);
    if (isAlreadyMember) {
      res.status(400).json({
        error: 'User already a member',
        message: 'This user is already a member of your circle'
      });
      return;
    }

    // Check if invitation already exists
    const { rows: existingInvites } = await dbQuery(
      'SELECT id FROM circle_invitations WHERE circle_id = $1 AND email = $2 AND status = $3',
      [circleId, email, 'pending']
    );

    if (existingInvites.length > 0) {
      res.status(400).json({
        error: 'Invitation already sent',
        message: 'An invitation has already been sent to this email'
      });
      return;
    }

    // Ensure circle has an invite code
    const { rows: circles } = await dbQuery('SELECT id, name, invite_code FROM circles WHERE id = $1', [circleId]);
    let inviteCode = circles[0]?.invite_code;
    let circleName = circles[0]?.name;

    if (!inviteCode) {
      inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      await dbQuery(
        'UPDATE circles SET invite_code = $1, updated_at = NOW() WHERE id = $2',
        [inviteCode, circleId]
      );
    }

    // Create invitation
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { rows: newInvite } = await dbQuery(`
      INSERT INTO circle_invitations (circle_id, email, invited_by, message, status, created_at, expires_at)
      VALUES ($1, $2, $3, $4, 'pending', NOW(), $5)
      RETURNING *
    `, [circleId, email, req.user.id, message || '', expiresAt]);

    // Send email
    try {
      const inviter = existingMembers.find(m => m.user_id === req.user.id);
      const inviterName = inviter?.first_name || req.user.email;
      const frontendBaseUrl = process.env.FRONTEND_URL || process.env.MOBILE_APP_URL || 'https://bondarys.com';
      const inviteUrl = `${frontendBaseUrl.replace(/\/+$/, '')}/invite?code=${inviteCode}`;

      await emailService.sendCircleInvitation({
        inviterName,
        circleName: circleName || 'Your circle',
        inviteCode,
        inviteUrl,
        message
      }, email);
    } catch (e) {
      console.error('Email sending failed', e);
    }

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: newInvite[0]
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

// Get circle invitations
router.get('/invitations', requireCircleMember as any, async (req: any, res: Response) => {
  try {
    const circleId = req.circleId;

    const { rows: invitations } = await dbQuery(`
      SELECT 
        fi.id, fi.email, fi.message, fi.status, fi.created_at, fi.expires_at,
        u.first_name, u.last_name
      FROM circle_invitations fi
      LEFT JOIN public.users u ON fi.invited_by = u.id
      WHERE fi.circle_id = $1
      ORDER BY fi.created_at DESC
    `, [circleId]);

    res.json({
      invitations: invitations.map(invitation => ({
        id: invitation.id,
        email: invitation.email,
        message: invitation.message,
        status: invitation.status,
        createdAt: invitation.created_at,
        expiresAt: invitation.expires_at,
        invitedBy: invitation.first_name ?
          `${invitation.first_name} ${invitation.last_name}` : 'Unknown'
      }))
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
    const { invitationId } = req.params;

    // Get invitation
    const { rows: invitations } = await dbQuery(`
      SELECT fi.*, f.id as circle_id, f.name as circle_name
      FROM circle_invitations fi
      JOIN circles f ON fi.circle_id = f.id
      WHERE fi.id = $1
    `, [invitationId]);

    const invitation = invitations[0];

    if (!invitation) {
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
      await dbQuery(
        'UPDATE circle_invitations SET status = $1, updated_at = NOW() WHERE id = $2',
        ['expired', invitationId]
      );

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
    const { rows: existingMember } = await dbQuery(
      'SELECT id FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [invitation.circle_id, req.user.id]
    );

    if (existingMember.length > 0) {
      // Mark invitation as accepted even if already a member
      await dbQuery(
        'UPDATE circle_invitations SET status = $1, updated_at = NOW() WHERE id = $2',
        ['accepted', invitationId]
      );

      return res.status(200).json({
        message: 'You are already a member of this circle',
        alreadyMember: true
      });
    }

    // Add member
    await dbQuery(`
      INSERT INTO circle_members (circle_id, user_id, role, joined_at)
      VALUES ($1, $2, $3, NOW())
    `, [invitation.circle_id, req.user.id, invitation.role || 'member']);

    // Mark invitation as accepted
    await dbQuery(
      'UPDATE circle_invitations SET status = $1, updated_at = NOW() WHERE id = $2',
      ['accepted', invitationId]
    );

    res.json({
      message: 'Invitation accepted successfully',
      circleId: invitation.circle_id
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
    const { invitationId } = req.params;

    // Check invitation
    const { rows } = await dbQuery('SELECT id FROM circle_invitations WHERE id = $1', [invitationId]);
    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Invitation not found',
        message: 'Invitation not found'
      });
    }

    await dbQuery(
      'UPDATE circle_invitations SET status = $1, updated_at = NOW() WHERE id = $2',
      ['declined', invitationId]
    );

    res.json({ message: 'Invitation declined' });

  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Remove member (Admin only)
router.delete('/:circleId/members/:memberId', [
  requireCircleMember as any,
], async (req: any, res: Response): Promise<void> => {
  try {
    const { circleId, memberId } = req.params;
    const circleRole = req.circleRole;

    if (circleRole !== 'owner' && circleRole !== 'admin') {
      res.status(403).json({
        error: 'Access denied',
        message: 'Only owners and admins can remove members'
      });
      return;
    }

    if (memberId === req.user.id) {
       res.status(400).json({
         error: 'Cannot remove self',
         message: 'Use leave endpoint to remove yourself'
       });
       return;
    }

    // Check target member existence and role
    const { rows: target } = await dbQuery(
      'SELECT role FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [circleId, memberId]
    );

    if (target.length === 0) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    // Owner cannot be removed by admin (only by self or other owner logic?)
    if (target[0].role === 'owner') {
       res.status(403).json({
         error: 'Cannot remove owner',
         message: 'Owners cannot be removed'
       });
       return;
    }

    await dbQuery(
      'DELETE FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [circleId, memberId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update member role (Admin only)
router.put('/:circleId/members/:memberId', [
  requireCircleMember as any,
  body('role').isIn(['admin', 'member', 'moderator', 'guest']),
], validateRequest, async (req: any, res: Response): Promise<void> => {
   try {
     const { circleId, memberId } = req.params;
     const { role } = req.body;
     const circleRole = req.circleRole;

     if (circleRole !== 'owner' && circleRole !== 'admin') {
       res.status(403).json({ error: 'Access denied' });
       return;
     }

     // Validate logic (e.g. admin cannot demote owner, etc.)
     // Simplified for now.

     await dbQuery(
       'UPDATE circle_members SET role = $1 WHERE circle_id = $2 AND user_id = $3',
       [role, circleId, memberId]
     );

     res.json({ message: 'Member role updated' });
   } catch (error) {
     console.error('Update role error:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
});



// Get user's pending invitations (invitations sent to their email)
router.get('/invitations/pending', authenticateToken as any, async (req: any, res: Response) => {
  try {
    const userEmail = req.user.email;

    const { rows: invitations } = await dbQuery(`
      SELECT 
        fi.id, fi.circle_id, fi.email, fi.message, fi.status, fi.created_at, fi.expires_at,
        f.id as circle_id, f.name as circle_name, f.description as circle_desc,
        u.first_name, u.last_name
      FROM circle_invitations fi
      JOIN circles f ON fi.circle_id = f.id
      LEFT JOIN public.users u ON fi.invited_by = u.id
      WHERE fi.email = $1 AND fi.status = 'pending'
    `, [userEmail]);

    res.json({
      invitations: invitations.map(invitation => ({
        id: invitation.id,
        circleId: invitation.circle_id,
        email: invitation.email,
        message: invitation.message,
        status: invitation.status,
        createdAt: invitation.created_at,
        expiresAt: invitation.expires_at,
        circle: {
          id: invitation.circle_id,
          name: invitation.circle_name,
          description: invitation.circle_desc
        },
        invitedBy: invitation.first_name ?
          `${invitation.first_name} ${invitation.last_name}` : 'Unknown'
      }))
    });

  } catch (error) {
    console.error('Get pending invitations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Leave circle
router.post('/leave', requireCircleMember as any, async (req: any, res: Response) => {
  try {
    const circleId = req.circleId;
    const circleRole = req.circleRole;

    // Check if user is the owner
    if (circleRole === 'owner') {
      // Check if there are other members
      const { rows } = await dbQuery(
        'SELECT count(*) FROM circle_members WHERE circle_id = $1',
        [circleId]
      );

      const count = parseInt(rows[0].count);

      if (count > 1) {
        return res.status(400).json({
          error: 'Cannot leave circle',
          message: 'As the owner, you must transfer ownership or remove all other members before leaving'
        });
      }

      // If owner is the only member, delete the circle
      await dbQuery('DELETE FROM circles WHERE id = $1', [circleId]);
    } else {
      // Remove user from circle
      await dbQuery(
        'DELETE FROM circle_members WHERE circle_id = $1 AND user_id = $2',
        [circleId, req.user.id]
      );
    }

    res.json({
      message: 'Successfully left the circle'
    });

  } catch (error) {
    console.error('Leave circle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Shopping List Routes moved up

// Update shopping list item
router.put('/shopping-list/:itemId', [
  requireCircleMember as any,
  body('item').optional().isString().trim().isLength({ min: 1 }),
  body('quantity').optional().isString(),
  body('category').optional().isString(),
  body('completed').optional().isBoolean(),
  body('list').optional().isString(),
], validateRequest, async (req: any, res: Response) => {
  try {
    const circleId = req.circleId;
    const { itemId } = req.params;
    const { item, quantity, category, completed, list } = req.body;

    // Verify item belongs to circle
    const { rows: existing } = await dbQuery(
      'SELECT id, circle_id FROM shopping_items WHERE id = $1',
      [itemId]
    );

    if (existing.length === 0 || existing[0].circle_id !== circleId) {
      return res.status(404).json({
        error: 'Item not found',
        message: 'Shopping item not found'
      });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (item !== undefined) {
      updates.push(`item = $${idx++}`);
      values.push(item.trim());
    }
    if (quantity !== undefined) {
      updates.push(`quantity = $${idx++}`);
      values.push(quantity);
    }
    if (category !== undefined) {
      updates.push(`category = $${idx++}`);
      values.push(category);
    }
    if (completed !== undefined) {
      updates.push(`completed = $${idx++}`);
      values.push(completed);
    }
    if (list !== undefined) {
      updates.push(`list_name = $${idx++}`);
      values.push(list);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(itemId);

      const { rows: updatedItem } = await dbQuery(
        `UPDATE shopping_items SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      res.json({
        item: {
          id: updatedItem[0].id,
          item: updatedItem[0].item,
          quantity: updatedItem[0].quantity,
          category: updatedItem[0].category,
          completed: updatedItem[0].completed,
          list: updatedItem[0].list_name,
          createdAt: updatedItem[0].created_at,
          updatedAt: updatedItem[0].updated_at
        }
      });
    } else {
      res.json({ message: 'No changes made' });
    }

  } catch (error) {
    console.error('Update shopping item error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Delete shopping list item
router.delete('/shopping-list/:itemId', requireCircleMember as any, async (req: any, res: Response) => {
  try {
    const circleId = req.circleId;
    const { itemId } = req.params;

    // Verify item belongs to circle
    const { rows: existing } = await dbQuery(
      'SELECT id, circle_id FROM shopping_items WHERE id = $1',
      [itemId]
    );

    if (existing.length === 0 || existing[0].circle_id !== circleId) {
      return res.status(404).json({
        error: 'Item not found',
        message: 'Shopping item not found'
      });
    }

    await dbQuery('DELETE FROM shopping_items WHERE id = $1', [itemId]);

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

// Get events for a specific circle (must be a member of that circle)
router.get(
  '/:circleId/events',
  [
    queryParam('startDate').optional().isISO8601(),
    queryParam('endDate').optional().isISO8601(),
    queryParam('type').optional().isString(),
    queryParam('createdBy').optional().isUUID(),
  ],
  validateRequest,
  async (req: any, res: Response) => {
    try {
      const { circleId } = req.params;
      const { startDate, endDate, type, createdBy } = req.query;

      // Verify requester is a member of the requested circle
      const { rows: membership } = await dbQuery(
        'SELECT 1 FROM circle_members WHERE circle_id = $1 AND user_id = $2',
        [circleId, req.user.id]
      );

      if (membership.length === 0) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not a member of this circle',
        });
      }

      let sql = 'SELECT * FROM events WHERE circle_id = $1';
      const params: any[] = [circleId];
      let idx = 2;

      if (startDate) {
        sql += ` AND start_date >= $${idx++}`;
        params.push(startDate);
      }
      if (endDate) {
        sql += ` AND end_date <= $${idx++}`;
        params.push(endDate);
      }
      if (type) {
        sql += ` AND event_type = $${idx++}`;
        params.push(type);
      }
      if (createdBy) {
        sql += ` AND created_by = $${idx++}`;
        params.push(createdBy);
      }

      sql += ' ORDER BY start_date ASC';

      const { rows: events } = await dbQuery(sql, params);

      return res.json({ events: events });
    } catch (error) {
      console.error('Get circle events error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;


