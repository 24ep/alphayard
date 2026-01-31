import { Response } from 'express';
import { pool } from '../config/database';

export class TodosController {
  static async list(req: any, res: Response) {
    try {
      const circleId = (req as any).circleId;

      const { rows } = await pool.query(
        'SELECT * FROM todos WHERE circle_id = $1 ORDER BY position ASC',
        [circleId]
      );

      return res.json({ success: true, data: rows });
    } catch (err: any) {
      console.error('Todos list error:', err);
      return res.status(500).json({ error: 'Failed to fetch todos', details: err.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const circleId = (req as any).circleId;
      const userId = req.user.id;
      const { title, description, category, priority, due_date } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // Determine next position
      const { rows: maxRows } = await pool.query(
        'SELECT position FROM todos WHERE circle_id = $1 ORDER BY position DESC LIMIT 1',
        [circleId]
      );

      const nextPosition = (maxRows[0]?.position || 0) + 1;

      const { rows } = await pool.query(
        `INSERT INTO todos (circle_id, user_id, title, description, is_completed, position, category, priority, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          circleId,
          userId,
          title,
          description || null,
          false,
          nextPosition,
          category || 'work',
          priority || 'medium',
          due_date || null
        ]
      );

      return res.status(201).json({ success: true, data: rows[0] });
    } catch (err: any) {
      console.error('Todos create error:', err);
      return res.status(500).json({ error: 'Failed to create todo', details: err.message });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const circleId = (req as any).circleId;
      const { id } = req.params;
      const { title, description, is_completed, category, priority, due_date } = req.body;

      // Check permissions
      const { rows: existing } = await pool.query(
        'SELECT id, circle_id FROM todos WHERE id = $1 LIMIT 1',
        [id]
      );

      if (existing.length === 0 || existing[0].circle_id !== circleId) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      fields.push(`updated_at = NOW()`);

      if (title !== undefined) {
        fields.push(`title = $${paramIndex++}`);
        values.push(title);
      }
      if (description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(description);
      }
      if (is_completed !== undefined) {
        fields.push(`is_completed = $${paramIndex++}`);
        values.push(!!is_completed);
      }
      if (category !== undefined) {
        fields.push(`category = $${paramIndex++}`);
        values.push(category);
      }
      if (priority !== undefined) {
        fields.push(`priority = $${paramIndex++}`);
        values.push(priority);
      }
      if (due_date !== undefined) {
        fields.push(`due_date = $${paramIndex++}`);
        values.push(due_date);
      }

      values.push(id);
      const query = `UPDATE todos SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const { rows } = await pool.query(query, values);

      return res.json({ success: true, data: rows[0] });
    } catch (err: any) {
      console.error('Todos update error:', err);
      return res.status(500).json({ error: 'Failed to update todo', details: err.message });
    }
  }

  static async remove(req: any, res: Response) {
    try {
      const circleId = (req as any).circleId;
      const { id } = req.params;

      const { rows: existing } = await pool.query(
        'SELECT id, circle_id FROM todos WHERE id = $1 LIMIT 1',
        [id]
      );

      if (existing.length === 0 || existing[0].circle_id !== circleId) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      await pool.query('DELETE FROM todos WHERE id = $1', [id]);

      return res.json({ success: true });
    } catch (err: any) {
      console.error('Todos delete error:', err);
      return res.status(500).json({ error: 'Failed to delete todo', details: err.message });
    }
  }

  static async reorder(req: any, res: Response) {
    try {
      const circleId = (req as any).circleId;
      const { orderedIds } = req.body as { orderedIds: string[] };

      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return res.status(400).json({ error: 'orderedIds must be a non-empty array' });
      }

      // Verify all belong to same circle
      // Using ANY($1) for array check
      const { rows: items } = await pool.query(
        'SELECT id, circle_id FROM todos WHERE id = ANY($1)',
        [orderedIds]
      );

      const allSamecircle = items.every(i => i.circle_id === circleId);
      // Also check if found count matches (optional but good) - skipping for lenient handling

      if (!allSamecircle) {
        return res.status(403).json({ error: 'Some todos do not belong to your circle' });
      }

      // Update positions in a loop (simpler for now, transaction recommended strictly but okay for this)
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        let position = 1;
        for (const todoId of orderedIds) {
          await client.query('UPDATE todos SET position = $1 WHERE id = $2', [position++, todoId]);
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }

      return res.json({ success: true });
    } catch (err: any) {
      console.error('Todos reorder error:', err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  }
}



