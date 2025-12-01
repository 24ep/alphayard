import express from 'express';
import { body, query } from 'express-validator';
import { getSupabaseClient } from '../services/supabaseService';
import { authenticateToken, requireFamilyMember } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// In development, allow unauthenticated GET /events to return mock/empty data to avoid blocking UI
if ((process.env.NODE_ENV || 'development') !== 'production') {
  router.get('/events', async (_req, res, next) => {
    // If Authorization header present, continue to authenticated handler
    // Otherwise, return lightweight mock to prevent loading spinners in dev
    if (_req.headers.authorization) return next();
    try {
      // Minimal mock events for dev preview
      const now = new Date();
      const dayMs = 24 * 60 * 60 * 1000;
      const mock = [
        { id: 'm1', title: 'Mock Standup', description: 'Daily sync', startDate: new Date(now.getTime() + dayMs).toISOString(), endDate: new Date(now.getTime() + dayMs + 3600000).toISOString(), allDay: false, location: 'Online', color: '#93C5FD' },
        { id: 'm2', title: 'Mock Family Dinner', description: '', startDate: new Date(now.getTime() + 2*dayMs).toISOString(), endDate: new Date(now.getTime() + 2*dayMs + 7200000).toISOString(), allDay: false, location: 'Home', color: '#FCA5A5' },
      ];
      return res.json({ events: mock });
    } catch {
      return res.json({ events: [] });
    }
  });
}

// All other routes require auth
router.use(authenticateToken as any);

// Get events for current user's hourse (or specified familyId if provided and user is a member)
router.get(
  '/events',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('type').optional().isString(),
    query('familyId').optional().isUUID(),
    query('createdBy').optional().isUUID(),
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const supabase = getSupabaseClient();
      const { startDate, endDate, type, familyId: queryFamilyId, createdBy } = req.query as Record<string, string>;

      // Determine familyId: either provided or user's current hourse
      let familyId = (req as any).familyId as string | undefined;
      if (queryFamilyId) {
        // Verify membership in requested hourse
        const { data: membership } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('family_id', queryFamilyId)
          .eq('user_id', req.user.id)
          .single();
        if (!membership) {
          return res.status(403).json({ error: 'Access denied', message: 'Not a member of the requested hourse' });
        }
        familyId = queryFamilyId;
      }

      if (!familyId) {
        // Try to infer from membership
        const { data: membership } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', req.user.id)
          .single();
        familyId = membership?.family_id;
      }

      if (!familyId) {
        return res.status(400).json({ error: 'No hourse context', message: 'Join or select a hourse first' });
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
        return res.status(500).json({ error: 'Failed to fetch events' });
      }

      return res.json({ events: data || [] });
    } catch (error) {
      console.error('Get events error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create event
router.post(
  '/events',
  [
    requireFamilyMember as any,
    body('title').isString().isLength({ min: 1 }),
    body('startDate').isISO8601(),
    body('endDate').optional().isISO8601(),
    body('isAllDay').optional().isBoolean(),
    body('eventType').optional().isString(),
    body('location').optional().isString(),
    body('locationLatitude').optional().isNumeric(),
    body('locationLongitude').optional().isNumeric(),
    body('isRecurring').optional().isBoolean(),
    body('recurrenceRule').optional().isString(),
    body('reminderMinutes').optional().isArray(),
    body('description').optional().isString(),
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const supabase = getSupabaseClient();
      const familyId = (req as any).familyId as string;
      const {
        title,
        description,
        startDate,
        endDate,
        isAllDay,
        eventType,
        location,
        locationLatitude,
        locationLongitude,
        isRecurring,
        recurrenceRule,
        reminderMinutes,
      } = req.body;

      const insertPayload: any = {
        family_id: familyId,
        created_by: req.user.id,
        title,
        description: description ?? null,
        start_date: startDate,
        end_date: endDate ?? null,
        is_all_day: isAllDay ?? false,
        event_type: eventType ?? 'general',
        location: location ?? null,
        location_latitude: locationLatitude ?? null,
        location_longitude: locationLongitude ?? null,
        is_recurring: isRecurring ?? false,
        recurrence_rule: recurrenceRule ?? null,
        reminder_minutes: Array.isArray(reminderMinutes) ? reminderMinutes : null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('events')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error('Create event error:', error);
        return res.status(500).json({ error: 'Failed to create event' });
      }

      return res.status(201).json({ event: data });
    } catch (error) {
      console.error('Create event error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update event
router.put(
  '/events/:eventId',
  [
    requireFamilyMember as any,
    body('title').optional().isString().isLength({ min: 1 }),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('isAllDay').optional().isBoolean(),
    body('eventType').optional().isString(),
    body('location').optional().isString(),
    body('locationLatitude').optional().isNumeric(),
    body('locationLongitude').optional().isNumeric(),
    body('isRecurring').optional().isBoolean(),
    body('recurrenceRule').optional().isString(),
    body('reminderMinutes').optional().isArray(),
    body('description').optional().isString(),
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const supabase = getSupabaseClient();
      const familyId = (req as any).familyId as string;
      const { eventId } = req.params;

      // Ensure event belongs to hourse
      const { data: existing } = await supabase
        .from('events')
        .select('id, family_id, created_by')
        .eq('id', eventId)
        .single();
      if (!existing || existing.family_id !== familyId) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };

      const map = [
        ['title', 'title'],
        ['description', 'description'],
        ['startDate', 'start_date'],
        ['endDate', 'end_date'],
        ['isAllDay', 'is_all_day'],
        ['eventType', 'event_type'],
        ['location', 'location'],
        ['locationLatitude', 'location_latitude'],
        ['locationLongitude', 'location_longitude'],
        ['isRecurring', 'is_recurring'],
        ['recurrenceRule', 'recurrence_rule'],
        ['reminderMinutes', 'reminder_minutes'],
      ] as const;

      for (const [src, dst] of map) {
        if (req.body[src] !== undefined) updatePayload[dst] = req.body[src];
      }

      const { data, error } = await supabase
        .from('events')
        .update(updatePayload)
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        console.error('Update event error:', error);
        return res.status(500).json({ error: 'Failed to update event' });
      }

      return res.json({ event: data });
    } catch (error) {
      console.error('Update event error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete event
router.delete('/events/:eventId', requireFamilyMember as any, async (req: any, res: any) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = (req as any).familyId as string;
    const { eventId } = req.params;

    const { data: existing } = await supabase
      .from('events')
      .select('id, family_id')
      .eq('id', eventId)
      .single();
    if (!existing || existing.family_id !== familyId) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    if (error) {
      console.error('Delete event error:', error);
      return res.status(500).json({ error: 'Failed to delete event' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


