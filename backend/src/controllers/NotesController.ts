import { Response } from 'express';
import { getSupabaseClient } from '../services/supabaseService';

export class NotesController {
  static async list(req: any, res: Response) {
    try {
      const supabase = getSupabaseClient();
      const familyId = (req as any).familyId;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('family_id', familyId)
        .order('updated_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
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
      const { title, content } = req.body;

      if (!title && !content) {
        return res.status(400).json({ error: 'Title or content is required' });
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({
          family_id: familyId,
          user_id: userId,
          title: title || null,
          content: content || '',
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to create note', details: error.message });
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
      const { title, content } = req.body;

      const { data: existing, error: findErr } = await supabase
        .from('notes')
        .select('id, family_id')
        .eq('id', id)
        .single();
      if (findErr || !existing || existing.family_id !== familyId) {
        return res.status(404).json({ error: 'Note not found' });
      }

      const { data, error } = await supabase
        .from('notes')
        .update({
          title: title !== undefined ? title : undefined,
          content: content !== undefined ? content : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update note', details: error.message });
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
        .from('notes')
        .select('id, family_id')
        .eq('id', id)
        .single();
      if (findErr || !existing || existing.family_id !== familyId) {
        return res.status(404).json({ error: 'Note not found' });
      }

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Failed to delete note', details: error.message });
      }

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}


