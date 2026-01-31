import { Router, Response, Request } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../config/database';

const router = Router();
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @route   GET /api/v1/gallery/photos
 * @desc    Get gallery photos for a circle
 * @access  Private
 */
router.get('/photos', authenticateToken as any, async (req: any, res: Response) => {
  try {
    const { circleId, type, search, albumId } = req.query;

    if (!circleId) {
      return res.status(400).json({ error: 'circleId is required' });
    }

    if (!UUID_REGEX.test(circleId as string)) {
      console.warn(`[Gallery] Invalid circleId format: ${circleId}`);
      return res.json([]); // Return empty list instead of 500
    }

    let sql = `
      SELECT id, url as uri, url as thumbnail, file_name as filename, title, 
             size, width, height, uploaded_at as "createdAt", location, 
             metadata, uploaded_by as "uploadedBy", circle_id as "circleId", 
             album_id as "albumId", true as "isShared", is_favorite as "isFavorite"
      FROM files
      WHERE circle_id = $1
    `;
    const params: any[] = [circleId];
    let paramIdx = 2;

    if (type && type !== 'all') {
      sql += ` AND mime_type LIKE $${paramIdx++}`;
      params.push(`${type}%`);
    }

    if (search) {
      sql += ` AND (file_name ILIKE $${paramIdx} OR title ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (albumId) {
      sql += ` AND album_id = $${paramIdx++}`;
      params.push(albumId);
    }

    sql += ` ORDER BY uploaded_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching gallery photos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/v1/gallery/albums
 * @desc    Get gallery albums for a circle
 * @access  Private
 */
router.get('/albums', authenticateToken as any, async (req: any, res: Response) => {
  try {
    const { circleId } = req.query;

    if (!circleId) {
      return res.status(400).json({ error: 'circleId is required' });
    }

    if (!UUID_REGEX.test(circleId as string)) {
      console.warn(`[Gallery] Invalid circleId format: ${circleId}`);
      return res.json([]);
    }

    const sql = `
      SELECT a.*, 
             (SELECT COUNT(*) FROM files WHERE album_id = a.id) as "photoCount",
             a.cover_photo_url as "coverPhoto",
             a.created_at as "createdAt",
             a.updated_at as "updatedAt",
             a.created_by as "createdBy"
      FROM gallery_albums a
      WHERE a.circle_id = $1
      ORDER BY a.created_at DESC
    `;
    
    const result = await query(sql, [circleId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching gallery albums:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   POST /api/v1/gallery/albums
 * @desc    Create a new gallery album
 * @access  Private
 */
router.post('/albums', authenticateToken as any, async (req: any, res: Response) => {
  try {
    const { name, description, circleId, isShared } = req.body;
    const userId = req.user.id;

    if (!name || !circleId) {
      return res.status(400).json({ error: 'name and circleId are required' });
    }

    const result = await query(
      `INSERT INTO gallery_albums (name, description, circle_id, is_shared, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, circleId, isShared ?? true, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating gallery album:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   PATCH /api/v1/gallery/photos/:id/favorite
 * @desc    Toggle favorite status for a photo
 * @access  Private
 */
router.patch('/photos/:id/favorite', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `UPDATE files SET is_favorite = NOT is_favorite WHERE id = $1 RETURNING is_favorite`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json({ success: true, isFavorite: result.rows[0].is_favorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   POST /api/v1/gallery/photos
 * @desc    Add photo metadata (called after storage upload)
 * @access  Private
 */
router.post('/photos', authenticateToken as any, async (req: any, res: Response) => {
  try {
    const { uri, filename, title, size, width, height, circleId, albumId, location, metadata } = req.body;
    const userId = req.user.id;

    if (!uri || !circleId) {
      return res.status(400).json({ error: 'uri and circleId are required' });
    }

    const result = await query(
      `INSERT INTO files (url, file_name, title, size, width, height, circle_id, album_id, location, metadata, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [uri, filename, title, size, width, height, circleId, albumId, JSON.stringify(location || {}), JSON.stringify(metadata || {}), userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating gallery photo record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   DELETE /api/v1/gallery/photos/:id
 */
router.delete('/photos/:id', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM files WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   DELETE /api/v1/gallery/albums/:id
 */
router.delete('/albums/:id', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM gallery_albums WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting album:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

