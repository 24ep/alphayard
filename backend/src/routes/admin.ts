import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import emailService from '../services/emailService';
import { UserModel } from '../models/UserModel';
import { ApplicationModel } from '../models/ApplicationModel';
import { auditAdminRequests } from '../middleware/audit';

const router = express.Router();

// Apply audit middleware to admin router
router.use(auditAdminRequests());

// POST /api/admin/impersonate
router.post('/impersonate', authenticateToken as any, async (req: any, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Store impersonation info in session (if using cookie sessions) or issue a special token.
    if (req.session) {
      req.session.impersonateUserId = userId;
    }
    res.json({ message: 'Impersonation started', userId });
  } catch (e) {
    console.error('Impersonate error', e);
    res.status(500).json({ error: 'Failed to impersonate' });
  }
});

// POST /api/admin/stop-impersonate
router.post('/stop-impersonate', authenticateToken as any, async (req: any, res: Response) => {
  try {
    if (req.session) {
      delete req.session.impersonateUserId;
    }
    res.json({ message: 'Impersonation stopped' });
  } catch (e) {
    console.error('Stop impersonate error', e);
    res.status(500).json({ error: 'Failed to stop impersonation' });
  }
});

// Admin middleware - require admin role
const requireAdmin = requireRole('admin');

// Validation middleware
const validateUserUpdate = [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['user', 'admin', 'moderator', 'super_admin']),
  body('status').optional().isIn(['active', 'inactive', 'suspended']),
  body('is_active').optional().isBoolean(),
  body('metadata').optional().isObject(),
  body('phone').optional().trim(),
];

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    
    // Get basic stats using pool.query
    const basicsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
        (SELECT COUNT(*) FROM circles) as total_families,
        (SELECT COUNT(*) FROM subscriptions WHERE status IN ('active', 'trialing')) as active_subscriptions,
        (SELECT COALESCE(SUM(jsonb_array_length(COALESCE(branding->'screens', '[]'::jsonb))), 0) FROM applications WHERE is_active = true) as total_screens
    `;
    const { rows: basics } = await pool.query(basicsQuery);
    const { total_users, active_users, total_families, active_subscriptions, total_screens } = basics[0];

    // Get recent activity counts
    const recentQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '1 day' * $1) as recent_users,
        (SELECT COUNT(*) FROM circles WHERE created_at >= NOW() - INTERVAL '1 day' * $1) as recent_families,
        (SELECT COUNT(*) FROM safety_alerts WHERE created_at >= NOW() - INTERVAL '1 day' * $1) as recent_alerts,
        (SELECT COUNT(*) FROM chat_messages WHERE created_at >= NOW() - INTERVAL '1 day' * $1) as recent_messages
    `;
    const { rows: recent } = await pool.query(recentQuery, [days]);
    const { recent_users, recent_families, recent_alerts, recent_messages } = recent[0];

    // Get revenue stats from subscriptions
    const revenueQuery = `
      SELECT 
        COALESCE(SUM((plan->>'price')::NUMERIC), 0) as total_revenue,
        COALESCE(AVG((plan->>'price')::NUMERIC), 0) as avg_revenue,
        COUNT(*) as subscription_count
      FROM subscriptions
      WHERE created_at >= NOW() - INTERVAL '1 day' * $1
    `;
    const { rows: revenue } = await pool.query(revenueQuery, [days]);

    // Get user growth by day
    const growthQuery = `
      SELECT 
        EXTRACT(YEAR FROM created_at) as year,
        EXTRACT(MONTH FROM created_at) as month,
        EXTRACT(DAY FROM created_at) as day,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '1 day' * $1
      GROUP BY year, month, day
      ORDER BY year, month, day
    `;
    const { rows: userGrowth } = await pool.query(growthQuery, [days]);

    res.json({
      stats: {
        totalUsers: parseInt(total_users),
        activeUsers: parseInt(active_users),
        totalFamilies: parseInt(total_families),
        activeSubscriptions: parseInt(active_subscriptions),
        totalScreens: parseInt(total_screens),
        recentUsers: parseInt(recent_users),
        recentFamilies: parseInt(recent_families),
        recentAlerts: parseInt(recent_alerts),
        recentMessages: parseInt(recent_messages),
        revenue: {
          totalRevenue: parseFloat(revenue[0].total_revenue),
          avgRevenue: parseFloat(revenue[0].avg_revenue),
          subscriptionCount: parseInt(revenue[0].subscription_count),
        },
      },
      userGrowth: userGrowth.map(row => ({
        _id: { year: parseInt(row.year), month: parseInt(row.month), day: parseInt(row.day) },
        count: parseInt(row.count)
      })),
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private/Admin
router.get('/users', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      circle,
      subscription,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const params: any[] = [];
    let paramIdx = 1;
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ` AND (u.email ILIKE $${paramIdx} OR u.first_name ILIKE $${paramIdx} OR u.last_name ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (role) {
      whereClause += ` AND u.raw_user_meta_data->>'role' = $${paramIdx}`;
      params.push(role);
      paramIdx++;
    }

    if (status) {
      whereClause += ` AND u.is_active = $${paramIdx}`;
      params.push(status === 'active');
      paramIdx++;
    }

    if (circle === 'true') {
      whereClause += ` AND EXISTS (SELECT 1 FROM circle_members cm WHERE cm.user_id = u.id)`;
    } else if (circle === 'false') {
      whereClause += ` AND NOT EXISTS (SELECT 1 FROM circle_members cm WHERE cm.user_id = u.id)`;
    }

    if (subscription === 'true') {
      whereClause += ` AND EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id AND s.status IN ('active', 'trialing'))`;
    } else if (subscription === 'false') {
      whereClause += ` AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id AND s.status IN ('active', 'trialing'))`;
    }

    const sortField = ['created_at', 'email', 'first_name', 'last_name'].includes(sortBy as string) ? sortBy : 'created_at';
    const direction = (sortOrder as string).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const usersQuery = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url, u.phone, u.is_active, u.created_at,
             u.raw_user_meta_data as metadata,
             (SELECT json_agg(json_build_object('id', c.id, 'name', c.name)) 
              FROM circles c 
              JOIN circle_members cm ON c.id = cm.circle_id 
              WHERE cm.user_id = u.id) as circles
      FROM users u
      ${whereClause}
      ORDER BY u.${sortField} ${direction}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM users u ${whereClause}`;

    const [usersRes, countRes] = await Promise.all([
      pool.query(usersQuery, [...params, parseInt(limit as string), offset]),
      pool.query(countQuery, params)
    ]);

    const total = parseInt(countRes.rows[0].count);

    res.json({
      users: usersRes.rows,
      totalPages: Math.ceil(total / parseInt(limit as string)),
      currentPage: parseInt(page as string),
      total,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Private/Admin
router.get('/users/:id', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Get user with circles
    const userQuery = `
      SELECT u.*,
             (SELECT json_agg(json_build_object(
               'id', c.id, 
               'name', c.name,
               'members', (SELECT count(*) FROM circle_members WHERE circle_id = c.id)
             ))
              FROM circles c 
              JOIN circle_members cm ON c.id = cm.circle_id 
              WHERE cm.user_id = u.id) as circles
      FROM users u
      WHERE u.id = $1
    `;
    const { rows: userRows } = await pool.query(userQuery, [userId]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRows[0];

    // Get user's subscription
    const { rows: subRows } = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    // Get user's recent activity (from safety_alerts)
    const { rows: recentAlerts } = await pool.query(
      "SELECT * FROM safety_alerts WHERE user_id = $1 AND type = 'emergency' ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const { rows: recentSafetyChecks } = await pool.query(
      "SELECT * FROM safety_alerts WHERE user_id = $1 AND type = 'check_in' ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    res.json({
      user,
      subscription: subRows[0] || null,
      recentActivity: {
        alerts: recentAlerts,
        safetyChecks: recentSafetyChecks,
      },
    });
  } catch (error: any) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', authenticateToken as any, requireAdmin as any, validateUserUpdate, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, role, status, is_active, metadata, phone, notes } = req.body;

    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields using UserModel static
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    
    // Support both 'status' and 'is_active'
    if (is_active !== undefined) {
      updateData.isActive = is_active;
    } else if (status !== undefined) {
      updateData.isActive = (status === 'active');
    }

    if (metadata !== undefined) updateData.metadata = metadata;
    if (notes !== undefined) updateData.adminNotes = notes;

    const updated = await UserModel.findByIdAndUpdate(req.params.id, updateData);
    if (!updated) return res.status(500).json({ error: 'Failed to update user' });

    // Fetch the updated user row to return to the frontend
    const { rows } = await pool.query('SELECT *, raw_user_meta_data as metadata FROM users WHERE id = $1', [req.params.id]);
    const userRow = rows[0];

    res.json({
      message: 'User updated successfully',
      user: userRow
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.metadata?.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    // Delete user from DB (Cascade will handle safety_alerts, messages, circle_members if configured)
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/users/:id/suspend
// @desc    Suspend user
// @access  Private/Admin
router.post('/users/:id/suspend', authenticateToken as any, requireAdmin as any, [
  body('reason').notEmpty().trim(),
  body('duration').optional().isInt({ min: 1 }),
], async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason, duration } = req.body;

    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const suspension = {
      reason,
      suspendedAt: new Date(),
      suspendedBy: req.user.id,
      duration: duration ? duration * 24 * 60 * 60 * 1000 : null,
      expiresAt: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null,
    };

    await UserModel.findByIdAndUpdate(req.params.id, {
      status: 'suspended',
      isActive: false,
      suspension
    });

    // Send suspension email
    await emailService.sendEmail({
      to: user.email,
      subject: 'Account Suspended',
      template: 'account-suspended',
      data: {
        name: user.firstName,
        reason,
        duration: duration ? `${duration} days` : 'indefinitely',
        supportEmail: process.env.SUPPORT_EMAIL,
      },
    });

    res.json({
      message: 'User suspended successfully',
      suspension,
    });
  } catch (error: any) {
    console.error('Suspend user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/users/:id/unsuspend
// @desc    Unsuspend user
// @access  Private/Admin
router.post('/users/:id/unsuspend', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await UserModel.findByIdAndUpdate(req.params.id, {
      status: 'active',
      isActive: true,
      suspension: null
    });

    // Send unsuspension email
    await emailService.sendEmail({
      to: user.email,
      subject: 'Account Reactivated',
      template: 'account-reactivated',
      data: {
        name: user.firstName,
      },
    });

    res.json({ message: 'User unsuspended successfully' });
  } catch (error: any) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/families
// @desc    Get all families
// @access  Private/Admin
router.get('/families', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    const offset = (parseInt(page as string)-1) * parseInt(limit as string);
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIdx = 1;

    if (search) {
      whereClause += ` AND f.name ILIKE $${paramIdx}`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    const sortField = ['created_at', 'name'].includes(sortBy as string) ? sortBy : 'created_at';
    const direction = (sortOrder as string).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const familiesQuery = `
      SELECT f.*,
             (SELECT COUNT(*) FROM circle_members cm WHERE cm.circle_id = f.id) as member_count,
             u.email as owner_email,
             u.first_name || ' ' || u.last_name as owner_name
      FROM circles f
      LEFT JOIN users u ON f.created_by = u.id
      ${whereClause}
      ORDER BY f.${sortField} ${direction}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM circles f ${whereClause}`;

    const [familiesRes, countRes] = await Promise.all([
      pool.query(familiesQuery, [...params, parseInt(limit as string), offset]),
      pool.query(countQuery, params)
    ]);

    const total = parseInt(countRes.rows[0].count);

    res.json({
      families: familiesRes.rows,
      totalPages: Math.ceil(total / parseInt(limit as string)),
      currentPage: parseInt(page as string),
      total,
    });
  } catch (error: any) {
    console.error('Get families error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/families/:id
// @desc    Get family details
// @access  Private/Admin
router.get('/families/:id', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const familyId = req.params.id;

    // Get family details
    const familyQuery = `
      SELECT f.*,
             u.email as owner_email,
             u.first_name || ' ' || u.last_name as owner_name
      FROM circles f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE f.id = $1
    `;
    const { rows: familyRows } = await pool.query(familyQuery, [familyId]);

    if (familyRows.length === 0) {
      return res.status(404).json({ message: 'Family not found' });
    }

    const family = familyRows[0];

    // Get members
    const { rows: members } = await pool.query(`
      SELECT cm.role, cm.joined_at, u.id, u.email, u.first_name, u.last_name, u.avatar_url
      FROM circle_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.circle_id = $1
    `, [familyId]);

    res.json({
      ...family,
      members
    });
  } catch (error: any) {
    console.error('Get family details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/families
// @desc    Create new family
// @access  Private/Admin
router.post('/families', authenticateToken as any, requireAdmin as any, [
  body('name').notEmpty().trim(),
], async (req: any, res: Response) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, type, adminId } = req.body;

    await client.query('BEGIN');

    const { rows: circleRows } = await client.query(
      `INSERT INTO circles (name, description, settings, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description || '', { type: type || 'Circle' }, adminId || req.user.id]
    );

    const family = circleRows[0];

    if (adminId) {
      await client.query(
        `INSERT INTO circle_members (circle_id, user_id, role)
         VALUES ($1, $2, $3)`,
        [family.id, adminId, 'admin']
      );
    }

    await client.query('COMMIT');
    res.status(201).json(family);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Create family error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    client.release();
  }
});

// @route   PUT /api/admin/families/:id
// @desc    Update family
// @access  Private/Admin
router.put('/families/:id', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const { name, description, type } = req.body;
    const familyId = req.params.id;

    const { rows } = await pool.query(
      `UPDATE circles SET 
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         settings = settings || $3::jsonb,
         is_active = COALESCE($4, is_active),
         updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [
        name !== undefined ? name : null, 
        description !== undefined ? description : null, 
        type ? JSON.stringify({ type }) : '{}',
        req.body.is_active !== undefined ? req.body.is_active : null,
        familyId
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Family not found' });
    }

    res.json({
      message: 'Family updated successfully',
      family: rows[0],
    });
  } catch (error: any) {
    console.error('Update family error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/families/:id
// @desc    Delete family
// @access  Private/Admin
router.delete('/families/:id', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const familyId = req.params.id;
    
    // Check if family exists
    const { rows } = await pool.query('SELECT id FROM circles WHERE id = $1', [familyId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Delete family (cascade should handle members, rooms, messages if configured)
    await pool.query('DELETE FROM circles WHERE id = $1', [familyId]);

    res.json({ message: 'Family deleted successfully' });
  } catch (error: any) {
    console.error('Delete family error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/subscriptions
// @desc    Get all subscriptions
// @access  Private/Admin
router.get('/subscriptions', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      plan,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    const offset = (parseInt(page as string)-1) * parseInt(limit as string);
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIdx = 1;

    if (status) {
      whereClause += ` AND s.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (plan) {
      whereClause += ` AND s.plan->>'id' = $${paramIdx}`;
      params.push(plan);
      paramIdx++;
    }

    const sortField = ['created_at', 'status'].includes(sortBy as string) ? sortBy : 'created_at';
    const direction = (sortOrder as string).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const subsQuery = `
      SELECT s.*,
             u.email as user_email,
             u.first_name || ' ' || u.last_name as user_name,
             c.name as circle_name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN circles c ON s.family_id = c.id
      ${whereClause}
      ORDER BY s.${sortField} ${direction}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM subscriptions s ${whereClause}`;

    const [subsRes, countRes] = await Promise.all([
      pool.query(subsQuery, [...params, parseInt(limit as string), offset]),
      pool.query(countQuery, params)
    ]);

    const total = parseInt(countRes.rows[0].count);

    res.json({
      subscriptions: subsRes.rows,
      totalPages: Math.ceil(total / parseInt(limit as string)),
      currentPage: parseInt(page as string),
      total,
    });
  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/alerts
// @desc    Get emergency alerts
// @access  Private/Admin
router.get('/alerts', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    const offset = (parseInt(page as string)-1) * parseInt(limit as string);
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIdx = 1;

    if (status) {
      whereClause += ` AND sa.is_acknowledged = $${paramIdx}`;
      params.push(status === 'resolved' || status === 'acknowledged');
      paramIdx++;
    }

    if (type) {
      whereClause += ` AND sa.type = $${paramIdx}`;
      params.push(type);
      paramIdx++;
    }

    const sortField = ['created_at'].includes(sortBy as string) ? sortBy : 'created_at';
    const direction = (sortOrder as string).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const alertsQuery = `
      SELECT sa.*,
             u.email as user_email,
             u.first_name || ' ' || u.last_name as user_name
      FROM safety_alerts sa
      JOIN users u ON sa.user_id = u.id
      ${whereClause}
      ORDER BY sa.${sortField} ${direction}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM safety_alerts sa ${whereClause}`;

    const [alertsRes, countRes] = await Promise.all([
      pool.query(alertsQuery, [...params, parseInt(limit as string), offset]),
      pool.query(countQuery, params)
    ]);

    const total = parseInt(countRes.rows[0].count);

    res.json({
      alerts: alertsRes.rows,
      totalPages: Math.ceil(total / parseInt(limit as string)),
      currentPage: parseInt(page as string),
      total,
    });
  } catch (error: any) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/system
// @desc    Get system information
// @access  Private/Admin
router.get('/system', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    // Check DB connection
    let dbStatus = 'disconnected';
    try {
      await pool.query('SELECT 1');
      dbStatus = 'connected';
    } catch (e) {}

    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: {
        connection: dbStatus,
      },
      redis: {
        connection: 'connected',
      },
    };

    res.json({ systemInfo });
  } catch (error: any) {
    console.error('Get system info error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/broadcast
// @desc    Send broadcast message
// @access  Private/Admin
router.post('/broadcast', authenticateToken as any, requireAdmin as any, [
  body('title').notEmpty().trim(),
  body('message').notEmpty().trim(),
  body('type').isIn(['notification', 'email', 'both']),
  body('target').optional().isIn(['all', 'active', 'premium']),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type, target = 'all' } = req.body;

    let userQuery = 'SELECT id, email, first_name FROM users WHERE is_active = true';
    if (target === 'premium') {
      userQuery = `
        SELECT u.id, u.email, u.first_name 
        FROM users u 
        JOIN subscriptions s ON u.id = s.user_id 
        WHERE u.is_active = true AND s.status IN ('active', 'trialing')
      `;
    }

    const { rows: users } = await pool.query(userQuery);
    const results: any[] = [];

    for (const user of users) {
      try {
        if (type === 'email' || type === 'both') {
          await emailService.sendEmail({
            to: user.email,
            subject: title,
            template: 'admin-broadcast',
            data: {
              name: user.first_name,
              message,
            },
          });
        }
        // Notification logic would go here

        results.push({
          userId: user.id,
          email: user.email,
          success: true,
        });
      } catch (error: any) {
        results.push({
          userId: user.id,
          email: user.email,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      message: 'Broadcast sent successfully',
      results: {
        total: users.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        details: results,
      },
    });
  } catch (error: any) {
    console.error('Broadcast error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/social-posts
// @desc    Get all social posts for admin
// @access  Private/Admin
router.get('/social-posts', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const { rows: posts } = await pool.query(`
      SELECT sp.*, 
             u.first_name, u.last_name, u.email as user_email,
             f.name as circle_name
      FROM social_posts sp
      LEFT JOIN users u ON sp.author_id = u.id
      LEFT JOIN circles f ON sp.family_id = f.id
      WHERE sp.is_deleted = false
      ORDER BY sp.created_at DESC
    `);
    
    // Map to the format expected by the frontend
    const formattedPosts = posts.map(post => ({
      ...post,
      user: {
        first_name: post.first_name || 'Unknown',
        last_name: post.last_name || ''
      }
    }));

    res.json({ success: true, posts: formattedPosts });
  } catch (error: any) {
    console.error('Get admin social posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/social-posts/:id
// @desc    Delete a social post
// @access  Private/Admin
router.delete('/social-posts/:id', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE social_posts SET is_deleted = true WHERE id = $1', [id]);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete admin social post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/applications
// @desc    Get all applications
// @access  Private/Admin
router.get('/applications', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const apps = await ApplicationModel.findAll();
    res.json({ applications: apps });
  } catch (error: any) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/applications
// @desc    Create new application
// @access  Private/Admin
router.post('/applications', authenticateToken as any, requireAdmin as any, [
  body('name').notEmpty().trim(),
  body('slug').notEmpty().trim().isSlug(),
], async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, slug, description, branding, settings } = req.body;
    
    // Check if slug exists
    const existing = await ApplicationModel.findBySlug(slug);
    if (existing) {
      return res.status(400).json({ message: 'Application with this slug already exists' });
    }

    const app = await ApplicationModel.create({
      name,
      slug,
      description,
      branding,
      settings
    });

    // Create initial version
    await ApplicationModel.createVersion(app.id, {
        branding: app.branding,
        settings: app.settings,
        status: 'published'
    });

    res.status(201).json(app);
  } catch (error: any) {
    console.error('Create application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/applications/:id
// @desc    Update application details
// @access  Private/Admin
router.put('/applications/:id', authenticateToken as any, requireAdmin as any, [
  body('name').optional().notEmpty().trim(),
  body('slug').optional().notEmpty().trim().isSlug(),
], async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, slug, description, is_active } = req.body;
    
    // If slug is changing, check for uniqueness
    if (slug) {
        const existing = await ApplicationModel.findBySlug(slug);
        if (existing && existing.id !== req.params.id) {
            return res.status(400).json({ message: 'Application with this slug already exists' });
        }
    }

    const updated = await ApplicationModel.update(req.params.id, {
        name,
        slug,
        description,
        isActive: is_active
    });

    if (!updated) {
        return res.status(404).json({ message: 'Application not found' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Versioning Routes ---

// @route   GET /api/admin/applications/:id/versions
// @desc    Get versions for an application
router.get('/applications/:id/versions', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
    try {
        const versions = await ApplicationModel.getVersions(req.params.id);
        res.json({ versions });
    } catch (error: any) {
        console.error('Get app versions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/applications/:id/versions
// @desc    Create a new draft version
router.post('/applications/:id/versions', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
    try {
        const { branding, settings } = req.body;
        // Optionally fetch latest published if body is empty? For now assume body provided or we clone current.
        // If body is empty, let's clone from the live app
        let initialData = { branding, settings };
        
        if (!branding && !settings) {
            const app = await ApplicationModel.findById(req.params.id);
            if (!app) return res.status(404).json({ message: 'App not found' });
            initialData = { branding: app.branding, settings: app.settings };
        }

        const version = await ApplicationModel.createVersion(req.params.id, {
            ...initialData,
            status: 'draft'
        });
        res.status(201).json(version);
    } catch (error: any) {
        console.error('Create app version error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/applications/:id/versions/:versionId
// @desc    Update a draft version
router.put('/applications/:id/versions/:versionId', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
    try {
        const { branding, settings, status } = req.body;
        const version = await ApplicationModel.updateVersion(req.params.versionId, { branding, settings, status });
        
        if (!version) return res.status(404).json({ message: 'Version not found' });
        res.json(version);
    } catch (error: any) {
        console.error('Update app version error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/applications/:id/versions/:versionId/publish
// @desc    Publish a version
router.post('/applications/:id/versions/:versionId/publish', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
    try {
        await ApplicationModel.publishVersion(req.params.id, req.params.versionId);
        res.json({ message: 'Version published successfully' });
    } catch (error: any) {
        console.error('Publish app version error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admin/entities/types
// @desc    Get all entity types
// @access  Private/Admin
router.get('/entities/types', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM entity_types ORDER BY name ASC');
    res.json(rows);
  } catch (error: any) {
    console.error('Get entity types error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/application-settings
// @desc    Upsert application setting
// @access  Private/Admin
router.post('/application-settings', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const { setting_key, setting_value, setting_type, category, description, is_public } = req.body;

    if (!setting_key) {
        return res.status(400).json({ error: 'setting_key is required' });
    }

    const valueStr = typeof setting_value === 'object' ? JSON.stringify(setting_value) : setting_value;

    const { rows } = await pool.query(
      `INSERT INTO app_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         updated_at = NOW()
       RETURNING *`,
      [setting_key, valueStr]
    );

    // Sync 'branding' key to applications table to ensure Admin UI (which reads from applications) stays in sync with Mobile (which reads from app_settings)
    if (setting_key === 'branding') {
        try {
            await pool.query(
                `UPDATE applications SET branding = $1::jsonb, updated_at = NOW() WHERE is_active = true`,
                [valueStr]
            );
            console.log('Synced global branding to applications table');
        } catch (syncError) {
            console.error('Failed to sync branding to applications table:', syncError);
            // Don't fail the request, just log
        }
    }

    res.json({ setting: rows[0] });
  } catch (error: any) {
    console.error('Upsert application setting error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
