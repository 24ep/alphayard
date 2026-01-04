import { Response } from 'express';
import { pool } from '../config/database';

export class NotesController {
  static async list(req: any, res: Response) {
    try {
      const familyId = (req as any).familyId;

      const { rows } = await pool.query(
        'SELECT * FROM notes WHERE family_id = $1 ORDER BY updated_at DESC',
        [familyId]
      );

      return res.json({ success: true, data: rows });
    } catch (err: any) {
      console.error('Notes list error:', err);
      return res.status(500).json({ error: 'Failed to fetch notes', details: err.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const familyId = (req as any).familyId;
      const userId = req.user.id;
      const { title, content, category, is_pinned, color } = req.body;

      if (!title && !content) {
        return res.status(400).json({ error: 'Title or content is required' });
      }

      const { rows } = await pool.query(
        `INSERT INTO notes (family_id, user_id, title, content, category, is_pinned, color)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          familyId,
          userId,
          title || null,
          content || '',
          category || 'personal',
          is_pinned || false,
          color || '#FFB6C1'
        ]
      );

      return res.status(201).json({ success: true, data: rows[0] });
    } catch (err: any) {
      console.error('Notes create error:', err);
      return res.status(500).json({ error: 'Failed to create note', details: err.message });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const familyId = (req as any).familyId;
      const { id } = req.params;
      const { title, content, category, is_pinned, color } = req.body;

      // First check existence and permissions
      const { rows: existing } = await pool.query(
        'SELECT id, family_id FROM notes WHERE id = $1 LIMIT 1',
        [id]
      );

      if (existing.length === 0 || existing[0].family_id !== familyId) {
        return res.status(404).json({ error: 'Note not found' });
      }

      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      fields.push(`updated_at = NOW()`); // Always update timestamp

      if (title !== undefined) {
        fields.push(`title = $${paramIndex++}`);
        values.push(title);
      }
      if (content !== undefined) {
        fields.push(`content = $${paramIndex++}`);
        values.push(content);
      }
      if (category !== undefined) {
        fields.push(`category = $${paramIndex++}`);
        values.push(category);
      }
      if (is_pinned !== undefined) {
        fields.push(`is_pinned = $${paramIndex++}`);
        values.push(is_pinned);
      }
      if (color !== undefined) {
        fields.push(`color = $${paramIndex++}`);
        values.push(color);
      }

      values.push(id); // ID is the last param
      const query = `UPDATE notes SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const { rows } = await pool.query(query, values);

      return res.json({ success: true, data: rows[0] });
    } catch (err: any) {
      console.error('Notes update error:', err);
      return res.status(500).json({ error: 'Failed to update note', details: err.message });
    }
  }

  static async remove(req: any, res: Response) {
    try {
      const familyId = (req as any).familyId;
      const { id } = req.params;

      // Check permissions
      const { rows: existing } = await pool.query(
        'SELECT id, family_id FROM notes WHERE id = $1 LIMIT 1',
        [id]
      );

      if (existing.length === 0 || existing[0].family_id !== familyId) {
        return res.status(404).json({ error: 'Note not found' });
      }

      await pool.query('DELETE FROM notes WHERE id = $1', [id]);

      return res.json({ success: true });
    } catch (err: any) {
      console.error('Notes delete error:', err);
      return res.status(500).json({ error: 'Failed to delete note', details: err.message });
    }
  }
}
