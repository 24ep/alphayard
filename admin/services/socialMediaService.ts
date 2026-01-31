import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:4000/api';

export interface Circle {
  id: string;
  name: string;
  description?: string;
  member_count: number;
}

export interface SocialPost {
  id: string;
  Circle_id: string;
  author_id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'event';
  media_urls?: string[];
  tags?: string[];
  location?: string;
  visibility: 'public' | 'Circle' | 'friends';
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
  Circle?: {
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

export interface PostFilters {
  CircleId?: string;
  status?: string;
  type?: string;
  reported?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PostAnalytics {
  likes: number;
  shares: number;
  comments: number;
  views: number;
  engagement_rate: number;
}

export interface CircleAnalytics {
  total_posts: number;
  active_posts: number;
  reported_posts: number;
  total_engagement: number;
}

export const socialMediaService = {
  // =============================================
  // FAMILIES
  // =============================================

  async getFamilies(): Promise<Circle[]> {
    try {
      const response = await axios.get(`${API_BASE}/social-media/circles`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching families:', error);
      throw error;
    }
  },

  // =============================================
  // SOCIAL POSTS
  // =============================================

  async getPosts(filters?: PostFilters): Promise<SocialPost[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.CircleId) params.append('CircleId', filters.CircleId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.reported !== undefined) params.append('reported', filters.reported.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await axios.get(`${API_BASE}/social-media/posts?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  async getPostById(postId: string): Promise<SocialPost> {
    try {
      const response = await axios.get(`${API_BASE}/social-media/posts/${postId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  async createPost(postData: {
    Circle_id: string;
    content: string;
    type?: 'text' | 'image' | 'video' | 'event';
    media_urls?: string[];
    tags?: string[];
    location?: string;
    visibility?: 'public' | 'Circle' | 'friends';
  }): Promise<SocialPost> {
    try {
      const response = await axios.post(`${API_BASE}/social-media/posts`, postData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async updatePost(postId: string, updates: {
    content?: string;
    status?: 'active' | 'hidden' | 'deleted' | 'under_review';
    is_hidden?: boolean;
    is_deleted?: boolean;
  }): Promise<SocialPost> {
    try {
      const response = await axios.put(`${API_BASE}/social-media/posts/${postId}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  async deletePost(postId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE}/social-media/posts/${postId}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // =============================================
  // SOCIAL COMMENTS
  // =============================================

  async getComments(postId: string): Promise<SocialComment[]> {
    try {
      const response = await axios.get(`${API_BASE}/social-media/posts/${postId}/comments`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  async createComment(postId: string, content: string): Promise<SocialComment> {
    try {
      const response = await axios.post(`${API_BASE}/social-media/posts/${postId}/comments`, {
        content
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  async deleteComment(commentId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE}/social-media/comments/${commentId}`);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // =============================================
  // SOCIAL REPORTS
  // =============================================

  async getReports(postId?: string): Promise<SocialReport[]> {
    try {
      const params = postId ? `?postId=${postId}` : '';
      const response = await axios.get(`${API_BASE}/social-media/reports${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  async createReport(reportData: {
    post_id: string;
    reason: 'spam' | 'inappropriate' | 'harassment' | 'violence' | 'other';
    description?: string;
  }): Promise<SocialReport> {
    try {
      const response = await axios.post(`${API_BASE}/social-media/reports`, reportData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  async updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'): Promise<SocialReport> {
    try {
      const response = await axios.put(`${API_BASE}/social-media/reports/${reportId}/status`, {
        status
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  },

  // =============================================
  // SOCIAL ACTIVITIES
  // =============================================

  async getActivities(postId: string): Promise<SocialActivity[]> {
    try {
      const response = await axios.get(`${API_BASE}/social-media/posts/${postId}/activities`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },

  async createActivity(postId: string, action: 'like' | 'share' | 'comment' | 'view', details?: string): Promise<SocialActivity> {
    try {
      const response = await axios.post(`${API_BASE}/social-media/posts/${postId}/activities`, {
        action,
        details
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  // =============================================
  // LIKES
  // =============================================

  async likePost(postId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE}/social-media/posts/${postId}/like`);
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  async unlikePost(postId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE}/social-media/posts/${postId}/like`);
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  },

  async likeComment(commentId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE}/social-media/comments/${commentId}/like`);
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  },

  async unlikeComment(commentId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE}/social-media/comments/${commentId}/like`);
    } catch (error) {
      console.error('Error unliking comment:', error);
      throw error;
    }
  },

  // =============================================
  // ANALYTICS
  // =============================================

  async getPostAnalytics(postId: string): Promise<PostAnalytics> {
    try {
      const response = await axios.get(`${API_BASE}/social-media/posts/${postId}/analytics`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching post analytics:', error);
      throw error;
    }
  },

  async getCircleAnalytics(CircleId: string): Promise<CircleAnalytics> {
    try {
      const response = await axios.get(`${API_BASE}/social-media/circles/${CircleId}/analytics`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Circle analytics:', error);
      throw error;
    }
  }
};

