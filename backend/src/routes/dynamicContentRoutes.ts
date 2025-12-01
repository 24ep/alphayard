import { Router } from 'express';
import { getSupabaseClient } from '../services/supabaseService';
import { mockContentService } from '../services/mockContentService';
import { authenticateToken } from '../middleware/auth';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = Router();

// Content Pages CRUD
router.get('/pages', authenticateToken as any, async (req, res) => {
  try {
    const { type, status, page = 1, page_size = 20, search } = req.query;
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('content_pages')
      .select(`
        *,
        content_analytics (
          views,
          clicks,
          conversions
        )
      `)
      .order('updated_at', { ascending: false });

    // Apply filters
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    // Pagination
    const from = (Number(page) - 1) * Number(page_size);
    const to = from + Number(page_size) - 1;
    query = query.range(from, to);

    const { data: pages, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ pages: pages || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pages/:id', authenticateToken as any, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    const { data: page, error } = await supabase
      .from('content_pages')
      .select(`
        *,
        content_analytics (
          views,
          clicks,
          conversions
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Content page not found' });
    }

    res.json({ page });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/pages', authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      type,
      status = 'draft',
      components = [],
      mobile_display = {}
    } = req.body;

    if (!title || !slug || !type) {
      return res.status(400).json({ error: 'Title, slug, and type are required' });
    }

    try {
      // Try Supabase first
      const supabase = getSupabaseClient();
      
      const { data: page, error } = await supabase
        .from('content_pages')
        .insert({
          title,
          slug,
          type,
          status,
          components,
          mobile_display,
          created_by: (req as any).admin?.id || (req as any).user?.id || 'admin',
          updated_by: (req as any).admin?.id || (req as any).user?.id || 'admin'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      res.status(201).json({ page });
    } catch (supabaseError) {
      console.warn('Supabase unavailable, using mock service:', supabaseError);
      
      // Fallback to mock service
      const page = await mockContentService.createPage({
        title,
        slug,
        type,
        status,
        components,
        mobile_display,
        created_by: (req as any).admin?.id || (req as any).user?.id || 'admin',
        updated_by: (req as any).admin?.id || (req as any).user?.id || 'admin'
      });

      res.status(201).json({ page });
    }
  } catch (error: any) {
    console.error('Content creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/pages/:id', authenticateToken as any, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      type,
      status,
      components,
      mobile_display
    } = req.body;

    const supabase = getSupabaseClient();
    
    const updateData: any = {
      updated_by: (req as any).user?.id,
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (components !== undefined) updateData.components = components;
    if (mobile_display !== undefined) updateData.mobile_display = mobile_display;

    const { data: page, error } = await supabase
      .from('content_pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ page });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/pages/:id', authenticateToken as any, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('content_pages')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Content page deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Dashboard - Public endpoint for content loading
router.get('/admin/content', async (req, res) => {
  try {
    const { type, status, page = 1, page_size = 20, search } = req.query;
    
    // Mock data for demo purposes when database is not available
    const mockPages = [
      {
        id: '1',
        title: 'Welcome to Bondarys',
        slug: 'welcome',
        type: 'page',
        status: 'published',
        content: 'Welcome to the Bondarys family management platform!',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin',
        updated_by: 'admin'
      },
      {
        id: '2',
        title: 'Getting Started Guide',
        slug: 'getting-started',
        type: 'guide',
        status: 'published',
        content: 'Learn how to get started with Bondarys in just a few steps.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin',
        updated_by: 'admin'
      },
      {
        id: '3',
        title: 'Family Safety Tips',
        slug: 'safety-tips',
        type: 'article',
        status: 'draft',
        content: 'Important safety tips for your family.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin',
        updated_by: 'admin'
      }
    ];

    try {
      const supabase = getSupabaseClient();
      
      let query = supabase
        .from('content_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      // Apply filters
      if (type && type !== 'all') {
        query = query.eq('type', type);
      }
      
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
      }

      // Pagination
      const from = (Number(page) - 1) * Number(page_size);
      const to = from + Number(page_size) - 1;
      query = query.range(from, to);

      const { data: pages, error } = await query;

      if (error) {
        console.warn('Database error, using mock data:', error.message);
        // Filter mock data based on parameters
        let filteredPages = mockPages;
        
        if (type && type !== 'all') {
          filteredPages = filteredPages.filter(p => p.type === type);
        }
        
        if (status && status !== 'all') {
          filteredPages = filteredPages.filter(p => p.status === status);
        }
        
        if (search) {
          const searchLower = String(search).toLowerCase();
          filteredPages = filteredPages.filter(p => 
            p.title.toLowerCase().includes(searchLower) || 
            p.slug.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply pagination
        const fromIndex = (Number(page) - 1) * Number(page_size);
        const toIndex = fromIndex + Number(page_size);
        const paginatedPages = filteredPages.slice(fromIndex, toIndex);
        
        return res.json({ pages: paginatedPages });
      }

      res.json({ pages: pages || [] });
    } catch (dbError) {
      console.warn('Database connection failed, using mock data:', dbError);
      
      // Filter mock data based on parameters
      let filteredPages = mockPages;
      
      if (type && type !== 'all') {
        filteredPages = filteredPages.filter(p => p.type === type);
      }
      
      if (status && status !== 'all') {
        filteredPages = filteredPages.filter(p => p.status === status);
      }
      
      if (search) {
        const searchLower = String(search).toLowerCase();
        filteredPages = filteredPages.filter(p => 
          p.title.toLowerCase().includes(searchLower) || 
          p.slug.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const fromIndex = (Number(page) - 1) * Number(page_size);
      const toIndex = fromIndex + Number(page_size);
      const paginatedPages = filteredPages.slice(fromIndex, toIndex);
      
      res.json({ pages: paginatedPages });
    }
  } catch (error: any) {
    console.error('Admin content endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mobile App Content Integration
router.get('/mobile/content', async (req, res) => {
  try {
    const { 
      type, 
      show_on_login, 
      show_on_home, 
      show_on_news, 
      show_as_popup 
    } = req.query;
    
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('content_pages')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    
    if (show_on_login === 'true') {
      query = query.eq('mobile_display->showOnLogin', true);
    }
    
    if (show_on_home === 'true') {
      query = query.eq('mobile_display->showOnHome', true);
    }
    
    if (show_on_news === 'true') {
      query = query.eq('mobile_display->showOnNews', true);
    }
    
    if (show_as_popup === 'true') {
      query = query.eq('mobile_display->showAsPopup', true);
    }

    const { data: content, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ content: content || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Content Analytics
router.get('/pages/:id/analytics', authenticateToken as any, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    
    const { data: analytics, error } = await supabase
      .from('content_analytics')
      .select('*')
      .eq('page_id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return res.status(500).json({ error: error.message });
    }

    res.json({ 
      analytics: analytics || {
        views: 0,
        clicks: 0,
        conversions: 0,
        last_viewed: null
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/pages/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const { timestamp } = req.body;
    const supabase = getSupabaseClient();
    
    // Upsert analytics record
    const { error } = await supabase
      .from('content_analytics')
      .upsert({
        page_id: id,
        views: 1,
        last_viewed: timestamp || new Date().toISOString()
      }, {
        onConflict: 'page_id',
        ignoreDuplicates: false
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Increment view count
    await supabase.rpc('increment_content_views', { page_id: id });

    res.json({ message: 'View tracked successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Content Templates
router.get('/templates', authenticateToken as any, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: templates, error } = await supabase
      .from('content_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ templates: templates || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/templates/:id/create', authenticateToken as any, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug } = req.body;
    const supabase = getSupabaseClient();
    
    // Get template
    const { data: template, error: templateError } = await supabase
      .from('content_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (templateError || !template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Create page from template
    const { data: page, error: pageError } = await supabase
      .from('content_pages')
      .insert({
        title: title || template.name,
        slug: slug || `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        type: template.type,
        status: 'draft',
        components: template.components,
        mobile_display: template.mobile_display || {},
        created_by: (req as any).user?.id,
        updated_by: (req as any).user?.id
      })
      .select()
      .single();

    if (pageError) {
      return res.status(500).json({ error: pageError.message });
    }

    res.status(201).json({ page });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve content by mobile route name
router.get('/by-route/:route', async (req, res) => {
  const route = req.params.route;
  try {
    const supabase = getSupabaseClient();
    const { data: pages, error } = await supabase
      .from('content_pages')
      .select('*')
      .eq('route', route)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ page: pages?.[0] || null });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
