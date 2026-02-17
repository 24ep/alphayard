import { Platform } from 'react-native';
import { socialApi } from '../api/social';
import { CircleStatusFilters, CircleStatusUpdate, CircleLocationUpdate } from '../api/circleStatus';
export type { CircleStatusFilters, CircleStatusUpdate, CircleLocationUpdate };
import { storageApi } from '../api/storage';
import { SocialPost, CreateSocialPostRequest, UpdateSocialPostRequest, SocialPostInteraction } from '../../types/home';
import { unwrapEntity } from '../collectionService';
export type { SocialPost, CreateSocialPostRequest, UpdateSocialPostRequest, SocialPostInteraction };

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

class SocialService {

  async getPosts(filters?: SocialPostFilters): Promise<SocialPost[]> {
    try {
      const response = await socialApi.getPosts(filters);
      return (response.posts || []).map(this.mapBackendPostToFrontend);
    } catch (error) {
      console.error('Error fetching social posts:', error);
      return [];
    }
  }

  async getPostById(postId: string): Promise<SocialPost | null> {
    try {
      const response = await socialApi.getPostById(postId);
      return response.post ? this.mapBackendPostToFrontend(response.post) : null;
    } catch (error) {
      console.error('Error fetching social post:', error);
      return null;
    }
  }

  async createPost(postData: CreateSocialPostRequest): Promise<SocialPost> {
    try {
      let mediaUrls: string[] = [];

      // Handle media upload if present
      if (postData.media && postData.media.url) {
        // Check if it's a local file (starts with file:// or just absolute path)
        // We assume it needs upload if it's not a remote URL
        if (!postData.media.url.startsWith('http')) {
          try {
            console.log('Uploading media file:', postData.media.url);

            const filename = postData.media.url.split('/').pop() || 'upload';
            const fileType = postData.media.type === 'video' ? 'video/mp4' : 'image/jpeg';

            let fileToUpload: any;

            // Platform-specific file handling
            if (Platform.OS === 'web') {
              // Web: Fetch blob from blob: URL and create File object
              const response = await fetch(postData.media.url);
              const blob = await response.blob();
              fileToUpload = new File([blob], filename, { type: fileType });
            } else {
              // Native: React Native fetch/FormData expects { uri, name, type }
              fileToUpload = {
                uri: postData.media.url,
                name: filename,
                type: fileType
              };
            }

            const uploadResult = await storageApi.uploadFile({
              file: fileToUpload,
              isPublic: true,
              description: 'Social post media'
            });

            if (uploadResult.success && uploadResult.file) {
              // Use proxy URL instead of direct MinIO URL to bypass CORS issues
              const fileId = (uploadResult.file as any).id;
              const baseUrl = (typeof window !== 'undefined' && window.location)
                ? `${window.location.protocol}//${window.location.hostname}:4000`
                : 'http://localhost:4000';
              const proxyUrl = fileId
                ? `${baseUrl}/api/v1/storage/proxy/${fileId}`
                : (uploadResult.file as any).url || uploadResult.file.filePath;
              mediaUrls.push(proxyUrl);
              console.log('Media uploaded successfully, using proxy URL:', proxyUrl);
            }
          } catch (uploadError) {
            console.error('Failed to upload media:', uploadError);
            // Fallback: Try to proceed? Or fail? 
            // If upload fails, the post will lack the image. 
            // Ideally we should throw, but for robustness maybe we just log.
            // Throwing is better to let user retry.
            throw new Error('Failed to upload media attachment');
          }
        } else {
          mediaUrls.push(postData.media.url);
        }
      }

      // Construct API payload matching backend expectation
      const apiPayload = {
        ...postData,
        media_urls: mediaUrls,
        // Backend expects 'type' field
        type: postData.media ? postData.media.type : 'text'
      };

      const response = await socialApi.createPost(apiPayload);
      return this.mapBackendPostToFrontend(response.post);
    } catch (error) {
      console.error('Error creating social post:', error);
      throw error;
    }
  }

  private mapBackendPostToFrontend(post: any): SocialPost {
    // Handle Unified Entity structure
    const unwrapped = unwrapEntity(post);
    const mediaUrls = Array.isArray(unwrapped.media_urls)
      ? unwrapped.media_urls
      : Array.isArray(unwrapped.mediaUrls)
        ? unwrapped.mediaUrls
        : [];
    const likesCount = unwrapped.likesCount ?? unwrapped.like_count ?? unwrapped.likes_count ?? 0;
    const commentsCount = unwrapped.commentsCount ?? unwrapped.comments_count ?? 0;
    const sharesCount = unwrapped.sharesCount ?? unwrapped.shares_count ?? 0;
    const firstName = unwrapped.firstName ?? unwrapped.author?.first_name ?? 'User';
    const lastName = unwrapped.lastName ?? unwrapped.author?.last_name ?? '';
    const authorName = unwrapped.author_name ?? ([firstName, lastName].filter(Boolean).join(' ') || 'User');

    const mappedPost: any = {
      id: unwrapped.id,
      circleId: unwrapped.applicationId,
      authorId: unwrapped.ownerId,
      content: unwrapped.content ?? '',
      type: unwrapped.type || 'text',
      mediaUrls,
      likesCount,
      commentsCount,
      likes: likesCount,
      comments: commentsCount,
      shares: sharesCount,
      createdAt: unwrapped.createdAt ?? unwrapped.created_at,
      created_at: unwrapped.created_at ?? unwrapped.createdAt,
      updatedAt: unwrapped.updatedAt,
      isLiked: !!(unwrapped.isLiked || unwrapped.is_liked),
      author: unwrapped.author
        ? { ...unwrapped.author, name: unwrapped.author.name ?? authorName }
        : {
            id: unwrapped.ownerId,
            firstName,
            lastName,
            name: authorName
          }
    };

    // Ensure media object exists if mediaUrls is present
    if (!mappedPost.media && mediaUrls.length > 0) {
      mappedPost.media = {
        type: mappedPost.type === 'video' ? 'video' : 'image',
        url: mediaUrls[0]
      };
    }

    return mappedPost;
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

  async likePost(postId: string): Promise<void> {
    try {
      await socialApi.likePost(postId);
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unlikePost(postId: string): Promise<void> {
    try {
      await socialApi.unlikePost(postId);
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  async likeComment(commentId: string): Promise<void> {
    try {
      await socialApi.likeComment(commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }

  async unlikeComment(commentId: string): Promise<void> {
    try {
      await socialApi.unlikeComment(commentId);
    } catch (error) {
      console.error('Error unliking comment:', error);
      throw error;
    }
  }

  private mapBackendCommentToFrontend(comment: any): any {
    const unwrapped = unwrapEntity(comment);
    const firstName = unwrapped.firstName ?? unwrapped.author?.first_name ?? 'User';
    const lastName = unwrapped.lastName ?? unwrapped.author?.last_name ?? '';
    return {
      id: unwrapped.id,
      content: unwrapped.content ?? '',
      author: {
        first_name: firstName,
        last_name: lastName,
        avatar_url: unwrapped.author?.avatar_url ?? unwrapped.avatar_url
      },
      created_at: unwrapped.created_at ?? unwrapped.createdAt,
      parent_id: unwrapped.parent_id ?? unwrapped.parentId,
      likes_count: unwrapped.likes_count ?? unwrapped.likesCount ?? 0,
      is_liked: !!(unwrapped.is_liked ?? unwrapped.isLiked),
      media: unwrapped.media
    };
  }

  // interactWithPost deprecated/removed in favor of specific methods

  async getPostComments(postId: string): Promise<any[]> {
    try {
      const response = await socialApi.getPostComments(postId);
      const raw = response.comments || response.data || [];
      const list = Array.isArray(raw) ? raw : [];
      return list.map((c: any) => this.mapBackendCommentToFrontend(c));
    } catch (error) {
      console.error('Error fetching post comments:', error);
      return [];
    }
  }

  async addComment(postId: string, content: string, media?: { type: string; url: string }, parentId?: string): Promise<any> {
    try {
      const response = await socialApi.addComment(postId, content, media, parentId);
      return response.comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getTrendingTags(circleId?: string): Promise<string[]> {
    try {
      const response = await socialApi.getTrendingTags(circleId);
      return response.tags || [];
    } catch (error) {
      console.error('Error fetching trending tags:', error);
      return [];
    }
  }

  async reportPost(postId: string, reason: string, description?: string): Promise<any> {
    try {
      const response = await socialApi.reportPost({
        post_id: postId,
        reason,
        description
      });
      return response.report;
    } catch (error) {
      console.error('Error reporting post:', error);
      throw error;
    }
  }
}

export const socialService = new SocialService();

