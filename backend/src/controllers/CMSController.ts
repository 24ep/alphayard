import { Response } from 'express';
import { pool } from '../config/database';
// import { CreateContentRequest, UpdateContentRequest } from '../models/Content';
// import { CreateCategoryRequest } from '../models/Category';


export class CMSController {
  // Marketing Content Management
  // Marketing Content Management
  async getMarketingContent(req: any, res: Response) {
    try {
      const query = req.query;
      const params: any[] = [];
      let whereClauses = [];

      if (query.contentTypeId) {
        params.push(query.contentTypeId);
        whereClauses.push(`content_type_id = $${params.length}`);
      }
      if (query.categoryId) {
        params.push(query.categoryId);
        whereClauses.push(`category_id = $${params.length}`);
      }
      if (query.status) {
        params.push(query.status);
        whereClauses.push(`status = $${params.length}`);
      }
      if (query.isPinned !== undefined) {
        params.push(query.isPinned === 'true');
        whereClauses.push(`is_pinned = $${params.length}`);
      }
      if (query.isFeatured !== undefined) {
        params.push(query.isFeatured === 'true');
        whereClauses.push(`is_featured = $${params.length}`);
      }
      if (query.search) {
        params.push(`%${query.search}%`);
        whereClauses.push(`(title ILIKE $${params.length} OR content ILIKE $${params.length})`);
      }
      if (query.authorId) {
        params.push(query.authorId);
        whereClauses.push(`created_by = $${params.length}`);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      
      const sortBy = String(query.sortBy || 'created_at').replace(/[^a-z0-9_]/g, '');
      const sortOrder = String(query.sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      const limit = parseInt(String(query.limit || 20), 10);
      const offset = parseInt(String(query.offset || 0), 10);

      const sql = `
        SELECT mc.*, 
               ct.name as content_type_name,
               cat.name as category_name,
               u.first_name, u.last_name
        FROM marketing_content mc
        LEFT JOIN content_types ct ON mc.content_type_id = ct.id
        LEFT JOIN categories cat ON mc.category_id = cat.id
        LEFT JOIN users u ON mc.created_by = u.id
        ${whereSql}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      const { rows } = await pool.query(sql, [...params, limit, offset]);

      res.json({ content: rows });
    } catch (error) {
      console.error('Error fetching marketing content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  async getMarketingContentById(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const sql = `
        SELECT mc.*, 
               ct.name as content_type_name,
               cat.name as category_name,
               u.first_name, u.last_name
        FROM marketing_content mc
        LEFT JOIN content_types ct ON mc.content_type_id = ct.id
        LEFT JOIN categories cat ON mc.category_id = cat.id
        LEFT JOIN users u ON mc.created_by = u.id
        WHERE mc.id = $1
      `;

      const { rows } = await pool.query(sql, [contentId]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Content not found' });
      }

      res.json({ content: rows[0] });
    } catch (error) {
      console.error('Error fetching marketing content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  async createMarketingContent(req: any, res: Response) {
    try {
      const contentData = req.body;
      const columns = Object.keys(contentData);
      const values = Object.values(contentData);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      
      const sql = `
        INSERT INTO marketing_content (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const { rows } = await pool.query(sql, values);
      res.status(201).json({ content: rows[0] });
    } catch (error: any) {
      console.error('Error creating marketing content:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }


  async updateMarketingContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const contentData = req.body;
      const columns = Object.keys(contentData);
      const values = Object.values(contentData);
      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

      const sql = `
        UPDATE marketing_content 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $${values.length + 1}
        RETURNING *
      `;

      const { rows } = await pool.query(sql, [...values, contentId]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Content not found' });
      }

      res.json({ content: rows[0] });
    } catch (error: any) {
      console.error('Error updating marketing content:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }


  async deleteMarketingContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const { rowCount } = await pool.query(
        'DELETE FROM marketing_content WHERE id = $1',
        [contentId]
      );

      if (rowCount === 0) {
        return res.status(404).json({ error: 'Content not found' });
      }

      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Error deleting marketing content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  async getMarketingSlides(req: any, res: Response) {
    try {
      const sql = `
        SELECT mc.* 
        FROM marketing_content mc
        JOIN content_types ct ON mc.content_type_id = ct.id
        WHERE ct.name = 'marketing_slide'
        AND mc.status = 'published'
        ORDER BY mc.priority ASC
      `;

      const { rows: data } = await pool.query(sql);

      // Parse the JSON content field for each slide
      const slides = data.map((slide: any) => ({
        ...slide,
        slideData: typeof slide.content === 'string' ? JSON.parse(slide.content) : slide.content
      }));

      res.json({ slides });
    } catch (error) {
      console.error('Error fetching marketing slides:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  // Content Management
  async getContent(req: any, res: Response) {
    try {
      const { circleId } = req.params;
      const query = req.query;
      const params: any[] = [circleId];
      let whereClauses = ['family_id = $1'];


      if (query.contentTypeId) {
        params.push(query.contentTypeId);
        whereClauses.push(`content_type_id = $${params.length}`);
      }
      if (query.categoryId) {
        params.push(query.categoryId);
        whereClauses.push(`category_id = $${params.length}`);
      }
      if (query.status) {
        params.push(query.status);
        whereClauses.push(`status = $${params.length}`);
      }
      if (query.isPinned !== undefined) {
        params.push(query.isPinned === 'true');
        whereClauses.push(`is_pinned = $${params.length}`);
      }
      if (query.isFeatured !== undefined) {
        params.push(query.isFeatured === 'true');
        whereClauses.push(`is_featured = $${params.length}`);
      }
      if (query.search) {
        params.push(`%${query.search}%`);
        whereClauses.push(`(title ILIKE $${params.length} OR content ILIKE $${params.length})`);
      }
      if (query.authorId) {
        params.push(query.authorId);
        whereClauses.push(`created_by = $${params.length}`);
      }
      if (query.dateFrom) {
        params.push(new Date(String(query.dateFrom)));
        whereClauses.push(`created_at >= $${params.length}`);
      }
      if (query.dateTo) {
        params.push(new Date(String(query.dateTo)));
        whereClauses.push(`created_at <= $${params.length}`);
      }

      const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
      
      const sortBy = String(query.sortBy || 'created_at').replace(/[^a-z0-9_]/g, '');
      const sortOrder = String(query.sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      const limit = parseInt(String(query.limit || 20), 10);
      const offset = parseInt(String(query.offset || 0), 10);

      const sql = `
        SELECT c.*, 
               ct.name as content_type_name,
               cat.name as category_name,
               u.first_name, u.last_name
        FROM content c
        LEFT JOIN content_types ct ON c.content_type_id = ct.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN users u ON c.created_by = u.id
        ${whereSql}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      const { rows } = await pool.query(sql, [...params, limit, offset]);

      res.json({ content: rows });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  async getContentById(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const sql = `
        SELECT c.*, 
               ct.name as content_type_name,
               cat.name as category_name,
               u.first_name, u.last_name
        FROM content c
        LEFT JOIN content_types ct ON c.content_type_id = ct.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.id = $1
      `;

      const { rows } = await pool.query(sql, [contentId]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Content not found' });
      }

      res.json({ content: rows[0] });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  async createContent(req: any, res: Response) {
    try {
      const contentData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate slug from title
      const slug = contentData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const sql = `
        INSERT INTO content (
          family_id, content_type_id, category_id, title, slug, 
          content, excerpt, featured_image_url, status, priority, 
          is_pinned, is_featured, published_at, created_by, updated_by
        )

        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;

      const values = [
        contentData.circleId || contentData.familyId,
        contentData.contentTypeId,
        contentData.categoryId,
        contentData.title,
        slug,
        contentData.content,
        contentData.excerpt,
        contentData.featuredImageUrl,
        contentData.status || 'draft',
        contentData.priority || 0,
        contentData.isPinned || false,
        contentData.isFeatured || false,
        contentData.publishedAt ? new Date(contentData.publishedAt) : null,
        userId,
        userId
      ];

      const { rows } = await pool.query(sql, values);
      const data = rows[0];

      // Add meta data if provided
      if (contentData.meta) {
        for (const [key, value] of Object.entries(contentData.meta)) {
          await pool.query(
            'INSERT INTO content_meta (content_id, meta_key, meta_value) VALUES ($1, $2, $3)',
            [data.id, key, String(value)]
          );
        }
      }

      // Add tags if provided
      if (contentData.tags && Array.isArray(contentData.tags)) {
        for (const tag of contentData.tags) {
          await pool.query(
            'INSERT INTO content_tags (content_id, tag) VALUES ($1, $2)',
            [data.id, tag]
          );
        }
      }

      res.status(201).json({ content: data });
    } catch (error) {
      console.error('Error creating content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const updateData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const sql = `
        UPDATE content SET
          content_type_id = $1,
          category_id = $2,
          title = $3,
          content = $4,
          excerpt = $5,
          featured_image_url = $6,
          status = $7,
          priority = $8,
          is_pinned = $9,
          is_featured = $10,
          published_at = $11,
          updated_by = $12,
          updated_at = NOW()
        WHERE id = $13
        RETURNING *
      `;

      const values = [
        updateData.contentTypeId,
        updateData.categoryId,
        updateData.title,
        updateData.content,
        updateData.excerpt,
        updateData.featuredImageUrl,
        updateData.status,
        updateData.priority,
        updateData.isPinned,
        updateData.isFeatured,
        updateData.publishedAt ? new Date(updateData.publishedAt) : null,
        userId,
        contentId
      ];

      const { rows } = await pool.query(sql, values);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Content not found' });
      }

      const data = rows[0];

      // Update meta data if provided
      if (updateData.meta) {
        await pool.query('DELETE FROM content_meta WHERE content_id = $1', [contentId]);
        for (const [key, value] of Object.entries(updateData.meta)) {
          await pool.query(
            'INSERT INTO content_meta (content_id, meta_key, meta_value) VALUES ($1, $2, $3)',
            [contentId, key, String(value)]
          );
        }
      }

      // Update tags if provided
      if (updateData.tags && Array.isArray(updateData.tags)) {
        await pool.query('DELETE FROM content_tags WHERE content_id = $1', [contentId]);
        for (const tag of updateData.tags) {
          await pool.query(
            'INSERT INTO content_tags (content_id, tag) VALUES ($1, $2)',
            [contentId, tag]
          );
        }
      }

      res.json({ content: data });
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  async deleteContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const { rowCount } = await pool.query(
        'DELETE FROM content WHERE id = $1',
        [contentId]
      );

      if (rowCount === 0) {
        return res.status(404).json({ error: 'Content not found' });
      }

      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  // Content Interactions
  async likeContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if already liked
      const { rows } = await pool.query(
        'SELECT id FROM content_interactions WHERE content_id = $1 AND user_id = $2 AND interaction_type = \'like\'',
        [contentId, userId]
      );

      if (rows.length > 0) {
        // Unlike
        await pool.query(
          'DELETE FROM content_interactions WHERE content_id = $1 AND user_id = $2 AND interaction_type = \'like\'',
          [contentId, userId]
        );
        res.json({ liked: false });
      } else {
        // Like
        await pool.query(
          'INSERT INTO content_interactions (content_id, user_id, interaction_type) VALUES ($1, $2, \'like\')',
          [contentId, userId]
        );
        res.json({ liked: true });
      }
    } catch (error) {
      console.error('Error liking content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  async viewContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Record view
      await pool.query(
        'INSERT INTO content_interactions (content_id, user_id, interaction_type) VALUES ($1, $2, \'view\')',
        [contentId, userId]
      );

      res.json({ message: 'View recorded' });
    } catch (error) {
      console.error('Error recording view:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async shareContent(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const { platform, url } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Record share
      await pool.query(
        'INSERT INTO content_interactions (content_id, user_id, interaction_type, metadata) VALUES ($1, $2, \'share\', $3)',
        [contentId, userId, JSON.stringify({ platform, url })]
      );

      res.json({ message: 'Share recorded' });
    } catch (error) {
      console.error('Error recording share:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  // Comments
  async getComments(req: any, res: Response) {
    try {
      const { contentId } = req.params;

      const sql = `
        SELECT cc.*, u.first_name, u.last_name, u.avatar_url
        FROM content_comments cc
        JOIN users u ON cc.user_id = u.id
        WHERE cc.content_id = $1 AND cc.is_approved = true
        ORDER BY cc.created_at ASC
      `;

      const { rows } = await pool.query(sql, [contentId]);
      res.json({ comments: rows });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  async createComment(req: any, res: Response) {
    try {
      const { contentId } = req.params;
      const { comment, parentId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const sql = `
        INSERT INTO content_comments (content_id, user_id, parent_id, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const { rows } = await pool.query(sql, [contentId, userId, parentId, comment]);
      res.status(201).json({ comment: rows[0] });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  // Categories
  async getCategories(req: any, res: Response) {
    try {
      const { circleId } = req.params;

      const { rows } = await pool.query(
        'SELECT * FROM categories WHERE family_id = $1 AND is_active = true ORDER BY sort_order ASC',
        [circleId]
      );

      res.json({ categories: rows });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  async createCategory(req: any, res: Response) {
    try {
      const categoryData = req.body;
      const columns = Object.keys(categoryData);
      const values = Object.values(categoryData);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const sql = `
        INSERT INTO categories (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const { rows } = await pool.query(sql, values);
      res.status(201).json({ category: rows[0] });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  // Analytics
  async getContentAnalytics(req: any, res: Response) {
    try {
      const { circleId } = req.params;
      const { dateFrom, dateTo } = req.query;
      const params: any[] = [circleId];
      let whereClauses = ['c.family_id = $1'];

      if (dateFrom) {
        params.push(dateFrom);
        whereClauses.push(`ca.date >= $${params.length}`);
      }
      if (dateTo) {
        params.push(dateTo);
        whereClauses.push(`ca.date <= $${params.length}`);
      }

      const sql = `
        SELECT ca.*, c.title
        FROM content_analytics ca
        JOIN content c ON ca.content_id = c.id
        WHERE ${whereClauses.join(' AND ')}
      `;

      const { rows } = await pool.query(sql, params);
      res.json({ analytics: rows });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  async getPopularContent(req: any, res: Response) {
    try {
      const { circleId } = req.params;
      const { limit = 10 } = req.query;

      const sql = `
        SELECT c.*, ct.name as content_type_name, cat.name as category_name
        FROM content c
        LEFT JOIN content_types ct ON c.content_type_id = ct.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        WHERE c.family_id = $1 AND c.status = 'published'
        ORDER BY c.priority DESC
        LIMIT $2
      `;

      const { rows } = await pool.query(sql, [circleId, Number(limit)]);
      res.json({ content: rows });
    } catch (error) {
      console.error('Error fetching popular content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

}

