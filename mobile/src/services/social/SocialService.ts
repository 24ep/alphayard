import { socialApi } from '../api/social';
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
  location?: string;
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

class SocialService {

  async getPosts(filters?: SocialPostFilters): Promise<SocialPost[]> {
    try {
      const response = await socialApi.getPosts(filters);
      return response.posts || [];
    } catch (error) {
      console.error('Error fetching social posts:', error);
      return [];
    }
  }

  async getPostById(postId: string): Promise<SocialPost | null> {
    try {
      const response = await socialApi.getPostById(postId);
      return response.post;
    } catch (error) {
      console.error('Error fetching social post:', error);
      return null;
    }
  }

  async createPost(postData: CreateSocialPostRequest): Promise<SocialPost> {
    try {
      const response = await socialApi.createPost(postData);
      return response.post;
    } catch (error) {
      console.error('Error creating social post:', error);
      throw error;
    }
  }

  async updatePost(postId: string, postData: UpdateSocialPostRequest): Promise<SocialPost> {
    try {
      const response = await socialApi.updatePost(postId, postData);
      return response.post;
    } catch (error) {
      console.error('Error updating social post:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      await socialApi.deletePost(postId);
    } catch (error) {
      console.error('Error deleting social post:', error);
      throw error;
    }
  }

  async interactWithPost(interaction: SocialPostInteraction): Promise<void> {
    try {
      await socialApi.interactWithPost(interaction);
    } catch (error) {
      console.error('Error interacting with post:', error);
      throw error;
    }
  }

  async getPostComments(postId: string): Promise<any[]> {
    try {
      const response = await socialApi.getPostComments(postId);
      return response.comments || [];
    } catch (error) {
      console.error('Error fetching post comments:', error);
      return [];
    }
  }

  async addComment(postId: string, content: string, attachments?: any[]): Promise<any> {
    try {
      const response = await socialApi.addComment(postId, content, attachments);
      return response.comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getTrendingTags(familyId?: string): Promise<string[]> {
    try {
      const response = await socialApi.getTrendingTags(familyId);
      return response.tags || [];
    } catch (error) {
      console.error('Error fetching trending tags:', error);
      return [];
    }
  }
}

export const socialService = new SocialService();
