import express from 'express';
import { body } from 'express-validator';
import { prisma } from '../../lib/prisma';
import { authenticateToken } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken as any);

// List users (for admin console/mobile users management)
router.get('/', async (_req: any, res: any) => {
  try {
    // Fetch basic user info using Prisma
    const result = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const data = result;

    const users = (data || []).map((u: any) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phoneNumber || undefined,
      avatarUrl: u.avatarUrl || undefined,
      avatar: u.avatarUrl || undefined,
      dateOfBirth: u.dateOfBirth || undefined,
      userType: (u.userType || 'circle') as 'circle' | 'children' | 'seniors',
      circleIds: u.circleIds || [],
      isOnboardingComplete: u.isOnboardingComplete || false,
      preferences: u.preferences || {
        notifications: true,
        locationSharing: true,
        popupSettings: {
          enabled: true,
          frequency: 'daily',
          maxPerDay: 3,
          categories: ['announcement', 'promotion']
        }
      },
      role: (u.role || 'user') as 'admin' | 'moderator' | 'user' | 'circle_admin',
      status: (u.is_active ? 'active' : 'inactive') as 'active' | 'inactive' | 'pending' | 'suspended',
      isVerified: true,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      permissions: [],
    }));

    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', async (req: any, res: any) => {
  try {
    // Get user profile using Prisma
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        avatar: user.avatar_url,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        userType: user.user_type || 'circle',
        circleIds: user.circle_ids || [],
        isOnboardingComplete: user.is_onboarding_complete || false,
        preferences: user.preferences || {
          notifications: true,
          locationSharing: true,
          popupSettings: {
            enabled: true,
            frequency: 'daily',
            maxPerDay: 3,
            categories: ['announcement', 'promotion']
          }
        },
        role: user.role || 'user',
        status: user.is_active ? 'active' : 'inactive',
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().trim(),
  body('dateOfBirth').optional().isISO8601()
], validateRequest, async (req: any, res: any) => {
  try {
    const { firstName, lastName, phone, dateOfBirth } = req.body;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (firstName) { updateData.firstName = firstName; }
    if (lastName) { updateData.lastName = lastName; }
    if (phone !== undefined) { updateData.phoneNumber = phone; }
    if (dateOfBirth) { updateData.dateOfBirth = dateOfBirth; }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    if (!user) {
      return res.status(500).json({
        error: 'Failed to update profile',
        message: 'An error occurred while updating your profile'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        avatar: user.avatarUrl,
        phone: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

export default router;

