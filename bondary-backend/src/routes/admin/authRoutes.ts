import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';
import { authenticateAdmin } from '../../middleware/adminAuth';
import { requirePermission } from '../../middleware/permissionCheck';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface LoginCredentials {
  email: string;
  password: string;
}

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  permissions?: string[];
  isSuperAdmin?: boolean;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalFamilies: number;
  activeSubscriptions: number;
  totalScreens: number;
  recentUsers: number;
  recentFamilies: number;
  recentAlerts: number;
  recentMessages: number;
}

// ============================================================================
// Response Helper
// ============================================================================

const sendResponse = <T>(res: Response, statusCode: number, success: boolean, data?: T, message?: string, error?: string) => {
  const response = { 
    success,
    timestamp: new Date().toISOString()
  };
  if (data !== undefined) (response as any).data = data;
  if (message) (response as any).message = message;
  if (error) (response as any).error = error;
  return res.status(statusCode).json(response);
};

const handleValidationErrors = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, undefined, undefined, errors.array()[0].msg);
  }
  next();
};

// ============================================================================
// Authentication Routes
// ============================================================================

const router = Router();

/**
 * POST /admin/auth/login
 * Admin login endpoint
 */
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginCredentials;

    // Find admin user
    const adminUser = await prisma.adminUser.findFirst({
      where: { 
        email: email.toLowerCase(),
        isActive: true 
      },
      include: {
        adminUserApplications: {
          include: {
            application: {
              select: { name: true, slug: true }
            }
          }
        }
      }
    });

    if (!adminUser) {
      return sendResponse(res, 401, false, undefined, undefined, 'Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isValidPassword) {
      return sendResponse(res, 401, false, undefined, undefined, 'Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: adminUser.id,
        adminId: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        permissions: adminUser.permissions || [],
        type: 'admin',
        isSuperAdmin: adminUser.isSuperAdmin
      },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() }
    });

    const userResponse: AdminUser = {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName || undefined,
      lastName: adminUser.lastName || undefined,
      role: adminUser.role || 'admin',
      permissions: adminUser.permissions || [],
      isSuperAdmin: adminUser.isSuperAdmin || false
    };

    sendResponse(res, 200, true, { user: userResponse, token }, 'Login successful');

  } catch (error) {
    console.error('Admin login error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Login failed');
  }
});

/**
 * POST /admin/auth/logout
 * Admin logout endpoint
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // In a real implementation, you might want to invalidate the token
    // For now, just return success
    sendResponse(res, 200, true, undefined, 'Logout successful');
  } catch (error) {
    console.error('Admin logout error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Logout failed');
  }
});

/**
 * GET /admin/auth/me
 * Get current admin user
 */
router.get('/me', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;
    
    // Get full user details with permissions
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: admin.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        isSuperAdmin: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!adminUser) {
      return sendResponse(res, 404, false, undefined, undefined, 'Admin user not found');
    }

    sendResponse(res, 200, true, adminUser, 'Admin user retrieved successfully');
  } catch (error) {
    console.error('Get admin user error:', error);
    sendResponse(res, 500, false, undefined, undefined, 'Failed to get admin user');
  }
});

// ============================================================================
// Application Management Routes (Extended)
// ============================================================================

/**
 * GET /admin/applications/:id
 * Get single application
 */
router.get('/applications/:id', 
  authenticateAdmin,
  requirePermission('applications', 'view'),
  [param('id').isUUID().withMessage('Invalid application ID')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const application = await prisma.application.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          isActive: true,
          logoUrl: true,
          branding: true,
          settings: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
              appSettings: true
            }
          }
        }
      });

      if (!application) {
        return sendResponse(res, 404, false, undefined, undefined, 'Application not found');
      }

      sendResponse(res, 200, true, { application }, 'Application retrieved successfully');
    } catch (error) {
      console.error('Get application error:', error);
      sendResponse(res, 500, false, undefined, undefined, 'Failed to get application');
    }
  }
);

/**
 * PUT /admin/applications/:id
 * Update application
 */
router.put('/applications/:id',
  authenticateAdmin,
  requirePermission('applications', 'update'),
  [
    param('id').isUUID().withMessage('Invalid application ID'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('slug').optional().trim().matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('logoUrl').optional().isURL().withMessage('Invalid logo URL format'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if application exists
      const existing = await prisma.application.findUnique({
        where: { id }
      });

      if (!existing) {
        return sendResponse(res, 404, false, undefined, undefined, 'Application not found');
      }

      // Check if new slug conflicts
      if (updateData.slug && updateData.slug !== existing.slug) {
        const slugConflict = await prisma.application.findUnique({
          where: { slug: updateData.slug }
        });

        if (slugConflict) {
          return sendResponse(res, 400, false, undefined, undefined, 'Application with this slug already exists');
        }
      }

      const application = await prisma.application.update({
        where: { id },
        data: updateData
      });

      sendResponse(res, 200, true, { application }, 'Application updated successfully');
    } catch (error) {
      console.error('Update application error:', error);
      sendResponse(res, 500, false, undefined, undefined, 'Failed to update application');
    }
  }
);

/**
 * DELETE /admin/applications/:id
 * Delete application (soft delete)
 */
router.delete('/applications/:id',
  authenticateAdmin,
  requirePermission('applications', 'delete'),
  [param('id').isUUID().withMessage('Invalid application ID')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if application exists
      const existing = await prisma.application.findUnique({
        where: { id }
      });

      if (!existing) {
        return sendResponse(res, 404, false, undefined, undefined, 'Application not found');
      }

      // Soft delete by setting isActive to false
      await prisma.application.update({
        where: { id },
        data: { isActive: false }
      });

      sendResponse(res, 200, true, undefined, 'Application deleted successfully');
    } catch (error) {
      console.error('Delete application error:', error);
      sendResponse(res, 500, false, undefined, undefined, 'Failed to delete application');
    }
  }
);

// ============================================================================
// Dashboard Routes
// ============================================================================

/**
 * GET /admin/dashboard/stats
 * Get dashboard statistics
 */
router.get('/dashboard/stats',
  authenticateAdmin,
  requirePermission('dashboard', 'view'),
  async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get user stats
      const [totalUsers, activeUsers, recentUsers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
      ]);

      // Get family stats
      const [totalFamilies, recentFamilies] = await Promise.all([
        prisma.circle.count(),
        prisma.circle.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
      ]);

      // Get application stats
      const totalApplications = await prisma.application.count({ where: { isActive: true } });

      // Mock other stats for now
      const stats: DashboardStats = {
        totalUsers,
        activeUsers,
        totalFamilies,
        activeSubscriptions: 0, // TODO: Implement subscription tracking
        totalScreens: totalApplications,
        recentUsers,
        recentFamilies,
        recentAlerts: 0, // TODO: Implement alert tracking
        recentMessages: 0 // TODO: Implement message tracking
      };

      sendResponse(res, 200, true, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      sendResponse(res, 500, false, undefined, undefined, 'Failed to get dashboard stats');
    }
  }
);

// ============================================================================
// File Upload Route
// ============================================================================

/**
 * POST /admin/upload
 * Upload file endpoint
 */
router.post('/upload',
  authenticateAdmin,
  requirePermission('files', 'upload'),
  async (req: Request, res: Response) => {
    try {
      // This is a placeholder - in a real implementation, you'd handle file uploads
      // For now, return a mock response
      const mockFile = {
        url: `https://example.com/uploads/${Date.now()}-mock-file.jpg`,
        filename: `mock-file-${Date.now()}.jpg`
      };

      sendResponse(res, 200, true, mockFile, 'File uploaded successfully');
    } catch (error) {
      console.error('File upload error:', error);
      sendResponse(res, 500, false, undefined, undefined, 'File upload failed');
    }
  }
);

export default router;
