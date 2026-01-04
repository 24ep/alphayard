import { api } from './index';
import { SocialPost } from '../../types/home';

export interface SocialPostFilters {
  familyId?: string;
  authorId?: string;
  search?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface CreateSocialPostRequest {
  content: string;
  familyId: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  media_urls?: string[]; // Backend expects this
  location?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
}

export interface UpdateSocialPostRequest {
  content?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  location?: string;
  tags?: string[];
}

export interface SocialPostInteraction {
  postId: string;
  type: 'like' | 'comment' | 'share';
  userId: string;
  data?: any;
}

export const socialApi = {
  // Get social posts
  getPosts: async (filters?: SocialPostFilters): Promise<{ success: boolean; posts: SocialPost[] }> => {
    const params = new URLSearchParams();
    if (filters?.familyId) params.append('familyId', filters.familyId);
    if (filters?.authorId) params.append('authorId', filters.authorId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await api.get(`/social/posts?${params.toString()}`);
    // apiClient.get already unwraps axios response.data, so response is { success, data: posts }
    return { success: response.success, posts: response.data || [] };
  },

  // Get post by ID
  getPostById: async (postId: string): Promise<{ success: boolean; post: SocialPost }> => {
    const response = await api.get(`/social/posts/${postId}`);
    // apiClient.get already unwraps axios response.data
    return { success: response.success, post: response.data };
  },

  // Create social post
  createPost: async (postData: CreateSocialPostRequest): Promise<{ success: boolean; post: SocialPost }> => {
    const response = await api.post('/social/posts', postData);
    // apiClient.post already unwraps axios response.data
    return { success: response.success, post: response.data };
  },

  // Update social post
  updatePost: async (postId: string, postData: UpdateSocialPostRequest): Promise<{ success: boolean; post: SocialPost }> => {
    const response = await api.put(`/social/posts/${postId}`, postData);
    // apiClient.put already unwraps axios response.data
    return { success: response.success, post: response.data };
  },

  // Delete social post
  deletePost: async (postId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/social/posts/${postId}`);
    return response.data;
  },

  // Interact with post (deprecated - use specific methods)
  interactWithPost: async (interaction: SocialPostInteraction): Promise<{ success: boolean; message: string }> => {
    // Legacy support or remove
    return { success: false, message: 'Use specific methods' };
  },

  // Like post
  likePost: async (postId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/social/posts/${postId}/like`);
    return response.data;
  },

  // Unlike post
  unlikePost: async (postId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/social/posts/${postId}/like`);
    return response.data;
  },

  // Like comment
  likeComment: async (commentId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/social/comments/${commentId}/like`);
    return response.data;
  },

  // Unlike comment
  unlikeComment: async (commentId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/social/comments/${commentId}/like`);
    return response.data;
  },

  // Get post comments
  getPostComments: async (postId: string): Promise<{ success: boolean; comments: any[] }> => {
    const response = await api.get(`/social/posts/${postId}/comments`);
    return { success: response.success, comments: response.data };
  },

  // Add comment to post
  addComment: async (postId: string, content: string, media?: { type: string; url: string }): Promise<{ success: boolean; comment: any }> => {
    const response = await api.post(`/social/posts/${postId}/comments`, {
      content,
      media
    });
    return { success: response.success, comment: response.data };
  },

  // Get trending tags
  getTrendingTags: async (familyId?: string): Promise<{ success: boolean; tags: string[] }> => {
    const params = familyId ? `?familyId=${familyId}` : '';
    const response = await api.get(`/social/trending-tags${params}`);
    return response.data;
  }
};
