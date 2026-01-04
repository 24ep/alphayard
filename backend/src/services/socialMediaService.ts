import { query } from '../config/database';

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
  parent_id?: string;
  reply_count?: number;
  is_liked?: boolean;
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
  // Use direct DB query instead of Supabase client

  // =============================================
  // FAMILIES
  // =============================================

  async getFamilies(): Promise<Family[]> {
    try {
      const { rows } = await query(`
        SELECT f.id, f.name, f.description, 
               (SELECT count(*)::int FROM family_members WHERE family_id = f.id) as member_count
        FROM families f
        ORDER BY f.name
      `);

      return rows.map(family => ({
        id: family.id,
        name: family.name,
        description: family.description,
        member_count: family.member_count || 0
      }));
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
    // Location-based filtering
    latitude?: number;
    longitude?: number;
    distanceKm?: number;
    sortBy?: 'recent' | 'nearby' | 'popular';
    locationType?: 'hometown' | 'workplace' | 'school' | 'all';
  }): Promise<SocialPost[]> {
    try {
      // Use distance-based query if location params are provided
      const hasLocationFilter = filters?.latitude !== undefined &&
        filters?.longitude !== undefined &&
        filters?.distanceKm !== undefined;

      let sql: string;
      const values: any[] = [];
      let paramIdx = 1;

      if (hasLocationFilter) {
        // Distance-based query using ST_DistanceSphere
        sql = `
          SELECT sp.*,
                 u.id as author_id, u.email as author_email,
                 u.first_name as author_first_name, u.last_name as author_last_name, u.avatar_url as author_avatar,
                 f.id as family_id, f.name as family_name,
                 ST_DistanceSphere(
                   ST_MakePoint(sp.longitude::numeric, sp.latitude::numeric),
                   ST_MakePoint($1, $2)
                 ) / 1000 as distance_km
          FROM social_posts sp
          JOIN public.users u ON sp.author_id = u.id
          JOIN families f ON sp.family_id = f.id
          WHERE sp.latitude IS NOT NULL 
            AND sp.longitude IS NOT NULL
            AND sp.is_deleted = FALSE
            AND sp.is_hidden = FALSE
            AND ST_DistanceSphere(
                  ST_MakePoint(sp.longitude::numeric, sp.latitude::numeric),
                  ST_MakePoint($1, $2)
                ) <= $3
        `;
        values.push(filters!.longitude, filters!.latitude, filters!.distanceKm! * 1000);
        paramIdx = 4;
      } else {
        // Standard query
        sql = `
          SELECT sp.*,
                 u.id as author_id, u.email as author_email,
                 u.first_name as author_first_name, u.last_name as author_last_name, u.avatar_url as author_avatar,
                 f.id as family_id, f.name as family_name
          FROM social_posts sp
          JOIN public.users u ON sp.author_id = u.id
          JOIN families f ON sp.family_id = f.id
          WHERE sp.is_deleted = FALSE AND sp.is_hidden = FALSE
        `;
      }

      // Filter by family
      if (familyId && familyId !== 'all') {
        sql += ` AND sp.family_id = $${paramIdx++}`;
        values.push(familyId);
      }

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        sql += ` AND sp.status = $${paramIdx++}`;
        values.push(filters.status);
      }

      if (filters?.type && filters.type !== 'all') {
        sql += ` AND sp.type = $${paramIdx++}`;
        values.push(filters.type);
      }

      if (filters?.reported !== undefined) {
        sql += ` AND sp.is_reported = $${paramIdx++}`;
        values.push(filters.reported);
      }

      if (filters?.search) {
        sql += ` AND (sp.content ILIKE $${paramIdx} OR $${paramIdx} = ANY(sp.tags))`;
        values.push(`%${filters.search}%`);
        paramIdx++;
      }

      // Sorting
      if (hasLocationFilter && filters?.sortBy === 'nearby') {
        sql += ` ORDER BY distance_km ASC`;
      } else if (filters?.sortBy === 'popular') {
        sql += ` ORDER BY sp.likes_count DESC, sp.comments_count DESC`;
      } else {
        sql += ` ORDER BY sp.created_at DESC`;
      }

      // Pagination
      if (filters?.limit) {
        sql += ` LIMIT $${paramIdx++}`;
        values.push(filters.limit);
      }

      if (filters?.offset) {
        sql += ` OFFSET $${paramIdx++}`;
        values.push(filters.offset);
      }

      const { rows } = await query(sql, values);

      return rows.map(row => this.mapRowToPost(row));
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getPostById(postId: string): Promise<SocialPost | null> {
    try {
      const sql = `
        SELECT sp.*,
               u.id as author_id, u.email as author_email,
               u.first_name as author_first_name, u.last_name as author_last_name, u.avatar_url as author_avatar,
               f.id as family_id, f.name as family_name
        FROM social_posts sp
        LEFT JOIN public.users u ON sp.author_id = u.id
        JOIN families f ON sp.family_id = f.id
        WHERE sp.id = $1
      `;

      const { rows } = await query(sql, [postId]);

      if (rows.length === 0) return null;
      return this.mapRowToPost(rows[0]);
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
    latitude?: number;
    longitude?: number;
    visibility?: 'public' | 'family' | 'friends';
  }): Promise<SocialPost> {
    try {
      // Use RETURNING to get the ID, but we need full object, so allow query to finish then fetchById or map the returned row
      // Simple insert
      const sql = `
        INSERT INTO social_posts (
            family_id, author_id, content, type, media_urls, tags, location, latitude, longitude, visibility
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING id
      `;

      const values = [
        postData.family_id,
        postData.author_id,
        postData.content,
        postData.type || 'text',
        JSON.stringify(postData.media_urls || []), // JSONB column requires JSON string
        postData.tags || [],                        // text[] array column - pass directly
        postData.location || null,
        postData.latitude || null,
        postData.longitude || null,
        postData.visibility || 'family'
      ];

      const { rows } = await query(sql, values);
      const newId = rows[0].id;

      // Need to re-fetch to get joins or just return basic structure?
      // Better to re-fetch to return consistent structure with getPosts
      const newPost = await this.getPostById(newId);
      if (!newPost) {
        console.error(`Failed to retrieve created post: ${newId}. Author: ${postData.author_id}, Family: ${postData.family_id}`);
        throw new Error('Failed to retrieve created post');
      }
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  private mapRowToPost(row: any): SocialPost {
    // Helper to map DB row to SocialPost interface
    const firstName = row.author_first_name || 'Unknown';
    const lastName = row.author_last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    // Parse media_urls if it's a string (JSONB should auto-parse, but just in case)
    let mediaUrls = row.media_urls;
    if (typeof mediaUrls === 'string') {
      try {
        mediaUrls = JSON.parse(mediaUrls);
      } catch (e) {
        mediaUrls = [];
      }
    }

    // Create media object for frontend compatibility
    // Convert MinIO URLs to proxy URLs using the post's ID or extract file ID from URL
    let media = undefined;
    if (mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0) {
      const mediaUrl = mediaUrls[0];
      let displayUrl = mediaUrl;

      // If it's a MinIO URL, try to extract file ID and use proxy
      if (mediaUrl && (mediaUrl.includes('localhost:9000') || mediaUrl.includes('minio'))) {
        // Extract file ID from path: /bucket/uploads/userId/fileId or /uploads/userId/fileId
        // The path format is: /bondarys-files/uploads/userId/fileId?queryParams
        const pathMatch = mediaUrl.match(/\/uploads\/[^\/]+\/([^?\/]+)/);
        if (pathMatch && pathMatch[1]) {
          const fileId = pathMatch[1].replace(/\.[^.]+$/, ''); // Remove extension if present
          displayUrl = `http://localhost:4000/api/v1/storage/proxy/${fileId}`;
          console.log(`[mapRowToPost] Converted MinIO URL to proxy: ${displayUrl}`);
        } else {
          console.log(`[mapRowToPost] Could not extract fileId from: ${mediaUrl}`);
        }
      } else if (mediaUrl && mediaUrl.includes('/api/v1/storage/proxy/')) {
        // Already a proxy URL, keep it as is
        displayUrl = mediaUrl;
        console.log(`[mapRowToPost] Already proxy URL: ${displayUrl}`);
      }

      media = {
        type: row.type === 'video' ? 'video' : 'image',
        url: displayUrl
      };
    }

    return {
      id: row.id,
      family_id: row.family_id,
      author_id: row.author_id,
      content: row.content,
      type: row.type,
      media_urls: mediaUrls,
      media: media, // Add media object for frontend compatibility
      tags: row.tags,
      location: row.location,
      visibility: row.visibility,
      status: row.status,
      likes_count: row.likes_count,
      shares_count: row.shares_count,
      comments_count: row.comments_count,
      views_count: row.views_count,
      is_hidden: row.is_hidden,
      is_deleted: row.is_deleted,
      is_reported: row.is_reported,
      report_count: row.report_count,
      last_reported_at: row.last_reported_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Original author object for admin/backend use
      author: {
        id: row.author_id,
        first_name: firstName,
        last_name: lastName,
        avatar_url: row.author_avatar,
        // Mobile-compatible fields
        name: fullName,
        avatar: row.author_avatar || 'https://i.pravatar.cc/150',
        isVerified: false
      },
      family: {
        id: row.family_id,
        name: row.family_name
      },
      // Mobile-compatible field aliases
      likes: row.likes_count || 0,
      comments: row.comments_count || 0,
      shares: row.shares_count || 0,
      timestamp: row.created_at,
      isLiked: false // TODO: Check against user's likes
    } as any; // Cast to any to allow additional mobile fields
  }
  async updatePost(postId: string, updates: {
    content?: string;
    status?: 'active' | 'hidden' | 'deleted' | 'under_review';
    is_hidden?: boolean;
    is_deleted?: boolean;
  }): Promise<SocialPost> {
    try {
      const sets: string[] = [];
      const values: any[] = [postId];
      let paramIdx = 2;

      if (updates.content !== undefined) {
        sets.push(`content = $${paramIdx++}`);
        values.push(updates.content);
      }
      if (updates.status !== undefined) {
        sets.push(`status = $${paramIdx++}`);
        values.push(updates.status);
      }
      if (updates.is_hidden !== undefined) {
        sets.push(`is_hidden = $${paramIdx++}`);
        values.push(updates.is_hidden);
      }
      if (updates.is_deleted !== undefined) {
        sets.push(`is_deleted = $${paramIdx++}`);
        values.push(updates.is_deleted);
      }

      if (sets.length === 0) {
        const post = await this.getPostById(postId);
        if (!post) throw new Error('Post not found');
        return post;
      }

      await query(
        `UPDATE social_posts SET ${sets.join(', ')} WHERE id = $1`,
        values
      );

      const updatedPost = await this.getPostById(postId);
      if (!updatedPost) throw new Error('Post not found after update');
      return updatedPost;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      await query('DELETE FROM social_posts WHERE id = $1', [postId]);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // =============================================
  // SOCIAL COMMENTS
  // =============================================

  async getComments(postId: string, userId?: string): Promise<SocialComment[]> {
    try {
      const sql = `
        SELECT sc.*,
               u.id as author_id, u.email as author_email, u.raw_user_meta_data as author_meta,
               p.full_name as author_full_name, p.avatar_url as author_avatar,
               (SELECT count(*)::int FROM social_comments WHERE parent_id = sc.id) as reply_count,
               EXISTS(SELECT 1 FROM social_comment_likes scl WHERE scl.comment_id = sc.id AND scl.user_id = $2) as is_liked
        FROM social_comments sc
        JOIN auth.users u ON sc.author_id = u.id
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE sc.post_id = $1
        ORDER BY sc.created_at ASC
      `;

      const { rows } = await query(sql, [postId, userId || '00000000-0000-0000-0000-000000000000']);

      return rows.map(row => {
        const meta = row.author_meta || {};
        const profileName = row.author_full_name || '';
        const firstName = meta.firstName || profileName.split(' ')[0] || 'Unknown';
        const lastName = meta.lastName || profileName.split(' ').slice(1).join(' ') || '';

        return {
          id: row.id,
          post_id: row.post_id,
          author_id: row.author_id,
          content: row.content,
          likes_count: row.likes_count,
          is_hidden: row.is_hidden,
          is_reported: row.is_reported,
          created_at: row.created_at,
          updated_at: row.updated_at,
          media: row.media_url ? { type: row.media_type, url: row.media_url } : undefined,
          author: {
            id: row.author_id,
            first_name: firstName,
            last_name: lastName,
            avatar_url: row.author_avatar
          },
          parent_id: row.parent_id,
          reply_count: row.reply_count || 0,
          is_liked: row.is_liked || false
        };
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async createComment(commentData: {
    post_id: string;
    author_id: string;
    content: string;
    media?: { type: string; url: string };
    parentId?: string;
  }): Promise<SocialComment> {
    try {
      // Ensure schema supports parent_id (runtime migration check)
      await query(`
        ALTER TABLE social_comments 
        ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES social_comments(id) ON DELETE CASCADE
      `).catch(err => console.log('Schema update check failed (might already exist):', err.message));

      const sql = `
        INSERT INTO social_comments (post_id, author_id, content, media_type, media_url, parent_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const mediaType = commentData.media?.type || null;
      const mediaUrl = commentData.media?.url || null;

      const { rows } = await query(sql, [
        commentData.post_id,
        commentData.author_id,
        commentData.content,
        mediaType,
        mediaUrl,
        commentData.parentId || null
      ]);
      const createdId = rows[0].id;

      // Increment comment count on post
      await query('UPDATE social_posts SET comments_count = comments_count + 1 WHERE id = $1', [commentData.post_id]);

      // Fetch rich object to return
      const comments = await this.getComments(commentData.post_id, commentData.author_id);
      const newComment = comments.find(c => c.id === createdId);

      if (!newComment) throw new Error('Failed to retrieve created comment');
      return newComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      // Get post_id to decrement count
      const { rows } = await query('SELECT post_id FROM social_comments WHERE id = $1', [commentId]);
      if (rows.length > 0) {
        const postId = rows[0].post_id;
        await query('DELETE FROM social_comments WHERE id = $1', [commentId]);
        await query('UPDATE social_posts SET comments_count = comments_count - 1 WHERE id = $1', [postId]);
      }
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
      let sql = `
        SELECT sr.*,
               u.id as reporter_id, u.email as reporter_email, u.raw_user_meta_data as reporter_meta,
               p.full_name as reporter_full_name
        FROM social_reports sr
        JOIN auth.users u ON sr.reporter_id = u.id
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE 1=1
      `;
      const values: any[] = [];

      if (postId) {
        sql += ` AND sr.post_id = $1`;
        values.push(postId);
      }

      sql += ` ORDER BY sr.created_at DESC`;

      const { rows } = await query(sql, values);

      return rows.map(row => {
        const meta = row.reporter_meta || {};
        const profileName = row.reporter_full_name || '';
        const firstName = meta.firstName || profileName.split(' ')[0] || 'Unknown';
        const lastName = meta.lastName || profileName.split(' ').slice(1).join(' ') || '';

        return {
          id: row.id,
          post_id: row.post_id,
          reporter_id: row.reporter_id,
          reason: row.reason,
          description: row.description,
          status: row.status,
          reviewed_by: row.reviewed_by,
          reviewed_at: row.reviewed_at,
          created_at: row.created_at,
          updated_at: row.updated_at,
          reporter: {
            id: row.reporter_id,
            first_name: firstName,
            last_name: lastName
          }
        };
      });
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
      const sql = `
        INSERT INTO social_reports (post_id, reporter_id, reason, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const { rows } = await query(sql, [
        reportData.post_id, reportData.reporter_id, reportData.reason, reportData.description
      ]);

      // Update post report stats
      await query(`
        UPDATE social_posts 
        SET is_reported = true, 
            report_count = report_count + 1,
            last_reported_at = NOW()
        WHERE id = $1
      `, [reportData.post_id]);

      const reports = await this.getReports(); // Simplified for now, or fetch post specific reports and find one
      const newReport = reports.find(r => r.id === rows[0].id);

      if (!newReport) throw new Error('Failed to retrieve created report');
      return newReport;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'resolved' | 'dismissed', reviewedBy?: string): Promise<SocialReport> {
    try {
      await query(`
        UPDATE social_reports 
        SET status = $1, reviewed_by = $2, reviewed_at = NOW()
        WHERE id = $3
      `, [status, reviewedBy, reportId]);

      const sql = `
        SELECT sr.*,
               u.id as reporter_id, u.email as reporter_email, u.raw_user_meta_data as reporter_meta,
               p.full_name as reporter_full_name
        FROM social_reports sr
        JOIN auth.users u ON sr.reporter_id = u.id
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE sr.id = $1
      `;
      const { rows } = await query(sql, [reportId]);

      if (rows.length === 0) throw new Error('Report not found');

      const row = rows[0];
      const meta = row.reporter_meta || {};
      const profileName = row.reporter_full_name || '';
      const firstName = meta.firstName || profileName.split(' ')[0] || 'Unknown';
      const lastName = meta.lastName || profileName.split(' ').slice(1).join(' ') || '';

      return {
        id: row.id,
        post_id: row.post_id,
        reporter_id: row.reporter_id,
        reason: row.reason,
        description: row.description,
        status: row.status,
        reviewed_by: row.reviewed_by,
        reviewed_at: row.reviewed_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        reporter: {
          id: row.reporter_id,
          first_name: firstName,
          last_name: lastName
        }
      };
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
      const sql = `
        SELECT sa.*,
               u.id as user_id, u.email as user_email, u.raw_user_meta_data as user_meta,
               p.full_name as user_full_name
        FROM social_activities sa
        JOIN auth.users u ON sa.user_id = u.id
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE sa.post_id = $1
        ORDER BY sa.created_at DESC
      `;
      const { rows } = await query(sql, [postId]);

      return rows.map(row => {
        const meta = row.user_meta || {};
        const profileName = row.user_full_name || '';
        const firstName = meta.firstName || profileName.split(' ')[0] || 'Unknown';
        const lastName = meta.lastName || profileName.split(' ').slice(1).join(' ') || '';

        return {
          id: row.id,
          post_id: row.post_id,
          user_id: row.user_id,
          action: row.action,
          details: row.details,
          created_at: row.created_at,
          user: {
            id: row.user_id,
            first_name: firstName,
            last_name: lastName
          }
        };
      });
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
      const sql = `
        INSERT INTO social_activities (post_id, user_id, action, details)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const { rows } = await query(sql, [
        activityData.post_id, activityData.user_id, activityData.action, activityData.details
      ]);
      const createdId = rows[0].id;

      const activities = await this.getActivities(activityData.post_id);
      const newActivity = activities.find(a => a.id === createdId);

      if (!newActivity) throw new Error('Failed to retrieve created activity');
      return newActivity;
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
      await query('INSERT INTO social_post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [postId, userId]);
      await query('UPDATE social_posts SET likes_count = likes_count + 1 WHERE id = $1', [postId]);
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      const result = await query('DELETE FROM social_post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
      if (result.rowCount && result.rowCount > 0) {
        await query('UPDATE social_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1', [postId]);
      }
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  async likeComment(commentId: string, userId: string): Promise<void> {
    try {
      await query('INSERT INTO social_comment_likes (comment_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [commentId, userId]);
      await query('UPDATE social_comments SET likes_count = likes_count + 1 WHERE id = $1', [commentId]);
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    try {
      const result = await query('DELETE FROM social_comment_likes WHERE comment_id = $1 AND user_id = $2', [commentId, userId]);
      if (result.rowCount && result.rowCount > 0) {
        await query('UPDATE social_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1', [commentId]);
      }
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
      const { rows } = await query('SELECT likes_count, shares_count, comments_count, views_count FROM social_posts WHERE id = $1', [postId]);

      if (rows.length === 0) throw new Error('Post not found');
      const data = rows[0];

      const totalInteractions = parseInt(data.likes_count) + parseInt(data.shares_count) + parseInt(data.comments_count);
      const views = parseInt(data.views_count);
      const engagementRate = views > 0 ? (totalInteractions / views) * 100 : 0;

      return {
        likes: parseInt(data.likes_count),
        shares: parseInt(data.shares_count),
        comments: parseInt(data.comments_count),
        views: views,
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
      const { rows } = await query(
        'SELECT status, is_reported, likes_count, shares_count, comments_count FROM social_posts WHERE family_id = $1',
        [familyId]
      );

      const totalPosts = rows.length;
      const activePosts = rows.filter(post => post.status === 'active').length;
      const reportedPosts = rows.filter(post => post.is_reported).length;
      const totalEngagement = rows.reduce((sum, post) =>
        sum + parseInt(post.likes_count) + parseInt(post.shares_count) + parseInt(post.comments_count), 0);

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
