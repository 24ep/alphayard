import { api } from './api';

export interface Content {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  status: 'draft' | 'published' | 'archived';
  priority: number;
  is_pinned: boolean;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  content_types?: {
    name: string;
    description: string;
  };
  categories?: {
    name: string;
    color: string;
  };
  content_meta?: Array<{
    meta_key: string;
    meta_value: string;
  }>;
  content_tags?: Array<{
    tag: string;
  }>;
  content_interactions?: Array<{
    interaction_type: string;
    user_id: string;
  }>;
  content_comments?: Array<{
    id: string;
    comment: string;
    created_at: string;
    users: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  }>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
}

export interface ContentInteraction {
  liked: boolean;
  views: number;
  shares: number;
  comments: number;
}

export class CMSService {
  // Content Management
  async getContent(circleId: string, params?: {
    contentTypeId?: string;
    categoryId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Content[]> {
    try {
      const response = await api.get(`/cms/families/${circleId}/content`, { params });
      return response.data.content;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  async getContentById(contentId: string): Promise<Content> {
    try {
      const response = await api.get(`/cms/content/${contentId}`);
      return response.data.content;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  async createContent(circleId: string, contentData: {
    content_type_id: string;
    category_id?: string;
    title: string;
    content?: string;
    excerpt?: string;
    featured_image_url?: string;
    status?: 'draft' | 'published' | 'archived';
    priority?: number;
    is_pinned?: boolean;
    is_featured?: boolean;
    published_at?: string;
    meta?: Record<string, string>;
    tags?: string[];
  }): Promise<Content> {
    try {
      const response = await api.post(`/cms/families/${circleId}/content`, contentData);
      return response.data.content;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  async updateContent(contentId: string, contentData: {
    content_type_id?: string;
    category_id?: string;
    title?: string;
    content?: string;
    excerpt?: string;
    featured_image_url?: string;
    status?: 'draft' | 'published' | 'archived';
    priority?: number;
    is_pinned?: boolean;
    is_featured?: boolean;
    published_at?: string;
    meta?: Record<string, string>;
    tags?: string[];
  }): Promise<Content> {
    try {
      const response = await api.put(`/cms/content/${contentId}`, contentData);
      return response.data.content;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  async deleteContent(contentId: string): Promise<void> {
    try {
      await api.delete(`/cms/content/${contentId}`);
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }

  // Content Interactions
  async likeContent(contentId: string): Promise<{ liked: boolean }> {
    try {
      const response = await api.post(`/cms/content/${contentId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking content:', error);
      throw error;
    }
  }

  async viewContent(contentId: string): Promise<void> {
    try {
      await api.post(`/cms/content/${contentId}/view`);
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  }

  async shareContent(contentId: string, platform: string, url?: string): Promise<void> {
    try {
      await api.post(`/cms/content/${contentId}/share`, { platform, url });
    } catch (error) {
      console.error('Error sharing content:', error);
      throw error;
    }
  }

  // Comments
  async getComments(contentId: string): Promise<Content['content_comments']> {
    try {
      const response = await api.get(`/cms/content/${contentId}/comments`);
      return response.data.comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async createComment(contentId: string, comment: string, parentId?: string): Promise<Content['content_comments'][0]> {
    try {
      const response = await api.post(`/cms/content/${contentId}/comments`, { comment, parentId });
      return response.data.comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // Categories
  async getCategories(circleId: string): Promise<Category[]> {
    try {
      const response = await api.get(`/cms/families/${circleId}/categories`);
      return response.data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async createCategory(circleId: string, categoryData: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    parent_id?: string;
    sort_order?: number;
  }): Promise<Category> {
    try {
      const response = await api.post(`/cms/families/${circleId}/categories`, categoryData);
      return response.data.category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Analytics
  async getContentAnalytics(circleId: string, dateFrom?: string, dateTo?: string): Promise<any[]> {
    try {
      const response = await api.get(`/cms/families/${circleId}/analytics/content`, {
        params: { dateFrom, dateTo }
      });
      return response.data.analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async getPopularContent(circleId: string, limit: number = 10): Promise<Content[]> {
    try {
      const response = await api.get(`/cms/families/${circleId}/content/popular`, {
        params: { limit }
      });
      return response.data.content;
    } catch (error) {
      console.error('Error fetching popular content:', error);
      throw error;
    }
  }

  // Helper methods
  // Note: UI should provide icon components; service returns type only
  getContentTypeIcon(type: string): string {
    return type || 'unknown'
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'yellow';
      case 'archived': return 'gray';
      default: return 'gray';
    }
  }

  getPriorityColor(priority: number): string {
    if (priority >= 8) return 'red';
    if (priority >= 5) return 'orange';
    if (priority >= 2) return 'blue';
    return 'green';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export const cmsService = new CMSService();

