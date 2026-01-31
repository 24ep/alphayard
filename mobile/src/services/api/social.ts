import { api } from './index';
import { SocialPost, CreateSocialPostRequest, UpdateSocialPostRequest, SocialPostInteraction } from '../../types/home';

export interface SocialPostFilters {
  circleId?: string;
  authorId?: string;
  search?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
  following?: boolean;
}

// ... (keep CreateSocialPostRequest)

// ... (keep UpdateSocialPostRequest)

// ... (keep SocialPostInteraction)

export const socialApi = {
  // Get social posts
  getPosts: async (filters?: SocialPostFilters): Promise<{ success: boolean; posts: SocialPost[] }> => {
    const params = new URLSearchParams();
    if (filters?.circleId) params.append('circleId', filters.circleId);
    if (filters?.authorId) params.append('authorId', filters.authorId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.following) params.append('following', 'true');

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
  addComment: async (postId: string, content: string, media?: { type: string; url: string }, parentId?: string): Promise<{ success: boolean; comment: any }> => {
    const response = await api.post(`/social/posts/${postId}/comments`, {
      content,
      media,
      parent_id: parentId
    });
    return { success: response.success, comment: response.data };
  },

  // Get trending tags
  getTrendingTags: async (circleId?: string): Promise<{ success: boolean; tags: string[] }> => {
    const params = circleId ? `?circleId=${circleId}` : '';
    const response = await api.get(`/social/trending-tags${params}`);
    return response.data;
  },

  // Report post
  reportPost: async (reportData: { post_id: string; reason: string; description?: string }): Promise<{ success: boolean; report: any }> => {
    const response = await api.post('/social/reports', reportData);
    return { success: response.success, report: response.data };
  }
};

