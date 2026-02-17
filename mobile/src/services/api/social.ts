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
  },

  // =============================================
  // STORIES
  // =============================================
  
  createStory: async (storyData: {
    content?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'text';
    backgroundColor?: string;
    textColor?: string;
    duration?: number;
    visibility?: 'public' | 'circle' | 'close_friends' | 'private';
    circleId?: string;
  }): Promise<{ success: boolean; story: any }> => {
    const response = await api.post('/social/stories', storyData);
    return response;
  },

  getStories: async (options?: { circleId?: string; limit?: number; offset?: number }): Promise<{ success: boolean; stories: any[] }> => {
    const params = new URLSearchParams();
    if (options?.circleId) params.append('circleId', options.circleId);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const response = await api.get(`/social/stories?${params.toString()}`);
    return response;
  },

  getStoriesByUser: async (userId: string): Promise<{ success: boolean; stories: any[] }> => {
    const response = await api.get(`/social/stories/user/${userId}`);
    return response;
  },

  viewStory: async (storyId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/social/stories/${storyId}/view`);
    return response;
  },

  reactToStory: async (storyId: string, reaction: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/social/stories/${storyId}/react`, { reaction });
    return response;
  },

  getStoryViewers: async (storyId: string): Promise<{ success: boolean; viewers: any[] }> => {
    const response = await api.get(`/social/stories/${storyId}/viewers`);
    return response;
  },

  deleteStory: async (storyId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/social/stories/${storyId}`);
    return response;
  },

  // Story Highlights
  getHighlights: async (userId: string): Promise<{ success: boolean; highlights: any[] }> => {
    const response = await api.get(`/social/highlights/${userId}`);
    return response;
  },

  createHighlight: async (data: { title: string; coverImage?: string }): Promise<{ success: boolean; highlight: any }> => {
    const response = await api.post('/social/highlights', data);
    return response;
  },

  // =============================================
  // FOLLOW/FRIEND SYSTEM
  // =============================================

  followUser: async (userId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/social/follow/${userId}`);
    return response;
  },

  unfollowUser: async (userId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/social/follow/${userId}`);
    return response;
  },

  getFollowStatus: async (userId: string): Promise<{ 
    success: boolean; 
    isFollowing: boolean; 
    isFollowedBy: boolean;
    isCloseFriend: boolean;
    isMuted: boolean;
    isBlocked: boolean;
  }> => {
    const response = await api.get(`/social/follow/status/${userId}`);
    return response;
  },

  getFollowers: async (userId: string, options?: { limit?: number; offset?: number }): Promise<{ success: boolean; followers: any[] }> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const response = await api.get(`/social/followers/${userId}?${params.toString()}`);
    return response;
  },

  getFollowing: async (userId: string, options?: { limit?: number; offset?: number }): Promise<{ success: boolean; following: any[] }> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const response = await api.get(`/social/following/${userId}?${params.toString()}`);
    return response;
  },

  getSuggestedUsers: async (limit?: number): Promise<{ success: boolean; users: any[] }> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`/social/suggested-users${params}`);
    return response;
  },

  setCloseFriend: async (userId: string, isCloseFriend: boolean): Promise<{ success: boolean }> => {
    const response = await api.post(`/social/close-friends/${userId}`, { isCloseFriend });
    return response;
  },

  getCloseFriends: async (): Promise<{ success: boolean; closeFriends: any[] }> => {
    const response = await api.get('/social/close-friends');
    return response;
  },

  blockUser: async (userId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/social/block/${userId}`);
    return response;
  },

  unblockUser: async (userId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/social/block/${userId}`);
    return response;
  },

  // Friend Requests
  sendFriendRequest: async (receiverId: string, message?: string): Promise<{ success: boolean; request: any }> => {
    const response = await api.post('/social/friend-requests', { receiverId, message });
    return response;
  },

  getPendingFriendRequests: async (): Promise<{ success: boolean; requests: any[] }> => {
    const response = await api.get('/social/friend-requests/received');
    return response;
  },

  getSentFriendRequests: async (): Promise<{ success: boolean; requests: any[] }> => {
    const response = await api.get('/social/friend-requests/sent');
    return response;
  },

  acceptFriendRequest: async (requestId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/social/friend-requests/${requestId}/accept`);
    return response;
  },

  rejectFriendRequest: async (requestId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/social/friend-requests/${requestId}/reject`);
    return response;
  },

  // =============================================
  // REACTIONS
  // =============================================

  reactToPost: async (postId: string, reaction: string): Promise<{ success: boolean; reaction: any }> => {
    const response = await api.post(`/social/posts/${postId}/react`, { reaction });
    return response;
  },

  removePostReaction: async (postId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/social/posts/${postId}/react`);
    return response;
  },

  getPostReactions: async (postId: string, reaction?: string): Promise<{ success: boolean; reactions: any[]; counts: any }> => {
    const params = reaction ? `?reaction=${reaction}` : '';
    const response = await api.get(`/social/posts/${postId}/reactions${params}`);
    return response;
  },

  reactToComment: async (commentId: string, reaction: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/social/comments/${commentId}/react`, { reaction });
    return response;
  },

  removeCommentReaction: async (commentId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/social/comments/${commentId}/react`);
    return response;
  },

  // =============================================
  // BOOKMARKS
  // =============================================

  bookmarkPost: async (postId: string, options?: { collectionName?: string; notes?: string }): Promise<{ success: boolean; bookmark: any }> => {
    const response = await api.post('/social/bookmarks', { postId, ...options });
    return response;
  },

  removeBookmark: async (postId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/social/bookmarks/${postId}`);
    return response;
  },

  getBookmarks: async (options?: { collectionName?: string; limit?: number; offset?: number }): Promise<{ success: boolean; bookmarks: any[] }> => {
    const params = new URLSearchParams();
    if (options?.collectionName) params.append('collectionName', options.collectionName);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const response = await api.get(`/social/bookmarks?${params.toString()}`);
    return response;
  },

  isPostBookmarked: async (postId: string): Promise<{ success: boolean; isBookmarked: boolean }> => {
    const response = await api.get(`/social/bookmarks/check/${postId}`);
    return response;
  },

  getBookmarkCollections: async (): Promise<{ success: boolean; collections: any[] }> => {
    const response = await api.get('/social/bookmark-collections');
    return response;
  },

  createBookmarkCollection: async (data: { name: string; description?: string; isPrivate?: boolean }): Promise<{ success: boolean; collection: any }> => {
    const response = await api.post('/social/bookmark-collections', data);
    return response;
  },

  // =============================================
  // POLLS
  // =============================================

  createPoll: async (data: {
    postId: string;
    question: string;
    options: string[];
    pollType?: 'single' | 'multiple';
    allowAddOptions?: boolean;
    isAnonymous?: boolean;
    endsAt?: string;
  }): Promise<{ success: boolean; poll: any }> => {
    const response = await api.post('/social/polls', data);
    return response;
  },

  getPollByPost: async (postId: string): Promise<{ success: boolean; poll: any }> => {
    const response = await api.get(`/social/polls/post/${postId}`);
    return response;
  },

  voteOnPoll: async (pollId: string, optionIds: string[]): Promise<{ success: boolean; poll: any }> => {
    const response = await api.post(`/social/polls/${pollId}/vote`, { optionIds });
    return response;
  },

  removeVote: async (pollId: string, optionId?: string): Promise<{ success: boolean; poll: any }> => {
    const params = optionId ? `?optionId=${optionId}` : '';
    const response = await api.delete(`/social/polls/${pollId}/vote${params}`);
    return response;
  },

  addPollOption: async (pollId: string, optionText: string): Promise<{ success: boolean; option: any }> => {
    const response = await api.post(`/social/polls/${pollId}/options`, { optionText });
    return response;
  },

  getPollVoters: async (pollId: string, optionId: string): Promise<{ success: boolean; voters: any[] }> => {
    const response = await api.get(`/social/polls/${pollId}/options/${optionId}/voters`);
    return response;
  },

  // =============================================
  // HASHTAGS
  // =============================================

  getTrendingHashtags: async (limit?: number): Promise<{ success: boolean; hashtags: any[] }> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`/social/hashtags/trending${params}`);
    return response;
  },

  searchHashtags: async (query: string, limit?: number): Promise<{ success: boolean; hashtags: any[] }> => {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', limit.toString());
    const response = await api.get(`/social/hashtags/search?${params.toString()}`);
    return response;
  },

  getHashtagPosts: async (tag: string, options?: { limit?: number; offset?: number }): Promise<{ success: boolean; posts: any[] }> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const response = await api.get(`/social/hashtags/${tag}/posts?${params.toString()}`);
    return response;
  },

  // =============================================
  // MENTIONS
  // =============================================

  getUnreadMentions: async (): Promise<{ success: boolean; mentions: any[]; unreadCount: number }> => {
    const response = await api.get('/social/mentions/unread');
    return response;
  },

  getAllMentions: async (options?: { limit?: number; offset?: number }): Promise<{ success: boolean; mentions: any[] }> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const response = await api.get(`/social/mentions?${params.toString()}`);
    return response;
  },

  markMentionAsRead: async (mentionId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/social/mentions/${mentionId}/read`);
    return response;
  },

  markAllMentionsAsRead: async (): Promise<{ success: boolean; markedCount: number }> => {
    const response = await api.post('/social/mentions/read-all');
    return response;
  }
};

