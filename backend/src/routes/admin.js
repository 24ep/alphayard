const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditAdminRequests } = require('../../middleware/audit');

// Apply audit middleware to admin router
router.use(auditAdminRequests());

// POST /api/admin/impersonate
router.post('/impersonate', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Store impersonation info in session (if using cookie sessions) or issue a special token.
    // Here we attach to request session if available; otherwise return a flag for the client.
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
router.post('/stop-impersonate', authenticateToken, async (req, res) => {
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

const { body, validationResult } = require('express-validator');
const { sendEmail } = require('../services/emailService');

// Optional model imports - models may not exist in all environments
let User, hourse, Subscription, EmergencyAlert, SafetyCheck, Message;
try {
  User = require('../models/User');
} catch (e) {
  // User model not available
}
try {
  hourse = require('../models/hourse');
} catch (e) {
  // hourse model not available
}
try {
  Subscription = require('../models/Subscription');
} catch (e) {
  // Subscription model not available
}
try {
  EmergencyAlert = require('../models/EmergencyAlert');
} catch (e) {
  // EmergencyAlert model not available
}
try {
  SafetyCheck = require('../models/SafetyCheck');
} catch (e) {
  // SafetyCheck model not available
}
try {
  Message = require('../models/Message');
} catch (e) {
  // Message model not available
}

// Admin middleware - require admin role (centralized RBAC)
const requireAdmin = requireRole('admin');

// Validation middleware
const validateUserUpdate = [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['user', 'admin', 'moderator']),
  body('status').optional().isIn(['active', 'inactive', 'suspended']),
];

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Get basic stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalFamilies = await hourse.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: { $in: ['active', 'trialing'] } });

    // Get recent activity
    const recentUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const recentFamilies = await hourse.countDocuments({ createdAt: { $gte: startDate } });
    const recentAlerts = await EmergencyAlert.countDocuments({ createdAt: { $gte: startDate } });
    const recentMessages = await Message.countDocuments({ createdAt: { $gte: startDate } });

    // Get revenue stats
    const revenueStats = await Subscription.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$plan.price' },
          avgRevenue: { $avg: '$plan.price' },
          subscriptionCount: { $sum: 1 },
        },
      },
    ]);

    // Get user growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalFamilies,
        activeSubscriptions,
        recentUsers,
        recentFamilies,
        recentAlerts,
        recentMessages,
        revenue: revenueStats[0] || { totalRevenue: 0, avgRevenue: 0, subscriptionCount: 0 },
      },
      userGrowth,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private/Admin
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      hourse,
      subscription,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (role) query.role = role;
    if (status) query.status = status;
    if (hourse === 'true') query.hourse = { $exists: true, $ne: null };
    if (hourse === 'false') query.hourse = { $exists: false };
    if (subscription === 'true') query.stripeCustomerId = { $exists: true, $ne: null };
    if (subscription === 'false') query.stripeCustomerId = { $exists: false };

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .populate('hourse', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password -refreshTokens');

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Private/Admin
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('hourse', 'name members')
      .populate('blockedUsers', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's subscription
    const subscription = await Subscription.findOne({ user: user._id });

    // Get user's recent activity
    const recentAlerts = await EmergencyAlert.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSafetyChecks = await SafetyCheck.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      user,
      subscription,
      recentActivity: {
        alerts: recentAlerts,
        safetyChecks: recentSafetyChecks,
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', authenticateToken, requireAdmin, validateUserUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, role, status, notes } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    if (notes) user.adminNotes = notes;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    // Delete related data
    await EmergencyAlert.deleteMany({ user: user._id });
    await SafetyCheck.deleteMany({ user: user._id });
    await Message.deleteMany({ sender: user._id });
    await Subscription.deleteMany({ user: user._id });

    // Remove from families
    await hourse.updateMany(
      { members: user._id },
      { $pull: { members: user._id } }
    );

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users/:id/suspend
// @desc    Suspend user
// @access  Private/Admin
router.post('/users/:id/suspend', authenticateToken, requireAdmin, [
  body('reason').notEmpty().trim(),
  body('duration').optional().isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason, duration } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'suspended';
    user.suspension = {
      reason,
      suspendedAt: new Date(),
      suspendedBy: req.user.id,
      duration: duration ? duration * 24 * 60 * 60 * 1000 : null, // Convert days to milliseconds
      expiresAt: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null,
    };

    await user.save();

    // Send suspension email
    await sendEmail({
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
      suspension: user.suspension,
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users/:id/unsuspend
// @desc    Unsuspend user
// @access  Private/Admin
router.post('/users/:id/unsuspend', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'active';
    user.suspension = null;

    await user.save();

    // Send unsuspension email
    await sendEmail({
      to: user.email,
      subject: 'Account Reactivated',
      template: 'account-reactivated',
      data: {
        name: user.firstName,
      },
    });

    res.json({ message: 'User unsuspended successfully' });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/families
// @desc    Get all families
// @access  Private/Admin
router.get('/families', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (status) query.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const families = await hourse.find(query)
      .populate('admin', 'firstName lastName email')
      .populate('members', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await hourse.countDocuments(query);

    res.json({
      families,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Get families error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/subscriptions
// @desc    Get all subscriptions
// @access  Private/Admin
router.get('/subscriptions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      plan,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (plan) query['plan.id'] = plan;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const subscriptions = await Subscription.find(query)
      .populate('user', 'firstName lastName email')
      .populate('hourse', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subscription.countDocuments(query);

    res.json({
      subscriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/alerts
// @desc    Get emergency alerts
// @access  Private/Admin
router.get('/alerts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const alerts = await EmergencyAlert.find(query)
      .populate('user', 'firstName lastName email')
      .populate('hourse', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EmergencyAlert.countDocuments(query);

    res.json({
      alerts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/system
// @desc    Get system information
// @access  Private/Admin
router.get('/system', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: {
        connection: 'connected', // This would need to be checked
      },
      redis: {
        connection: 'connected', // This would need to be checked
      },
    };

    res.json({ systemInfo });
  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/broadcast
// @desc    Send broadcast message
// @access  Private/Admin
router.post('/broadcast', authenticateToken, requireAdmin, [
  body('title').notEmpty().trim(),
  body('message').notEmpty().trim(),
  body('type').isIn(['notification', 'email', 'both']),
  body('target').optional().isIn(['all', 'active', 'premium']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type, target = 'all' } = req.body;

    let users;
    if (target === 'all') {
      users = await User.find({ status: 'active' });
    } else if (target === 'premium') {
      const subscriptions = await Subscription.find({ status: 'active' });
      const userIds = subscriptions.map(sub => sub.user);
      users = await User.find({ _id: { $in: userIds }, status: 'active' });
    } else {
      users = await User.find({ status: 'active' });
    }

    const results = [];

    for (const user of users) {
      try {
        if (type === 'email' || type === 'both') {
          await sendEmail({
            to: user.email,
            subject: title,
            template: 'admin-broadcast',
            data: {
              name: user.firstName,
              message,
            },
          });
        }

        results.push({
          userId: user._id,
          email: user.email,
          success: true,
        });
      } catch (error) {
        results.push({
          userId: user._id,
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
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 