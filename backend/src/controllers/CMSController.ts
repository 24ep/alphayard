import { Response } from 'express';
import { supabase } from '../config/supabase';
import supabaseService from '../services/supabaseService';
import { CreateContentRequest, UpdateContentRequest } from '../models/Content';
import { CreateCategoryRequest } from '../models/Category';

export class CMSController {
  // Marketing Content Management
  async getMarketingContent(req: any, res: Response) {
    try {
      const query = req.query;

      let supabaseQuery = supabase
        .from('marketing_content')
        .select(`
          *,
          content_types(*),
          categories(*),
          users!marketing_content_created_by_fkey(*),
          marketing_content_meta(*),
          marketing_content_files(*)
        `);

      // Apply filters
      if (query.contentTypeId) {
        supabaseQuery = supabaseQuery.eq('content_type_id', query.contentTypeId);
      }
      if (query.categoryId) {
        supabaseQuery = supabaseQuery.eq('category_id', query.categoryId);
      }
      if (query.status) {
        supabaseQuery = supabaseQuery.eq('status', query.status);
      }
      if (query.isPinned !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_pinned', query.isPinned);
      }
      if (query.isFeatured !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_featured', query.isFeatured);
      }
      if (query.search) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query.search}%,content.ilike.%${query.search}%`);
      }
      if (query.authorId) {
        supabaseQuery = supabaseQuery.eq('created_by', query.authorId);
      }

      // Apply sorting
      const sortBy = String(query.sortBy || 'created_at');
      const sortOrder = String(query.sortOrder || 'desc');
      supabaseQuery = supabaseQuery.order(String(sortBy), { ascending: sortOrder === 'asc' });

      // Apply pagination
      const limit = parseInt(String(query.limit || 20), 10);
      const offset = parseInt(String(query.offset || 0), 10);
      supabaseQuery = supabaseQuery.range(parseInt(String(offset), 10), parseInt(String(offset), 10) + limit - 1);

      const { data, error } = await supabaseQuery;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ content: data });
    } catch (error) {
      console.error('Error fetching marketing content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMarketingContentById(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const { data, error } = await supabase
        .from('marketing_content')
        .select(`
          *,
          content_types(*),
          categories(*),
          users!marketing_content_created_by_fkey(*),
          marketing_content_meta(*),
          marketing_content_files(*)
        `)
        .eq('id', contentId)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Content not found' });
      }

      res.json({ content: data });
    } catch (error) {
      console.error('Error fetching marketing content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createMarketingContent(req: any, res: Response) {
    try {
      const contentData = req.body;

      const { data, error } = await supabase
        .from('marketing_content')
        .insert([contentData])
        .select(`
          *,
          content_types(*),
          categories(*),
          users!marketing_content_created_by_fkey(*)
        `)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ content: data });
    } catch (error) {
      console.error('Error creating marketing content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateMarketingContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const contentData = req.body;

      const { data, error } = await supabase
        .from('marketing_content')
        .update(contentData)
        .eq('id', contentId)
        .select(`
          *,
          content_types(*),
          categories(*),
          users!marketing_content_created_by_fkey(*)
        `)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ content: data });
    } catch (error) {
      console.error('Error updating marketing content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteMarketingContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const { error } = await supabase
        .from('marketing_content')
        .delete()
        .eq('id', contentId);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Error deleting marketing content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMarketingSlides(req: any, res: Response) {
    try {
      const { data, error } = await supabase
        .from('marketing_content')
        .select(`
          *,
          content_types(*),
          categories(*)
        `)
        .eq('content_types.name', 'marketing_slide')
        .eq('status', 'published')
        .order('priority', { ascending: true });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Parse the JSON content field for each slide
      const slides = data.map(slide => ({
        ...slide,
        slideData: typeof slide.content === 'string' ? JSON.parse(slide.content) : slide.content
      }));

      res.json({ slides });
    } catch (error) {
      console.error('Error fetching marketing slides:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Content Management
  async getContent(req: any, res: Response) {
    try {
      const { familyId } = req.params;
      const query: any = {
        familyId,
        ...req.query
      };

      let supabaseQuery = supabase
        .from('content')
        .select(`
          *,
          content_types(*),
          categories(*),
          users!content_created_by_fkey(*),
          content_meta(*),
          content_tags(*),
          content_interactions(*),
          content_comments(*),
          content_files(*)
        `)
        .eq('family_id', familyId);

      // Apply filters
      if (query.contentTypeId) {
        supabaseQuery = supabaseQuery.eq('content_type_id', query.contentTypeId);
      }
      if (query.categoryId) {
        supabaseQuery = supabaseQuery.eq('category_id', query.categoryId);
      }
      if (query.status) {
        supabaseQuery = supabaseQuery.eq('status', query.status);
      }
      if (query.isPinned !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_pinned', query.isPinned);
      }
      if (query.isFeatured !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_featured', query.isFeatured);
      }
      if (query.search) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query.search}%,content.ilike.%${query.search}%`);
      }
      if (query.authorId) {
        supabaseQuery = supabaseQuery.eq('created_by', query.authorId);
      }
      if (query.dateFrom) {
        const dateFrom = query.dateFrom instanceof Date ? query.dateFrom : new Date(query.dateFrom);
        supabaseQuery = supabaseQuery.gte('created_at', dateFrom.toISOString());
      }
      if (query.dateTo) {
        const dateTo = query.dateTo instanceof Date ? query.dateTo : new Date(query.dateTo);
        supabaseQuery = supabaseQuery.lte('created_at', dateTo.toISOString());
      }

      // Apply sorting
      const sortBy = String(query.sortBy || 'createdAt');
      const sortOrder = String(query.sortOrder || 'desc');
      supabaseQuery = supabaseQuery.order(String(sortBy), { ascending: sortOrder === 'asc' });

      // Apply pagination
      const limit = parseInt(String(query.limit || 20), 10);
      const offset = parseInt(String(query.offset || 0), 10);
      supabaseQuery = supabaseQuery.range(parseInt(String(offset), 10), parseInt(String(offset), 10) + limit - 1);

      const { data, error } = await supabaseQuery;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ content: data });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getContentById(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          content_types(*),
          categories(*),
          users!content_created_by_fkey(*),
          content_meta(*),
          content_tags(*),
          content_interactions(*),
          content_comments(*),
          content_files(*)
        `)
        .eq('id', contentId)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Content not found' });
      }

      res.json({ content: data });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createContent(req: any, res: Response) {
    try {
      const contentData: CreateContentRequest = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate slug from title
      const slug = contentData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('content')
        .insert({
          family_id: contentData.familyId,
          content_type_id: contentData.contentTypeId,
          category_id: contentData.categoryId,
          title: contentData.title,
          slug,
          content: contentData.content,
          excerpt: contentData.excerpt,
          featured_image_url: contentData.featuredImageUrl,
          status: contentData.status || 'draft',
          priority: contentData.priority || 0,
          is_pinned: contentData.isPinned || false,
          is_featured: contentData.isFeatured || false,
          published_at: contentData.publishedAt,
          created_by: userId,
          updated_by: userId
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Add meta data if provided
      if (contentData.meta) {
        const metaEntries = Object.entries(contentData.meta).map(([key, value]) => ({
          content_id: data.id,
          meta_key: key,
          meta_value: value
        }));

        await supabaseService.getSupabaseClient().from('content_meta').insert(metaEntries);
      }

      // Add tags if provided
      if (contentData.tags && contentData.tags.length > 0) {
        const tagEntries = contentData.tags.map(tag => ({
          content_id: data.id,
          tag
        }));

        await supabaseService.getSupabaseClient().from('content_tags').insert(tagEntries);
      }

      res.status(201).json({ content: data });
    } catch (error) {
      console.error('Error creating content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const updateData: UpdateContentRequest = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { data, error } = await supabase
        .from('content')
        .update({
          content_type_id: updateData.contentTypeId,
          category_id: updateData.categoryId,
          title: updateData.title,
          content: updateData.content,
          excerpt: updateData.excerpt,
          featured_image_url: updateData.featuredImageUrl,
          status: updateData.status,
          priority: updateData.priority,
          is_pinned: updateData.isPinned,
          is_featured: updateData.isFeatured,
          published_at: updateData.publishedAt,
          updated_by: userId
        })
        .eq('id', contentId)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Update meta data if provided
      if (updateData.meta) {
        // Delete existing meta
        await supabaseService.getSupabaseClient().from('content_meta').delete().eq('content_id', contentId);

        // Insert new meta
        const metaEntries = Object.entries(updateData.meta).map(([key, value]) => ({
          content_id: contentId,
          meta_key: key,
          meta_value: value
        }));

        await supabaseService.getSupabaseClient().from('content_meta').insert(metaEntries);
      }

      // Update tags if provided
      if (updateData.tags) {
        // Delete existing tags
        await supabaseService.getSupabaseClient().from('content_tags').delete().eq('content_id', contentId);

        // Insert new tags
        if (updateData.tags.length > 0) {
          const tagEntries = updateData.tags.map(tag => ({
            content_id: contentId,
            tag
          }));

          await supabaseService.getSupabaseClient().from('content_tags').insert(tagEntries);
        }
      }

      res.json({ content: data });
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Content Interactions
  async likeContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('content_interactions')
        .select('id')
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .eq('interaction_type', 'like')
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('content_interactions')
          .delete()
          .eq('content_id', contentId)
          .eq('user_id', userId)
          .eq('interaction_type', 'like');

        res.json({ liked: false });
      } else {
        // Like
        await supabase
          .from('content_interactions')
          .insert({
            content_id: contentId,
            user_id: userId,
            interaction_type: 'like'
          });

        res.json({ liked: true });
      }
    } catch (error) {
      console.error('Error liking content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async viewContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Record view
      await supabase
        .from('content_interactions')
        .insert({
          content_id: contentId,
          user_id: userId,
          interaction_type: 'view'
        });

      res.json({ message: 'View recorded' });
    } catch (error) {
      console.error('Error recording view:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async shareContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const { platform, url } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Record share
      await supabase
        .from('content_interactions')
        .insert({
          content_id: contentId,
          user_id: userId,
          interaction_type: 'share',
          metadata: { platform, url }
        });

      res.json({ message: 'Share recorded' });
    } catch (error) {
      console.error('Error recording share:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Comments
  async getComments(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const { data, error } = await supabase
        .from('content_comments')
        .select(`
          *,
          users(*)
        `)
        .eq('content_id', contentId)
        .eq('is_approved', true)
        .order('created_at', { ascending: true });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ comments: data });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createComment(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const { comment, parentId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { data, error } = await supabase
        .from('content_comments')
        .insert({
          content_id: contentId,
          user_id: userId,
          parent_id: parentId,
          comment
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ comment: data });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Categories
  async getCategories(req: any, res: Response) {
    try {
      const { familyId } = req.params;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ categories: data });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createCategory(req: any, res: Response) {
    try {
      const categoryData: CreateCategoryRequest = req.body;

      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ category: data });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Analytics
  async getContentAnalytics(req: any, res: Response) {
    try {
      const { familyId } = req.params;
      const { dateFrom, dateTo } = req.query;

      let query = supabase
        .from('content_analytics')
        .select(`
          *,
          content!inner(*)
        `)
        .eq('content.family_id', familyId);

      if (dateFrom) {
        query = query.gte('date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('date', dateTo);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ analytics: data });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPopularContent(req: any, res: Response) {
    try {
      const { familyId } = req.params;
      const { limit = 10 } = req.query;

      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          content_types(*),
          categories(*)
        `)
        .eq('family_id', familyId)
        .eq('status', 'published')
        .order('priority', { ascending: false })
        .limit(Number(limit));

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ content: data });
    } catch (error) {
      console.error('Error fetching popular content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
