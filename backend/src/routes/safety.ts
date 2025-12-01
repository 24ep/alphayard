import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, requireFamilyMember } from '../middleware/auth';
import { getSupabaseClient } from '../services/supabaseService';
import { validateRequest } from '../middleware/validation';
import { query } from 'express-validator';

const router = express.Router();

// All routes require authentication and hourse membership
router.use(authenticateToken as any);
router.use(requireFamilyMember as any);

// Get safety alerts
router.get('/alerts', [
  query('status').optional().isIn(['active', 'resolved', 'cancelled']),
  query('type').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
], validateRequest, async (req: any, res: any) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = (req as any).familyId as string;
    const { status, type, limit = 50, offset = 0 } = req.query as Record<string, string>;

    let queryBuilder = supabase
      .from('safety_alerts')
      .select(`
        id,
        user_id,
        family_id,
        type,
        severity,
        message,
        location,
        is_resolved,
        created_at,
        updated_at,
        users (
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (status) {
      if (status === 'active') {
        queryBuilder = queryBuilder.eq('is_resolved', false);
      } else if (status === 'resolved') {
        queryBuilder = queryBuilder.eq('is_resolved', true);
      }
    }

    if (type) {
      queryBuilder = queryBuilder.eq('type', type);
    }

    const { data: alerts, error } = await queryBuilder;

    if (error) {
      console.error('Get safety alerts error:', error);
      return res.status(500).json({
        error: 'Failed to fetch safety alerts',
        message: 'An error occurred while fetching alerts'
      });
    }

    // Get count of active alerts
    const { count: activeCount } = await supabase
      .from('safety_alerts')
      .select('id', { count: 'exact' })
      .eq('family_id', familyId)
      .eq('is_resolved', false);

    res.json({
      alerts: alerts?.map(alert => ({
        id: alert.id,
        userId: alert.user_id,
        familyId: alert.family_id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        location: alert.location,
        isResolved: alert.is_resolved,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at,
        user: alert.users ? {
          id: (alert.users as any).id,
          firstName: (alert.users as any).first_name,
          lastName: (alert.users as any).last_name,
          email: (alert.users as any).email,
          avatar: (alert.users as any).avatar_url
        } : null
      })) || [],
      activeAlerts: activeCount || 0
    });
  } catch (error) {
    console.error('Get safety alerts error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Create safety alert
router.post('/alerts', [
  body('type').isString().isIn(['emergency', 'check_in', 'location_alert', 'custom']),
  body('severity').optional().isString().isIn(['low', 'medium', 'high', 'urgent']),
  body('message').optional().isString().trim(),
  body('location').optional().isString().trim(),
], validateRequest, async (req: any, res: any) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = (req as any).familyId as string;
    const userId = req.user.id;
    const { type, severity = 'medium', message, location } = req.body;

    // Create safety alert
    const { data: alert, error } = await supabase
      .from('safety_alerts')
      .insert({
        user_id: userId,
        family_id: familyId,
        type,
        severity,
        message: message || null,
        location: location || null,
        is_resolved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Create safety alert error:', error);
      return res.status(500).json({
        error: 'Failed to create safety alert',
        message: 'An error occurred while creating the alert'
      });
    }

    res.status(201).json({
      message: 'Safety alert created successfully',
      alert: {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        location: alert.location,
        isResolved: alert.is_resolved,
        createdAt: alert.created_at
      }
    });
  } catch (error) {
    console.error('Create safety alert error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

export default router;
