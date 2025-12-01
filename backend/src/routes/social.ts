import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getSupabaseClient } from '../services/supabaseService';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken as any);

/**
 * GET /api/social/nearby
 * Query params:
 * - lat, lng: number (required)
 * - radiusKm: number in km (default 1, supports 1,5,10,custom)
 * - workplace, hometown, school, university: optional string filters
 * - limit: number (default 50)
 */
router.get('/nearby', async (req: any, res: any) => {
  try {
    const supabase = getSupabaseClient();

    const lat = parseFloat(String(req.query.lat ?? ''));
    const lng = parseFloat(String(req.query.lng ?? ''));
    const radiusKm = parseFloat(String(req.query.radiusKm ?? '1'));
    const limit = Math.min(parseInt(String(req.query.limit ?? '50'), 10) || 50, 100);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ success: false, error: 'lat and lng are required numbers' });
    }
    const radiusMeters = Math.max(0, radiusKm) * 1000;

    // Optional profile filters
    const workplace = (req.query.workplace as string) || undefined;
    const hometown = (req.query.hometown as string) || undefined;
    const school = (req.query.school as string) || (req.query.university as string) || undefined;

    // This query assumes a "user_locations" table with latest location per user we can derive via DISTINCT ON or max(timestamp)
    // and a "users" table with optional profile fields stored either as columns or in a JSONB "profile".
    // We will use an RPC via SQL to leverage Postgres distance calculation when available; otherwise fallback to simple filter.

    // Try a Postgres SQL through Supabase - if not available in demo, return empty list gracefully.
    const { data, error } = await supabase.rpc('fn_social_nearby_users', {
      p_lat: lat,
      p_lng: lng,
      p_radius_m: radiusMeters,
      p_limit: limit,
      p_workplace: workplace || null,
      p_hometown: hometown || null,
      p_school: school || null
    });

    if (error) {
      // Fallback: return success with empty data if RPC is not defined in current DB
      return res.json({ success: true, data: [], note: 'RPC fn_social_nearby_users not installed' });
    }

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Nearby users error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/social/profile-filters
 * Returns filter options from existing users (distinct workplace, hometown, school/university)
 */
router.get('/profile-filters', async (_req: any, res: any) => {
  try {
    const supabase = getSupabaseClient();

    // Attempt to read distinct values if columns exist. If not, return empty arrays gracefully.
    const [workRes, homeRes, schoolRes] = await Promise.all([
      supabase.from('users').select('workplace').not('workplace', 'is', null).neq('workplace', '').limit(1000),
      supabase.from('users').select('hometown').not('hometown', 'is', null).neq('hometown', '').limit(1000),
      supabase.from('users').select('school, university').limit(1000)
    ]);

    const workplaces = (workRes.data || []).map((r: any) => r.workplace).filter(Boolean);
    const hometowns = (homeRes.data || []).map((r: any) => r.hometown).filter(Boolean);
    const schools = (schoolRes.data || [])
      .flatMap((r: any) => [r.school, r.university])
      .filter(Boolean);

    return res.json({ success: true, data: {
      workplaces: Array.from(new Set(workplaces)).slice(0, 200),
      hometowns: Array.from(new Set(hometowns)).slice(0, 200),
      schools: Array.from(new Set(schools)).slice(0, 200)
    }});
  } catch (err) {
    console.error('Profile filters error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;


