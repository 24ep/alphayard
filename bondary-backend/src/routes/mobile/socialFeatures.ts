import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import {
  storiesService,
  followService,
  reactionsService,
  bookmarksService,
  PollsService,
  HashtagsService,
} from '../../services/social';

const router = Router();

// =============================================
// STORIES ROUTES
// =============================================

// Create a story
router.post('/stories', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { content, mediaUrl, mediaType, backgroundColor, textColor, fontStyle, duration, visibility, circleId } = req.body;
    
    const story = await storiesService.createStory({
      authorId: userId,
      circleId,
      content,
      mediaUrl,
      mediaType,
      backgroundColor,
      textColor,
      fontStyle,
      duration,
      visibility,
    });
    
    res.status(201).json({ success: true, story });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get stories feed
router.get('/stories', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { circleId, limit, offset } = req.query;
    
    const stories = await storiesService.getStories(userId, {
      circleId: circleId as string,
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0,
    });
    
    res.json({ success: true, stories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get stories by user
router.get('/stories/user/:userId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const viewerId = (req as any).user?.id;
    const { userId } = req.params;
    
    const stories = await storiesService.getStoriesByUser(userId, viewerId);
    res.json({ success: true, stories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// View a story
router.post('/stories/:storyId/view', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { storyId } = req.params;
    
    await storiesService.viewStory(storyId, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// React to a story
router.post('/stories/:storyId/react', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { storyId } = req.params;
    const { reaction } = req.body;
    
    await storiesService.reactToStory(storyId, userId, reaction);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get story viewers
router.get('/stories/:storyId/viewers', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;
    const { limit, offset } = req.query;
    
    const viewers = await storiesService.getStoryViewers(
      storyId,
      parseInt(limit as string) || 50,
      parseInt(offset as string) || 0
    );
    
    res.json({ success: true, viewers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a story
router.delete('/stories/:storyId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { storyId } = req.params;
    
    const deleted = await storiesService.deleteStory(storyId, userId);
    res.json({ success: true, deleted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Story Highlights
router.post('/highlights', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { title, coverImage } = req.body;
    
    const highlight = await storiesService.createHighlight(userId, title, coverImage);
    res.status(201).json({ success: true, highlight });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/highlights/:userId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const highlights = await storiesService.getHighlights(userId);
    res.json({ success: true, highlights });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// FOLLOW/FRIEND ROUTES
// =============================================

// Follow a user
router.post('/follow/:userId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user?.id;
    const { userId } = req.params;
    
    await followService.followUser(followerId, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Unfollow a user
router.delete('/follow/:userId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user?.id;
    const { userId } = req.params;
    
    const unfollowed = await followService.unfollowUser(followerId, userId);
    res.json({ success: true, unfollowed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get follow status
router.get('/follow/status/:userId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const { userId } = req.params;
    
    const status = await followService.getFollowStatus(currentUserId, userId);
    res.json({ success: true, ...status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get followers
router.get('/followers/:userId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const viewerId = (req as any).user?.id;
    const { userId } = req.params;
    const { limit, offset } = req.query;
    
    const followers = await followService.getFollowers(userId, {
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0,
      viewerId,
    });
    
    res.json({ success: true, followers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get following
router.get('/following/:userId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const viewerId = (req as any).user?.id;
    const { userId } = req.params;
    const { limit, offset } = req.query;
    
    const following = await followService.getFollowing(userId, {
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0,
      viewerId,
    });
    
    res.json({ success: true, following });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get suggested users
router.get('/suggested-users', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { limit } = req.query;
    
    const users = await followService.getSuggestedUsers(userId, parseInt(limit as string) || 20);
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Set close friend
router.post('/close-friends/:userId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const { userId } = req.params;
    const { isCloseFriend } = req.body;
    
    await followService.setCloseFriend(currentUserId, userId, isCloseFriend);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get close friends
router.get('/close-friends', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const closeFriends = await followService.getCloseFriends(userId);
    res.json({ success: true, closeFriends });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Block user
router.post('/block/:userId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const { userId } = req.params;
    
    await followService.blockUser(currentUserId, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unblock user
router.delete('/block/:userId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const { userId } = req.params;
    
    await followService.unblockUser(currentUserId, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Friend Requests
router.post('/friend-requests', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user?.id;
    const { receiverId, message } = req.body;
    
    const request = await followService.sendFriendRequest(senderId, receiverId, message);
    res.status(201).json({ success: true, request });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/friend-requests/received', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const requests = await followService.getPendingFriendRequests(userId);
    res.json({ success: true, requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/friend-requests/sent', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const requests = await followService.getSentFriendRequests(userId);
    res.json({ success: true, requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/friend-requests/:requestId/accept', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { requestId } = req.params;
    
    const accepted = await followService.acceptFriendRequest(requestId, userId);
    res.json({ success: true, accepted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/friend-requests/:requestId/reject', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { requestId } = req.params;
    
    const rejected = await followService.rejectFriendRequest(requestId, userId);
    res.json({ success: true, rejected });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// REACTIONS ROUTES
// =============================================

// React to a post
router.post('/posts/:postId/react', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { postId } = req.params;
    const { reaction } = req.body;
    
    const result = await reactionsService.reactToPost(postId, userId, reaction);
    res.json({ success: true, reaction: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove reaction from post
router.delete('/posts/:postId/react', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { postId } = req.params;
    
    const removed = await reactionsService.removePostReaction(postId, userId);
    res.json({ success: true, removed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get post reactions
router.get('/posts/:postId/reactions', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { reaction, limit, offset } = req.query;
    
    const reactions = await reactionsService.getPostReactions(postId, {
      reaction: reaction as any,
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0,
    });
    
    const counts = await reactionsService.getPostReactionCounts(postId);
    
    res.json({ success: true, reactions, counts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// React to a comment
router.post('/comments/:commentId/react', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { commentId } = req.params;
    const { reaction } = req.body;
    
    const result = await reactionsService.reactToComment(commentId, userId, reaction);
    res.json({ success: true, reaction: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove reaction from comment
router.delete('/comments/:commentId/react', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { commentId } = req.params;
    
    const removed = await reactionsService.removeCommentReaction(commentId, userId);
    res.json({ success: true, removed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// BOOKMARKS ROUTES
// =============================================

// Bookmark a post
router.post('/bookmarks', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { postId, collectionName, notes } = req.body;
    
    const bookmark = await bookmarksService.bookmarkPost(userId, postId, { collectionName, notes });
    res.status(201).json({ success: true, bookmark });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove bookmark
router.delete('/bookmarks/:postId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { postId } = req.params;
    
    const removed = await bookmarksService.removeBookmark(userId, postId);
    res.json({ success: true, removed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get bookmarks
router.get('/bookmarks', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { collectionName, limit, offset } = req.query;
    
    const bookmarks = await bookmarksService.getBookmarks(userId, {
      collectionName: collectionName as string,
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0,
    });
    
    res.json({ success: true, bookmarks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if bookmarked
router.get('/bookmarks/check/:postId', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { postId } = req.params;
    
    const isBookmarked = await bookmarksService.isBookmarked(userId, postId);
    res.json({ success: true, isBookmarked });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bookmark collections
router.post('/bookmark-collections', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { name, description, coverImage, isPrivate } = req.body;
    
    const collection = await bookmarksService.createCollection(userId, { name, description, coverImage, isPrivate });
    res.status(201).json({ success: true, collection });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bookmark-collections', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const collections = await bookmarksService.getCollections(userId);
    res.json({ success: true, collections });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// POLLS ROUTES - TEMPORARILY DISABLED
// =============================================

// TODO: Implement PollsService methods when database schema is ready

// Mock endpoint to prevent 404s
router.get('/polls', (req, res) => {
  res.json({ polls: [], message: 'Polls endpoint temporarily disabled' });
});

// =============================================
// HASHTAGS ROUTES - TEMPORARILY DISABLED
// =============================================

// TODO: Implement HashtagsService methods when database schema is ready

// Mock endpoint to prevent 404s
router.get('/hashtags', (req, res) => {
  res.json({ hashtags: [], message: 'Hashtags endpoint temporarily disabled' });
});

// =============================================
// MENTIONS ROUTES - TEMPORARILY DISABLED
// =============================================

// TODO: Implement HashtagsService methods when database schema is ready

// Mock endpoint to prevent 404s
router.get('/mentions', (req, res) => {
  res.json({ mentions: [], message: 'Mentions endpoint temporarily disabled' });
});

export default router;
