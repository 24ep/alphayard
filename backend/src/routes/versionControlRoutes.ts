import { Router } from 'express';
import { getSupabaseClient } from '../services/supabaseService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all versions for a content page
router.get('/pages/:pageId/versions', authenticateToken as any, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { page = 1, page_size = 20 } = req.query;
    
    const supabase = getSupabaseClient();
    
    const from = (Number(page) - 1) * Number(page_size);
    const to = from + Number(page_size) - 1;
    
    const { data: versions, error } = await supabase
      .from('content_versions')
      .select(`
        *,
        users (
          id,
          email,
          full_name
        )
      `)
      .eq('page_id', pageId)
      .order('version_number', { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ versions: versions || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific version
router.get('/pages/:pageId/versions/:versionId', authenticateToken as any, async (req, res) => {
  try {
    const { pageId, versionId } = req.params;
    const supabase = getSupabaseClient();
    
    const { data: version, error } = await supabase
      .from('content_versions')
      .select(`
        *,
        users (
          id,
          email,
          full_name
        )
      `)
      .eq('page_id', pageId)
      .eq('id', versionId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json({ version });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new version
router.post('/pages/:pageId/versions', authenticateToken as any, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { 
      title, 
      content, 
      change_description, 
      is_auto_save = false 
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const supabase = getSupabaseClient();
    
    // Get the next version number
    const { data: lastVersion } = await supabase
      .from('content_versions')
      .select('version_number')
      .eq('page_id', pageId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (lastVersion?.version_number || 0) + 1;

    // Create the new version
    const { data: version, error } = await supabase
      .from('content_versions')
      .insert({
        page_id: pageId,
        version_number: nextVersionNumber,
        title,
        content,
        change_description: change_description || null,
        is_auto_save,
        created_by: (req as any).user?.id,
        size_bytes: JSON.stringify(content).length
      })
      .select(`
        *,
        users (
          id,
          email,
          full_name
        )
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ version });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Restore a version (creates a new version with restored content)
router.post('/pages/:pageId/versions/:versionId/restore', authenticateToken as any, async (req, res) => {
  try {
    const { pageId, versionId } = req.params;
    const { restore_description } = req.body;
    
    const supabase = getSupabaseClient();
    
    // Get the version to restore
    const { data: versionToRestore, error: versionError } = await supabase
      .from('content_versions')
      .select('*')
      .eq('page_id', pageId)
      .eq('id', versionId)
      .single();

    if (versionError || !versionToRestore) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Get the next version number
    const { data: lastVersion } = await supabase
      .from('content_versions')
      .select('version_number')
      .eq('page_id', pageId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (lastVersion?.version_number || 0) + 1;

    // Create a new version with the restored content
    const { data: restoredVersion, error: restoreError } = await supabase
      .from('content_versions')
      .insert({
        page_id: pageId,
        version_number: nextVersionNumber,
        title: `Restored from Version ${versionToRestore.version_number}`,
        content: versionToRestore.content,
        change_description: restore_description || `Restored from version ${versionToRestore.version_number}: ${versionToRestore.title}`,
        is_auto_save: false,
        created_by: (req as any).user?.id,
        size_bytes: versionToRestore.size_bytes
      })
      .select(`
        *,
        users (
          id,
          email,
          full_name
        )
      `)
      .single();

    if (restoreError) {
      return res.status(500).json({ error: restoreError.message });
    }

    // Update the main content page with the restored content
    const { error: updateError } = await supabase
      .from('content_pages')
      .update({
        components: versionToRestore.content.components,
        updated_at: new Date().toISOString(),
        updated_by: (req as any).user?.id
      })
      .eq('id', pageId);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    res.json({ 
      version: restoredVersion,
      message: 'Version restored successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a version
router.delete('/pages/:pageId/versions/:versionId', authenticateToken as any, async (req, res) => {
  try {
    const { pageId, versionId } = req.params;
    const supabase = getSupabaseClient();
    
    // Check if this is the only version
    const { data: versionCount } = await supabase
      .from('content_versions')
      .select('id', { count: 'exact' })
      .eq('page_id', pageId);

    if (versionCount && versionCount.length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the only version' });
    }

    const { error } = await supabase
      .from('content_versions')
      .delete()
      .eq('page_id', pageId)
      .eq('id', versionId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Version deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Compare two versions
router.get('/pages/:pageId/versions/:versionId1/compare/:versionId2', authenticateToken as any, async (req, res) => {
  try {
    const { pageId, versionId1, versionId2 } = req.params;
    const supabase = getSupabaseClient();
    
    const { data: versions, error } = await supabase
      .from('content_versions')
      .select('*')
      .eq('page_id', pageId)
      .in('id', [versionId1, versionId2]);

    if (error || versions.length !== 2) {
      return res.status(404).json({ error: 'One or both versions not found' });
    }

    const [version1, version2] = versions;
    
    // Simple diff calculation
    const diff = {
      version1: {
        id: version1.id,
        version_number: version1.version_number,
        title: version1.title,
        created_at: version1.created_at,
        component_count: version1.content.components?.length || 0,
        size_bytes: version1.size_bytes
      },
      version2: {
        id: version2.id,
        version_number: version2.version_number,
        title: version2.title,
        created_at: version2.created_at,
        component_count: version2.content.components?.length || 0,
        size_bytes: version2.size_bytes
      },
      changes: {
        component_count_diff: (version2.content.components?.length || 0) - (version1.content.components?.length || 0),
        size_diff: version2.size_bytes - version1.size_bytes,
        time_diff: new Date(version2.created_at).getTime() - new Date(version1.created_at).getTime()
      }
    };

    res.json({ diff });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-save functionality
router.post('/pages/:pageId/auto-save', authenticateToken as any, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const supabase = getSupabaseClient();
    
    // Check if there's a recent auto-save (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: recentAutoSave } = await supabase
      .from('content_versions')
      .select('id')
      .eq('page_id', pageId)
      .eq('is_auto_save', true)
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If there's a recent auto-save, update it instead of creating a new one
    if (recentAutoSave) {
      const { data: updatedVersion, error: updateError } = await supabase
        .from('content_versions')
        .update({
          content,
          size_bytes: JSON.stringify(content).length,
          updated_at: new Date().toISOString()
        })
        .eq('id', recentAutoSave.id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      return res.json({ version: updatedVersion, message: 'Auto-save updated' });
    }

    // Create new auto-save version
    const { data: lastVersion } = await supabase
      .from('content_versions')
      .select('version_number')
      .eq('page_id', pageId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (lastVersion?.version_number || 0) + 1;

    const { data: autoSaveVersion, error: createError } = await supabase
      .from('content_versions')
      .insert({
        page_id: pageId,
        version_number: nextVersionNumber,
        title: 'Auto Save',
        content,
        change_description: 'Auto-saved changes',
        is_auto_save: true,
        created_by: (req as any).user?.id,
        size_bytes: JSON.stringify(content).length
      })
      .select()
      .single();

    if (createError) {
      return res.status(500).json({ error: createError.message });
    }

    res.json({ version: autoSaveVersion, message: 'Auto-save created' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
