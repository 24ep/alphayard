import { Response } from 'express';
import { supabase } from '../config/supabase';
import supabaseService from '../services/supabaseService';

export interface ModalMarketingContent {
  id: string;
  title: string;
  content: string;
  modal_type: 'popup' | 'banner' | 'notification' | 'promotion' | 'announcement';
  trigger_type: 'immediate' | 'delayed' | 'user_action' | 'time_based' | 'location_based';
  trigger_delay: number;
  trigger_conditions?: any;
  display_settings: any;
  target_audience: any;
  priority: number;
  is_active: boolean;
  start_date?: Date;
  end_date?: Date;
  max_views_per_user: number;
  max_views_total?: number;
  current_views: number;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ModalAnalytics {
  id: string;
  modal_id: string;
  user_id?: string;
  family_id?: string;
  action_type: 'view' | 'click' | 'close' | 'dismiss' | 'interact';
  action_data?: any;
  device_info?: any;
  location_data?: any;
  created_at: Date;
}

export class ModalMarketingController {
  // Get active modals for a user/family
  async getActiveModals(req: any, res: Response) {
    try {
      const { userId, familyId } = req.query;
      const now = new Date().toISOString();

      let query = supabase
        .from('modal_marketing_content')
        .select(`
          *,
          modal_marketing_interactions!left(
            interaction_count,
            first_viewed_at,
            last_viewed_at,
            dismissed_at
          )
        `)
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('priority', { ascending: false });

      // Apply user/family filtering
      if (userId) {
        query = query.or(`target_audience->user_types.cs.["all","existing_user","new_user"],target_audience->user_ids.cs.["${userId}"]`);
      }
      if (familyId) {
        query = query.or(`target_audience->families.eq."all",target_audience->family_ids.cs.["${familyId}"]`);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Filter modals based on view limits and user interactions
      const filteredModals = data?.filter(modal => {
        // Check if user has exceeded max views
        const userInteraction = modal.modal_marketing_interactions?.[0];
        if (userInteraction && userInteraction.interaction_count >= modal.max_views_per_user) {
          return false;
        }

        // Check if modal has reached max total views
        if (modal.max_views_total && modal.current_views >= modal.max_views_total) {
          return false;
        }

        // Check if modal was dismissed
        if (userInteraction && userInteraction.dismissed_at) {
          return false;
        }

        return true;
      }) || [];

      res.json({ modals: filteredModals });
    } catch (error) {
      console.error('Error fetching active modals:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all modal content (admin)
  async getModalContent(req: any, res: Response) {
    try {
      const query = req.query;
      
      let supabaseQuery = supabase
        .from('modal_marketing_content')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (query.modal_type) {
        supabaseQuery = supabaseQuery.eq('modal_type', query.modal_type);
      }
      if (query.trigger_type) {
        supabaseQuery = supabaseQuery.eq('trigger_type', query.trigger_type);
      }
      if (query.is_active !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_active', query.is_active === 'true');
      }
      if (query.search) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query.search}%,content.ilike.%${query.search}%`);
      }

      // Apply pagination
      const limit = parseInt(query.limit as string) || 20;
      const offset = parseInt(query.offset as string) || 0;
      supabaseQuery = supabaseQuery.range(parseInt(String(offset), 10), parseInt(String(offset), 10) + limit - 1);

      const { data, error } = await supabaseQuery;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ content: data });
    } catch (error) {
      console.error('Error fetching modal content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get modal content by ID
  async getModalContentById(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const { data, error } = await supabase
        .from('modal_marketing_content')
        .select(`
          *,
          modal_marketing_analytics(*),
          modal_marketing_interactions(*)
        `)
        .eq('id', contentId)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Modal content not found' });
      }

      res.json({ content: data });
    } catch (error) {
      console.error('Error fetching modal content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create modal content
  async createModalContent(req: any, res: Response) {
    try {
      const contentData = req.body;

      const { data, error } = await supabase
        .from('modal_marketing_content')
        .insert([contentData])
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ content: data });
    } catch (error) {
      console.error('Error creating modal content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update modal content
  async updateModalContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const contentData = req.body;

      const { data, error } = await supabase
        .from('modal_marketing_content')
        .update(contentData)
        .eq('id', contentId)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ content: data });
    } catch (error) {
      console.error('Error updating modal content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete modal content
  async deleteModalContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const { error } = await supabase
        .from('modal_marketing_content')
        .delete()
        .eq('id', contentId);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ message: 'Modal content deleted successfully' });
    } catch (error) {
      console.error('Error deleting modal content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Track modal interaction
  async trackModalInteraction(req: any, res: Response) {
    try {
      const { modalId } = req.params;
      const { userId, familyId, actionType, actionData, deviceInfo, locationData } = req.body;

      // Record analytics
      const analyticsData = {
        modal_id: modalId,
        user_id: userId,
        family_id: familyId,
        action_type: actionType,
        action_data: actionData,
        device_info: deviceInfo,
        location_data: locationData
      };

      const { error: analyticsError } = await supabase
        .from('modal_marketing_analytics')
        .insert([analyticsData]);

      if (analyticsError) {
        console.error('Error recording analytics:', analyticsError);
      }

      // Update or create user interaction record
      const interactionData = {
        modal_id: modalId,
        user_id: userId,
        family_id: familyId,
        interaction_count: 1,
        first_viewed_at: new Date().toISOString(),
        last_viewed_at: new Date().toISOString(),
        dismissed_at: actionType === 'dismiss' ? new Date().toISOString() : null
      };

      const { error: interactionError } = await supabase
        .from('modal_marketing_interactions')
        .upsert([interactionData], {
          onConflict: 'modal_id,user_id,family_id'
        });

      if (interactionError) {
        console.error('Error updating interaction:', interactionError);
      }

      // Update view count
      if (actionType === 'view') {
        await supabaseService.getSupabaseClient().rpc('increment_modal_views', { modal_id: modalId });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking modal interaction:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get modal analytics
  async getModalAnalytics(req: any, res: Response) {
    try {
      const { modalId } = req.params;
      const { startDate, endDate } = req.query;

      let query = supabase
        .from('modal_marketing_analytics')
        .select(`
          *,
          users(first_name, last_name, email),
          families(name)
        `)
        .eq('modal_id', modalId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Aggregate analytics
      const analytics = {
        total_views: data?.filter(d => d.action_type === 'view').length || 0,
        total_clicks: data?.filter(d => d.action_type === 'click').length || 0,
        total_closes: data?.filter(d => d.action_type === 'close').length || 0,
        total_dismisses: data?.filter(d => d.action_type === 'dismiss').length || 0,
        click_rate: 0,
        close_rate: 0,
        interactions: data || []
      };

      if (analytics.total_views > 0) {
        analytics.click_rate = (analytics.total_clicks / analytics.total_views) * 100;
        analytics.close_rate = (analytics.total_closes / analytics.total_views) * 100;
      }

      res.json({ analytics });
    } catch (error) {
      console.error('Error fetching modal analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get modal performance dashboard
  async getModalDashboard(req: any, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      let query = supabase
        .from('modal_marketing_content')
        .select(`
          id,
          title,
          modal_type,
          is_active,
          current_views,
          created_at,
          modal_marketing_analytics(action_type)
        `);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Calculate dashboard metrics
      const dashboard = {
        total_modals: data?.length || 0,
        active_modals: data?.filter(d => d.is_active).length || 0,
        total_views: data?.reduce((sum, d) => sum + (d.current_views || 0), 0) || 0,
        modal_types: {
          popup: data?.filter(d => d.modal_type === 'popup').length || 0,
          banner: data?.filter(d => d.modal_type === 'banner').length || 0,
          notification: data?.filter(d => d.modal_type === 'notification').length || 0,
          promotion: data?.filter(d => d.modal_type === 'promotion').length || 0,
          announcement: data?.filter(d => d.modal_type === 'announcement').length || 0
        },
        top_performing: data?.sort((a, b) => (b.current_views || 0) - (a.current_views || 0)).slice(0, 5) || []
      };

      res.json({ dashboard });
    } catch (error) {
      console.error('Error fetching modal dashboard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
