import express from 'express';
import { body, query } from 'express-validator';
import { pool } from '../config/database';
import { authenticateToken, requireCircleMember } from '../middleware/auth';
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
        { id: 'm2', title: 'Mock circle Dinner', description: '', startDate: new Date(now.getTime() + 2 * dayMs).toISOString(), endDate: new Date(now.getTime() + 2 * dayMs + 7200000).toISOString(), allDay: false, location: 'Home', color: '#FCA5A5' },
      ];
      return res.json({ events: mock });
    } catch {
      return res.json({ events: [] });
    }
  });
}

// All other routes require auth
router.use(authenticateToken as any);

// Get events for current user's circle (or specified circleId if provided and user is a member)
router.get(
  '/events',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('type').optional().isString(),
    query('circleId').optional().isUUID(),
    query('createdBy').optional().isUUID(),
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const { startDate, endDate, type, circleId: querycircleId, createdBy } = req.query as Record<string, string>;

      // Determine circleId: either provided or user's current circle
      let circleId = (req as any).circleId as string | undefined;
      if (querycircleId) {
        // Verify membership in requested circle
        const { rows: membership } = await pool.query(
          'SELECT circle_id FROM circle_members WHERE circle_id = $1 AND user_id = $2',
          [querycircleId, req.user.id]
        );
        if (membership.length === 0) {
          return res.status(403).json({ error: 'Access denied', message: 'Not a member of the requested circle' });
        }
        circleId = querycircleId;
      }

      if (!circleId) {
        // Try to infer from membership
        const { rows: membership } = await pool.query(
          'SELECT circle_id FROM circle_members WHERE user_id = $1 LIMIT 1',
          [req.user.id]
        );
        circleId = membership[0]?.circle_id;
      }

      if (!circleId) {
        return res.status(400).json({ error: 'No circle context', message: 'Join or select a circle first' });
      }

      let sql = 'SELECT * FROM events WHERE circle_id = $1';
      const params: any[] = [circleId];
      let paramIdx = 2;

      if (startDate) {
        sql += ` AND start_date >= $${paramIdx++}`;
        params.push(startDate);
      }
      if (endDate) {
        sql += ` AND end_date <= $${paramIdx++}`;
        params.push(endDate);
      }
      if (type) {
        sql += ` AND event_type = $${paramIdx++}`;
        params.push(type);
      }
      if (createdBy) {
        sql += ` AND created_by = $${paramIdx++}`;
        params.push(createdBy);
      }

      sql += ' ORDER BY start_date ASC';

      const { rows } = await pool.query(sql, params);
      return res.json({ events: rows || [] });
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
    requireCircleMember as any,
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
      const circleId = (req as any).circleId as string;
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

      const { rows } = await pool.query(
        `INSERT INTO events (circle_id, created_by, title, description, start_date, end_date, is_all_day, 
                            event_type, location, location_latitude, location_longitude, is_recurring, 
                            recurrence_rule, reminder_minutes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
         RETURNING *`,
        [
          circleId,
          req.user.id,
          title,
          description ?? null,
          startDate,
          endDate ?? null,
          isAllDay ?? false,
          eventType ?? 'general',
          location ?? null,
          locationLatitude ?? null,
          locationLongitude ?? null,
          isRecurring ?? false,
          recurrenceRule ?? null,
          Array.isArray(reminderMinutes) ? reminderMinutes : null
        ]
      );

      return res.status(201).json({ event: rows[0] });
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
    requireCircleMember as any,
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
      const circleId = (req as any).circleId as string;
      const { eventId } = req.params;

      // Ensure event belongs to circle
      const { rows: existingRows } = await pool.query(
        'SELECT id, circle_id FROM events WHERE id = $1',
        [eventId]
      );
      if (existingRows.length === 0 || existingRows[0].circle_id !== circleId) {
        return res.status(404).json({ error: 'Event not found' });
      }

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

      const sets: string[] = ['updated_at = NOW()'];
      const params: any[] = [eventId];
      let idx = 2;

      for (const [src, dst] of map) {
        if (req.body[src] !== undefined) {
          sets.push(`${dst} = $${idx++}`);
          params.push(req.body[src]);
        }
      }

      const { rows } = await pool.query(
        `UPDATE events SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
        params
      );

      return res.json({ event: rows[0] });
    } catch (error) {
      console.error('Update event error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete event
router.delete('/events/:eventId', requireCircleMember as any, async (req: any, res: any) => {
  try {
    const circleId = (req as any).circleId as string;
    const { eventId } = req.params;

    const { rows: existingRows } = await pool.query(
      'SELECT id, circle_id FROM events WHERE id = $1',
      [eventId]
    );
    if (existingRows.length === 0 || existingRows[0].circle_id !== circleId) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await pool.query('DELETE FROM events WHERE id = $1', [eventId]);
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;



