import express from 'express';
import { body } from 'express-validator';
import { getSupabaseClient } from '../services/supabaseService';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken as any);

// List users (for admin console/mobile users management)
router.get('/', async (_req: any, res: any) => {
  try {
    const supabase = getSupabaseClient();

    // Fetch basic user info; adjust selected columns as needed
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        avatar_url,
        date_of_birth,
        user_type,
        subscription_tier,
        family_ids,
        is_onboarding_complete,
        preferences,
        role,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const users = (data || []).map((u: any) => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      phone: u.phone || undefined,
      avatar: u.avatar_url || undefined,
      dateOfBirth: u.date_of_birth || undefined,
      userType: (u.user_type || 'hourse') as 'hourse' | 'children' | 'seniors',
      subscriptionTier: (u.subscription_tier || 'free') as 'free' | 'premium' | 'elite',
      familyIds: u.family_ids || [],
      isOnboardingComplete: u.is_onboarding_complete || false,
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
      role: (u.role || 'user') as 'admin' | 'moderator' | 'user' | 'family_admin',
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
    const supabase = getSupabaseClient();

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        phone,
        date_of_birth,
        user_type,
        subscription_tier,
        family_ids,
        is_onboarding_complete,
        preferences,
        role,
        is_active,
        created_at,
        updated_at
      `)
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
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
        avatar: user.avatar_url,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        userType: user.user_type || 'hourse',
        subscriptionTier: user.subscription_tier || 'free',
        familyIds: user.family_ids || [],
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
    const supabase = getSupabaseClient();
    const { firstName, lastName, phone, dateOfBirth } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth) updateData.date_of_birth = dateOfBirth;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, email, first_name, last_name, avatar_url, phone, date_of_birth, updated_at')
      .single();

    if (error) {
      console.error('Update user profile error:', error);
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
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar_url,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        updatedAt: user.updated_at
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
