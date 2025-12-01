import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, requireFamilyMember } from '../middleware/auth';
import { getSupabaseClient } from '../services/supabaseService';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes require authentication and hourse membership
router.use(authenticateToken as any);
router.use(requireFamilyMember as any);

// Get hourse locations (latest location for each member)
router.get('/', async (req: any, res: any) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = (req as any).familyId as string;

    // Get latest location for each family member
    const { data: locations, error } = await supabase
      .from('location_history')
      .select(`
        id,
        user_id,
        latitude,
        longitude,
        accuracy,
        address,
        created_at,
        users (
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get locations error:', error);
      return res.status(500).json({
        error: 'Failed to fetch locations',
        message: 'An error occurred while fetching locations'
      });
    }

    // Group by user_id and get latest for each
    const latestLocations = locations?.reduce((acc: any, loc: any) => {
      if (!acc[loc.user_id]) {
        acc[loc.user_id] = {
          userId: loc.user_id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          address: loc.address,
          timestamp: loc.created_at,
          user: loc.users ? {
            id: (loc.users as any).id,
            firstName: (loc.users as any).first_name,
            lastName: (loc.users as any).last_name,
            email: (loc.users as any).email,
            avatar: (loc.users as any).avatar_url
          } : null
        };
      }
      return acc;
    }, {} as Record<string, any>) || {};

    res.json({
      locations: Object.values(latestLocations),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Update user location
router.post('/', [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('accuracy').optional().isFloat({ min: 0 }),
  body('address').optional().isString().trim(),
], validateRequest, async (req: any, res: any) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = (req as any).familyId as string;
    const userId = req.user.id;
    const { latitude, longitude, accuracy, address } = req.body;

    // Save location to database
    const { data: location, error } = await supabase
      .from('location_history')
      .insert({
        user_id: userId,
        family_id: familyId,
        latitude,
        longitude,
        accuracy: accuracy || null,
        address: address || null,
        is_shared: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Update location error:', error);
      return res.status(500).json({
        error: 'Failed to update location',
        message: 'An error occurred while updating location'
      });
    }

    res.json({
      message: 'Location updated successfully',
      location: {
        id: location.id,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address,
        timestamp: location.created_at
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

export default router;
