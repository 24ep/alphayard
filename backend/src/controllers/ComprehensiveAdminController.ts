import { Response } from 'express';
import { supabase } from '../config/supabase';
import supabaseService from '../services/supabaseService';

export interface AdminRole {
  id: string;
  name: string;
  description?: string;
  permissions: any;
  is_system_role: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AdminUser {
  id: string;
  user_id: string;
  admin_role_id?: string;
  permissions: any;
  is_super_admin: boolean;
  is_active: boolean;
  last_login?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  user?: any;
  role?: AdminRole;
}

export interface HouseManagement {
  id: string;
  family_id: string;
  house_name: string;
  house_type: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  coordinates?: any;
  house_size_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  year_built?: number;
  house_status: string;
  management_notes?: string;
  emergency_contacts: any[];
  house_features: any[];
  is_verified: boolean;
  verified_by?: string;
  verified_at?: Date;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  family?: any;
}

export interface SocialMediaAccount {
  id: string;
  family_id: string;
  platform: string;
  account_handle: string;
  account_url?: string;
  account_type: string;
  is_verified: boolean;
  is_public: boolean;
  privacy_settings: any;
  connection_status: string;
  last_sync?: Date;
  sync_frequency: string;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  family?: any;
}

export interface ApplicationSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  category: string;
  description?: string;
  is_public: boolean;
  is_editable: boolean;
  validation_rules: any;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

export class ComprehensiveAdminController {
  // Dashboard Statistics
  async getDashboardStats(req: any, res: Response) {
    try {
      const { data, error } = await supabaseService.getSupabaseClient().rpc('get_admin_dashboard_stats');

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ stats: data?.[0] || {} });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin Users Management
  async getAdminUsers(req: any, res: Response) {
    try {
      const { role_id, is_active, search } = req.query;
      
      let query = supabase
        .from('admin_users')
        .select(`
          *,
          users(first_name, last_name, email, avatar_url),
          admin_roles(*)
        `)
        .order('created_at', { ascending: false });

      if (role_id) {
        query = query.eq('admin_role_id', role_id);
      }
      if (is_active !== undefined) {
        query = query.eq('is_active', is_active === 'true');
      }
      if (search) {
        query = query.or(`users.first_name.ilike.%${search}%,users.last_name.ilike.%${search}%,users.email.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ admin_users: data });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createAdminUser(req: any, res: Response) {
    try {
      const adminUserData = req.body;

      const { data, error } = await supabase
        .from('admin_users')
        .insert([adminUserData])
        .select(`
          *,
          users(first_name, last_name, email, avatar_url),
          admin_roles(*)
        `)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ admin_user: data });
    } catch (error) {
      console.error('Error creating admin user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateAdminUser(req: any, res: Response) {
    try {
      const { adminUserId } = req.params;
      const adminUserData = req.body;

      const { data, error } = await supabase
        .from('admin_users')
        .update(adminUserData)
        .eq('id', adminUserId)
        .select(`
          *,
          users(first_name, last_name, email, avatar_url),
          admin_roles(*)
        `)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ admin_user: data });
    } catch (error) {
      console.error('Error updating admin user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // House Management
  async getHouses(req: any, res: Response) {
    try {
      const { family_id, house_status, house_type, search, city, state } = req.query;
      
      let query = supabase
        .from('house_management')
        .select(`
          *,
          families(name, description),
          users!house_management_created_by_fkey(first_name, last_name),
          users!house_management_updated_by_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (family_id) {
        query = query.eq('family_id', family_id);
      }
      if (house_status) {
        query = query.eq('house_status', house_status);
      }
      if (house_type) {
        query = query.eq('house_type', house_type);
      }
      if (search) {
        query = query.or(`house_name.ilike.%${search}%,address.ilike.%${search}%`);
      }
      if (city) {
        query = query.ilike('city', `%${city}%`);
      }
      if (state) {
        query = query.ilike('state', `%${state}%`);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ houses: data });
    } catch (error) {
      console.error('Error fetching houses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createHouse(req: any, res: Response) {
    try {
      const houseData = req.body;

      const { data, error } = await supabase
        .from('house_management')
        .insert([houseData])
        .select(`
          *,
          families(name, description)
        `)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ house: data });
    } catch (error) {
      console.error('Error creating house:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateHouse(req: any, res: Response) {
    try {
      const { houseId } = req.params;
      const houseData = req.body;

      const { data, error } = await supabase
        .from('house_management')
        .update(houseData)
        .eq('id', houseId)
        .select(`
          *,
          families(name, description)
        `)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ house: data });
    } catch (error) {
      console.error('Error updating house:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Social Media Management
  async getSocialAccounts(req: any, res: Response) {
    try {
      const { family_id, platform, connection_status, search } = req.query;
      
      let query = supabase
        .from('social_media_accounts')
        .select(`
          *,
          families(name, description)
        `)
        .order('created_at', { ascending: false });

      if (family_id) {
        query = query.eq('family_id', family_id);
      }
      if (platform) {
        query = query.eq('platform', platform);
      }
      if (connection_status) {
        query = query.eq('connection_status', connection_status);
      }
      if (search) {
        query = query.or(`account_handle.ilike.%${search}%,account_url.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ social_accounts: data });
    } catch (error) {
      console.error('Error fetching social accounts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSocialPosts(req: any, res: Response) {
    try {
      const { family_id, platform, post_type, start_date, end_date, search } = req.query;
      
      let query = supabase
        .from('social_media_posts')
        .select(`
          *,
          social_media_accounts(account_handle, platform),
          families(name)
        `)
        .order('posted_at', { ascending: false });

      if (family_id) {
        query = query.eq('family_id', family_id);
      }
      if (platform) {
        query = query.eq('platform', platform);
      }
      if (post_type) {
        query = query.eq('post_type', post_type);
      }
      if (start_date) {
        query = query.gte('posted_at', start_date);
      }
      if (end_date) {
        query = query.lte('posted_at', end_date);
      }
      if (search) {
        query = query.ilike('content', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ posts: data });
    } catch (error) {
      console.error('Error fetching social posts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Application Settings
  async getApplicationSettings(req: any, res: Response) {
    try {
      const { category, is_public, is_editable } = req.query;
      
      let query = supabase
        .from('application_settings')
        .select('*')
        .order('category')
        .order('setting_key');

      if (category) {
        query = query.eq('category', category);
      }
      if (is_public !== undefined) {
        query = query.eq('is_public', is_public === 'true');
      }
      if (is_editable !== undefined) {
        query = query.eq('is_editable', is_editable === 'true');
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ settings: data });
    } catch (error) {
      console.error('Error fetching application settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createOrUpsertApplicationSetting(req: any, res: Response) {
    try {
      const {
        setting_key,
        setting_value,
        setting_type = 'json',
        category = 'general',
        description,
        is_public = false,
        is_editable = true,
        validation_rules = {},
        created_by,
        updated_by,
      } = req.body;

      if (!setting_key) {
        return res.status(400).json({ error: 'setting_key is required' });
      }

      const now = new Date().toISOString();

      // Upsert by unique setting_key
      const { data, error } = await supabase
        .from('application_settings')
        .upsert(
          [{
            setting_key,
            setting_value,
            setting_type,
            category,
            description,
            is_public,
            is_editable,
            validation_rules,
            created_by,
            updated_by,
            updated_at: now,
          }],
          { onConflict: 'setting_key' }
        )
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ setting: data });
    } catch (error) {
      console.error('Error upserting application setting:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateApplicationSetting(req: any, res: Response) {
    try {
      const { settingKey } = req.params;
      const { setting_value, updated_by } = req.body;

      const { data, error } = await supabase
        .from('application_settings')
        .update({
          setting_value,
          updated_by,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', settingKey)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ setting: data });
    } catch (error) {
      console.error('Error updating application setting:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // System Notifications
  async getSystemNotifications(req: any, res: Response) {
    try {
      const { is_active, notification_type, priority, is_global } = req.query;
      
      let query = supabase
        .from('system_notifications')
        .select(`
          *,
          users!system_notifications_created_by_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (is_active !== undefined) {
        query = query.eq('is_active', is_active === 'true');
      }
      if (notification_type) {
        query = query.eq('notification_type', notification_type);
      }
      if (priority) {
        query = query.eq('priority', priority);
      }
      if (is_global !== undefined) {
        query = query.eq('is_global', is_global === 'true');
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ notifications: data });
    } catch (error) {
      console.error('Error fetching system notifications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createSystemNotification(req: any, res: Response) {
    try {
      const notificationData = req.body;

      const { data, error } = await supabase
        .from('system_notifications')
        .insert([notificationData])
        .select(`
          *,
          users!system_notifications_created_by_fkey(first_name, last_name)
        `)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ notification: data });
    } catch (error) {
      console.error('Error creating system notification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin Activity Log
  async getAdminActivityLog(req: any, res: Response) {
    try {
      const { admin_user_id, resource_type, action, start_date, end_date } = req.query;
      
      let query = supabase
        .from('admin_activity_log')
        .select(`
          *,
          admin_users(
            users(first_name, last_name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (admin_user_id) {
        query = query.eq('admin_user_id', admin_user_id);
      }
      if (resource_type) {
        query = query.eq('resource_type', resource_type);
      }
      if (action) {
        query = query.eq('action', action);
      }
      if (start_date) {
        query = query.gte('created_at', start_date);
      }
      if (end_date) {
        query = query.lte('created_at', end_date);
      }

      // Apply pagination
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      query = query.range(parseInt(String(offset), 10), parseInt(String(offset), 10) + limit - 1);

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ activity_log: data });
    } catch (error) {
      console.error('Error fetching admin activity log:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // User Management
  async getUsers(req: any, res: Response) {
    try {
      const { is_active, user_type, family_id, search, created_after, created_before } = req.query;
      
      let query = supabase
        .from('users')
        .select(`
          *,
          families(name, description),
          user_families(families(name, description))
        `)
        .order('created_at', { ascending: false });

      if (is_active !== undefined) {
        query = query.eq('is_active', is_active === 'true');
      }
      if (user_type) {
        query = query.eq('user_type', user_type);
      }
      if (family_id) {
        query = query.eq('family_id', family_id);
      }
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      if (created_after) {
        query = query.gte('created_at', created_after);
      }
      if (created_before) {
        query = query.lte('created_at', created_before);
      }

      // Apply pagination
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      query = query.range(parseInt(String(offset), 10), parseInt(String(offset), 10) + limit - 1);

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ users: data });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateUser(req: any, res: Response) {
    try {
      const { userId } = req.params;
      const userData = req.body;

      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select(`
          *,
          families(name, description)
        `)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ user: data });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Family Management
  async getFamilies(req: any, res: Response) {
    try {
      const { is_active, search, created_after, created_before } = req.query;
      
      let query = supabase
        .from('families')
        .select(`
          *,
          users!families_created_by_fkey(first_name, last_name, email),
          user_families(
            users(first_name, last_name, email, user_type)
          )
        `)
        .order('created_at', { ascending: false });

      if (is_active !== undefined) {
        query = query.eq('is_active', is_active === 'true');
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (created_after) {
        query = query.gte('created_at', created_after);
      }
      if (created_before) {
        query = query.lte('created_at', created_before);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ families: data });
    } catch (error) {
      console.error('Error fetching families:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateFamily(req: any, res: Response) {
    try {
      const { familyId } = req.params;
      const familyData = req.body;

      const { data, error } = await supabase
        .from('families')
        .update(familyData)
        .eq('id', familyId)
        .select(`
          *,
          users!families_created_by_fkey(first_name, last_name, email)
        `)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ family: data });
    } catch (error) {
      console.error('Error updating family:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
