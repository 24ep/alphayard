import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { socialMediaService } from '../services/socialMediaService';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken as any);

// =============================================
// FAMILIES
// =============================================

/**
 * GET /api/social-media/families
 * Get all families for the authenticated user
 */
router.get('/families', async (req: any, res: any) => {
  try {
    const families = await socialMediaService.getFamilies();
    res.json({ success: true, data: families });
  } catch (error) {
    console.error('Error fetching families:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// =============================================
// SOCIAL POSTS
// =============================================

/**
 * GET /api/social-media/posts
 * Query params:
 * - familyId: string (optional, 'all' for all families)
 * - status: string (optional, 'all' for all statuses)
 * - type: string (optional, 'all' for all types)
 * - reported: boolean (optional)
 * - search: string (optional)
 * - limit: number (optional, default 50)
 * - offset: number (optional, default 0)
 */
router.get('/posts', async (req: any, res: any) => {
  try {
    const {
      familyId,
      status,
      type,
      reported,
      search,
      limit,
      offset
    } = req.query;

    const filters = {
      status: status as string,
      type: type as string,
      reported: reported === 'true' ? true : reported === 'false' ? false : undefined,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    };

    const posts = await socialMediaService.getPosts(familyId as string, filters);
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/social-media/posts/:id
 * Get a specific post by ID
 */
router.get('/posts/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const post = await socialMediaService.getPostById(id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/social-media/posts
 * Create a new post
 */
router.post('/posts', async (req: any, res: any) => {
  try {
    const postData = {
      ...req.body,
      author_id: req.user.id
    };

    const post = await socialMediaService.createPost(postData);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PUT /api/social-media/posts/:id
 * Update a post
 */
router.put('/posts/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const post = await socialMediaService.updatePost(id, req.body);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/social-media/posts/:id
 * Delete a post
 */
router.delete('/posts/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await socialMediaService.deletePost(id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// =============================================
// SOCIAL COMMENTS
// =============================================

/**
 * GET /api/social-media/posts/:postId/comments
 * Get comments for a specific post
 */
router.get('/posts/:postId/comments', async (req: any, res: any) => {
  try {
    const { postId } = req.params;
    const comments = await socialMediaService.getComments(postId);
    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/social-media/posts/:postId/comments
 * Create a new comment
 */
router.post('/posts/:postId/comments', async (req: any, res: any) => {
  try {
    const { postId } = req.params;
    const commentData = {
      post_id: postId,
      author_id: req.user.id,
      content: req.body.content
    };

    const comment = await socialMediaService.createComment(commentData);
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/social-media/comments/:id
 * Delete a comment
 */
router.delete('/comments/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await socialMediaService.deleteComment(id);
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// =============================================
// SOCIAL REPORTS
// =============================================

/**
 * GET /api/social-media/reports
 * Get all reports (optionally filtered by postId)
 */
router.get('/reports', async (req: any, res: any) => {
  try {
    const { postId } = req.query;
    const reports = await socialMediaService.getReports(postId as string);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/social-media/reports
 * Create a new report
 */
router.post('/reports', async (req: any, res: any) => {
  try {
    const reportData = {
      ...req.body,
      reporter_id: req.user.id
    };

    const report = await socialMediaService.createReport(reportData);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PUT /api/social-media/reports/:id/status
 * Update report status
 */
router.put('/reports/:id/status', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const report = await socialMediaService.updateReportStatus(id, status, req.user.id);
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// =============================================
// SOCIAL ACTIVITIES
// =============================================

/**
 * GET /api/social-media/posts/:postId/activities
 * Get activities for a specific post
 */
router.get('/posts/:postId/activities', async (req: any, res: any) => {
  try {
    const { postId } = req.params;
    const activities = await socialMediaService.getActivities(postId);
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/social-media/posts/:postId/activities
 * Create a new activity
 */
router.post('/posts/:postId/activities', async (req: any, res: any) => {
  try {
    const { postId } = req.params;
    const activityData = {
      post_id: postId,
      user_id: req.user.id,
      action: req.body.action,
      details: req.body.details
    };

    const activity = await socialMediaService.createActivity(activityData);
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// =============================================
// LIKES
// =============================================

/**
 * POST /api/social-media/posts/:postId/like
 * Like a post
 */
router.post('/posts/:postId/like', async (req: any, res: any) => {
  try {
    const { postId } = req.params;
    await socialMediaService.likePost(postId, req.user.id);
    res.json({ success: true, message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/social-media/posts/:postId/like
 * Unlike a post
 */
router.delete('/posts/:postId/like', async (req: any, res: any) => {
  try {
    const { postId } = req.params;
    await socialMediaService.unlikePost(postId, req.user.id);
    res.json({ success: true, message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/social-media/comments/:commentId/like
 * Like a comment
 */
router.post('/comments/:commentId/like', async (req: any, res: any) => {
  try {
    const { commentId } = req.params;
    await socialMediaService.likeComment(commentId, req.user.id);
    res.json({ success: true, message: 'Comment liked successfully' });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/social-media/comments/:commentId/like
 * Unlike a comment
 */
router.delete('/comments/:commentId/like', async (req: any, res: any) => {
  try {
    const { commentId } = req.params;
    await socialMediaService.unlikeComment(commentId, req.user.id);
    res.json({ success: true, message: 'Comment unliked successfully' });
  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// =============================================
// ANALYTICS
// =============================================

/**
 * GET /api/social-media/posts/:postId/analytics
 * Get analytics for a specific post
 */
router.get('/posts/:postId/analytics', async (req: any, res: any) => {
  try {
    const { postId } = req.params;
    const analytics = await socialMediaService.getPostAnalytics(postId);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/social-media/families/:familyId/analytics
 * Get analytics for a family
 */
router.get('/families/:familyId/analytics', async (req: any, res: any) => {
  try {
    const { familyId } = req.params;
    const analytics = await socialMediaService.getFamilyAnalytics(familyId);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching family analytics:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
