import { getSupabaseClient } from './supabaseService';

export interface SocialPost {
  id: string;
  family_id: string;
  author_id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'event';
  media_urls?: string[];
  tags?: string[];
  location?: string;
  visibility: 'public' | 'family' | 'friends';
  status: 'active' | 'hidden' | 'deleted' | 'under_review';
  likes_count: number;
  shares_count: number;
  comments_count: number;
  views_count: number;
  is_hidden: boolean;
  is_deleted: boolean;
  is_reported: boolean;
  report_count: number;
  last_reported_at?: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  family?: {
    id: string;
    name: string;
  };
}

export interface SocialComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  likes_count: number;
  is_hidden: boolean;
  is_reported: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface SocialReport {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'violence' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  reporter?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface SocialActivity {
  id: string;
  post_id: string;
  user_id: string;
  action: 'like' | 'share' | 'comment' | 'view';
  details?: string;
  created_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  member_count: number;
}

export class SocialMediaService {
  private get supabase() {
    return getSupabaseClient();
  }

  // =============================================
  // FAMILIES
  // =============================================

  async getFamilies(): Promise<Family[]> {
    try {
      const { data, error } = await this.supabase
        .from('families')
        .select(`
          id,
          name,
          description,
          member_count:family_members(count)
        `)
        .order('name');

      if (error) throw error;

      return data?.map(family => ({
        id: family.id,
        name: family.name,
        description: family.description,
        member_count: family.member_count?.[0]?.count || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching families:', error);
      throw error;
    }
  }

  // =============================================
  // SOCIAL POSTS
  // =============================================

  async getPosts(familyId?: string, filters?: {
    status?: string;
    type?: string;
    reported?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<SocialPost[]> {
    try {
      let query = this.supabase
        .from('social_posts')
        .select(`
          *,
          author:users!social_posts_author_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          family:families!social_posts_family_id_fkey(
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      // Filter by family
      if (familyId && familyId !== 'all') {
        query = query.eq('family_id', familyId);
      }

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters?.reported !== undefined) {
        query = query.eq('is_reported', filters.reported);
      }

      if (filters?.search) {
        query = query.or(`content.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
      }

      // Pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getPostById(postId: string): Promise<SocialPost | null> {
    try {
      const { data, error } = await this.supabase
        .from('social_posts')
        .select(`
          *,
          author:users!social_posts_author_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          family:families!social_posts_family_id_fkey(
            id,
            name
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  async createPost(postData: {
    family_id: string;
    author_id: string;
    content: string;
    type?: 'text' | 'image' | 'video' | 'event';
    media_urls?: string[];
    tags?: string[];
    location?: string;
    visibility?: 'public' | 'family' | 'friends';
  }): Promise<SocialPost> {
    try {
      const { data, error } = await this.supabase
        .from('social_posts')
        .insert([{
          family_id: postData.family_id,
          author_id: postData.author_id,
          content: postData.content,
          type: postData.type || 'text',
          media_urls: postData.media_urls || [],
          tags: postData.tags || [],
          location: postData.location,
          visibility: postData.visibility || 'family'
        }])
        .select(`
          *,
          author:users!social_posts_author_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          family:families!social_posts_family_id_fkey(
            id,
            name
          )
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(postId: string, updates: {
    content?: string;
    status?: 'active' | 'hidden' | 'deleted' | 'under_review';
    is_hidden?: boolean;
    is_deleted?: boolean;
  }): Promise<SocialPost> {
    try {
      const { data, error } = await this.supabase
        .from('social_posts')
        .update(updates)
        .eq('id', postId)
        .select(`
          *,
          author:users!social_posts_author_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          family:families!social_posts_family_id_fkey(
            id,
            name
          )
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // =============================================
  // SOCIAL COMMENTS
  // =============================================

  async getComments(postId: string): Promise<SocialComment[]> {
    try {
      const { data, error } = await this.supabase
        .from('social_comments')
        .select(`
          *,
          author:users!social_comments_author_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async createComment(commentData: {
    post_id: string;
    author_id: string;
    content: string;
  }): Promise<SocialComment> {
    try {
      const { data, error } = await this.supabase
        .from('social_comments')
        .insert([commentData])
        .select(`
          *,
          author:users!social_comments_author_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('social_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // =============================================
  // SOCIAL REPORTS
  // =============================================

  async getReports(postId?: string): Promise<SocialReport[]> {
    try {
      let query = this.supabase
        .from('social_reports')
        .select(`
          *,
          reporter:users!social_reports_reporter_id_fkey(
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (postId) {
        query = query.eq('post_id', postId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  async createReport(reportData: {
    post_id: string;
    reporter_id: string;
    reason: 'spam' | 'inappropriate' | 'harassment' | 'violence' | 'other';
    description?: string;
  }): Promise<SocialReport> {
    try {
      const { data, error } = await this.supabase
        .from('social_reports')
        .insert([reportData])
        .select(`
          *,
          reporter:users!social_reports_reporter_id_fkey(
            id,
            first_name,
            last_name
          )
        `)
        .single();

      if (error) throw error;

      // Update post report status
      await this.supabase
        .from('social_posts')
        .update({
          is_reported: true,
          report_count: (await this.supabase.from('social_posts').select('report_count').eq('id', reportData.post_id).single()).data?.report_count + 1 || 1,
          last_reported_at: new Date().toISOString()
        })
        .eq('id', reportData.post_id);

      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'resolved' | 'dismissed', reviewedBy?: string): Promise<SocialReport> {
    try {
      const { data, error } = await this.supabase
        .from('social_reports')
        .update({
          status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select(`
          *,
          reporter:users!social_reports_reporter_id_fkey(
            id,
            first_name,
            last_name
          )
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }

  // =============================================
  // SOCIAL ACTIVITIES
  // =============================================

  async getActivities(postId: string): Promise<SocialActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('social_activities')
        .select(`
          *,
          user:users!social_activities_user_id_fkey(
            id,
            first_name,
            last_name
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  async createActivity(activityData: {
    post_id: string;
    user_id: string;
    action: 'like' | 'share' | 'comment' | 'view';
    details?: string;
  }): Promise<SocialActivity> {
    try {
      const { data, error } = await this.supabase
        .from('social_activities')
        .insert([activityData])
        .select(`
          *,
          user:users!social_activities_user_id_fkey(
            id,
            first_name,
            last_name
          )
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // =============================================
  // LIKES
  // =============================================

  async likePost(postId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('social_post_likes')
        .insert([{ post_id: postId, user_id: userId }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('social_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  async likeComment(commentId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('social_comment_likes')
        .insert([{ comment_id: commentId, user_id: userId }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('social_comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unliking comment:', error);
      throw error;
    }
  }

  // =============================================
  // ANALYTICS
  // =============================================

  async getPostAnalytics(postId: string): Promise<{
    likes: number;
    shares: number;
    comments: number;
    views: number;
    engagement_rate: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('social_posts')
        .select('likes_count, shares_count, comments_count, views_count')
        .eq('id', postId)
        .single();

      if (error) throw error;

      const totalInteractions = data.likes_count + data.shares_count + data.comments_count;
      const engagementRate = data.views_count > 0 ? (totalInteractions / data.views_count) * 100 : 0;

      return {
        likes: data.likes_count,
        shares: data.shares_count,
        comments: data.comments_count,
        views: data.views_count,
        engagement_rate: Math.round(engagementRate * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching post analytics:', error);
      throw error;
    }
  }

  async getFamilyAnalytics(familyId: string): Promise<{
    total_posts: number;
    active_posts: number;
    reported_posts: number;
    total_engagement: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('social_posts')
        .select('status, is_reported, likes_count, shares_count, comments_count')
        .eq('family_id', familyId);

      if (error) throw error;

      const totalPosts = data.length;
      const activePosts = data.filter(post => post.status === 'active').length;
      const reportedPosts = data.filter(post => post.is_reported).length;
      const totalEngagement = data.reduce((sum, post) =>
        sum + post.likes_count + post.shares_count + post.comments_count, 0);

      return {
        total_posts: totalPosts,
        active_posts: activePosts,
        reported_posts: reportedPosts,
        total_engagement: totalEngagement
      };
    } catch (error) {
      console.error('Error fetching family analytics:', error);
      throw error;
    }
  }
}

export const socialMediaService = new SocialMediaService();
