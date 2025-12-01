import { Response } from 'express';
import { getSupabaseClient } from '../services/supabaseService';

export class TodosController {
  static async list(req: any, res: Response) {
    try {
      const supabase = getSupabaseClient();
      const familyId = (req as any).familyId;

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('family_id', familyId)
        .order('position', { ascending: true });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch todos', details: error.message });
      }

      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const supabase = getSupabaseClient();
      const familyId = (req as any).familyId;
      const userId = req.user.id;
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // Determine next position
      const { data: maxData } = await supabase
        .from('todos')
        .select('position')
        .eq('family_id', familyId)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextPosition = (maxData?.position || 0) + 1;

      const { data, error } = await supabase
        .from('todos')
        .insert({
          family_id: familyId,
          user_id: userId,
          title,
          description: description || null,
          is_completed: false,
          position: nextPosition,
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to create todo', details: error.message });
      }

      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const supabase = getSupabaseClient();
      const familyId = (req as any).familyId;
      const { id } = req.params;
      const { title, description, is_completed } = req.body;

      const { data: existing, error: findErr } = await supabase
        .from('todos')
        .select('id, family_id')
        .eq('id', id)
        .single();
      if (findErr || !existing || existing.family_id !== familyId) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      const { data, error } = await supabase
        .from('todos')
        .update({
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          is_completed: is_completed !== undefined ? !!is_completed : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update todo', details: error.message });
      }

      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async remove(req: any, res: Response) {
    try {
      const supabase = getSupabaseClient();
      const familyId = (req as any).familyId;
      const { id } = req.params;

      const { data: existing, error: findErr } = await supabase
        .from('todos')
        .select('id, family_id')
        .eq('id', id)
        .single();
      if (findErr || !existing || existing.family_id !== familyId) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Failed to delete todo', details: error.message });
      }

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async reorder(req: any, res: Response) {
    try {
      const supabase = getSupabaseClient();
      const familyId = (req as any).familyId;
      const { orderedIds } = req.body as { orderedIds: string[] };

      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return res.status(400).json({ error: 'orderedIds must be a non-empty array' });
      }

      // Verify all belong to same hourse
      const { data: items, error: fetchErr } = await supabase
        .from('todos')
        .select('id, family_id')
        .in('id', orderedIds);
      if (fetchErr) {
        return res.status(500).json({ error: 'Failed to fetch todos', details: fetchErr.message });
      }
      const allSameFamily = (items || []).every(i => i.family_id === familyId);
      if (!allSameFamily) {
        return res.status(403).json({ error: 'Some todos do not belong to your hourse' });
      }

      // Update positions
      let position = 1;
      for (const todoId of orderedIds) {
        await supabase
          .from('todos')
          .update({ position })
          .eq('id', todoId);
        position += 1;
      }

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}


