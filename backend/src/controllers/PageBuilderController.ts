import { Response } from 'express';
import { pool } from '../config/database';

/**
 * Page Builder Controller
 * REFACTORED: Using direct PostgreSQL pool instead of Supabase client
 */
export class PageBuilderController {
  // ==================== PAGE CRUD OPERATIONS ====================

  /**
   * Get all pages with optional filtering
   */
  async getPages(req: any, res: Response) {
    try {
      const query = req.query;

      // Build SQL query with optional filters
      let sql = `
        SELECT p.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', pc.id,
                     'component_type', pc.component_type,
                     'position', pc.position,
                     'props', pc.props,
                     'styles', pc.styles,
                     'responsive_config', pc.responsive_config
                   ) ORDER BY pc.position
                 ) FILTER (WHERE pc.id IS NOT NULL), '[]'
               ) as page_components
        FROM pages p
        LEFT JOIN page_components pc ON p.id = pc.page_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      // Apply filters
      if (query.status) {
        sql += ` AND p.status = $${paramIndex++}`;
        params.push(query.status);
      }
      if (query.parentId) {
        sql += ` AND p.parent_id = $${paramIndex++}`;
        params.push(query.parentId);
      }
      if (query.templateId) {
        sql += ` AND p.template_id = $${paramIndex++}`;
        params.push(query.templateId);
      }
      if (query.search) {
        sql += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
        params.push(`%${query.search}%`);
        paramIndex++;
      }
      if (query.createdBy) {
        sql += ` AND p.created_by = $${paramIndex++}`;
        params.push(query.createdBy);
      }

      // Group by page
      sql += ` GROUP BY p.id`;

      // Apply sorting
      const sortBy = String(query.sortBy || 'updated_at');
      const sortOrder = String(query.sortOrder || 'desc').toUpperCase();
      const validSortColumns = ['title', 'slug', 'status', 'created_at', 'updated_at', 'published_at'];
      const validSortOrders = ['ASC', 'DESC'];
      
      if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
        sql += ` ORDER BY p.${sortBy} ${sortOrder}`;
      } else {
        sql += ` ORDER BY p.updated_at DESC`;
      }

      // Apply pagination
      const limit = Math.min(parseInt(String(query.limit || 50), 10), 100);
      const offset = parseInt(String(query.offset || 0), 10);
      sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);

      const { rows: pages } = await pool.query(sql, params);

      res.json({ pages });
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      res.status(400).json({ 
        error: 'Failed to fetch pages',
        message: error.message || String(error)
      });
    }
  }

  /**
   * Get a single page by ID with all components
   */
  async getPageById(req: any, res: Response) {
    try {
      const { id } = req.params;

      const sql = `
        SELECT p.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', pc.id,
                     'component_type', pc.component_type,
                     'position', pc.position,
                     'props', pc.props,
                     'styles', pc.styles,
                     'responsive_config', pc.responsive_config,
                     'created_at', pc.created_at,
                     'updated_at', pc.updated_at
                   ) ORDER BY pc.position
                 ) FILTER (WHERE pc.id IS NOT NULL), '[]'
               ) as page_components
        FROM pages p
        LEFT JOIN page_components pc ON p.id = pc.page_id
        WHERE p.id = $1
        GROUP BY p.id
      `;

      const { rows } = await pool.query(sql, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json({ page: rows[0] });
    } catch (error) {
      console.error('Error fetching page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get a published page by slug (for public rendering)
   */
  async getPageBySlug(req: any, res: Response) {
    try {
      const { slug } = req.params;

      const sql = `
        SELECT p.*, 
               COALESCE(json_agg(pc.* ORDER BY pc.position) FILTER (WHERE pc.id IS NOT NULL), '[]') as page_components
        FROM pages p
        LEFT JOIN page_components pc ON p.id = pc.page_id
        WHERE p.slug = $1 AND p.status = 'published'
        GROUP BY p.id
      `;

      const { rows } = await pool.query(sql, [slug]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json({ page: rows[0] });
    } catch (error: any) {
      console.error('Error fetching page by slug:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message || String(error) });
    }
  }

  /**
   * Create a new page
   */
  async createPage(req: any, res: Response) {
    const client = await pool.connect();
    try {
      const { title, slug, description, parentId, templateId, metadata, seoConfig, components } = req.body;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!title || !slug) {
        return res.status(400).json({ error: 'Title and slug are required' });
      }

      // Sanitize slug
      const sanitizedSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      await client.query('BEGIN');

      // Check if slug already exists for published pages
      const { rows: existingPages } = await client.query(
        "SELECT id FROM pages WHERE slug = $1 AND status = 'published' LIMIT 1",
        [sanitizedSlug]
      );

      if (existingPages.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'A published page with this URL already exists' });
      }

      // Create page
      const { rows: pageRows } = await client.query(
        `INSERT INTO pages (title, slug, description, parent_id, template_id, status, metadata, seo_config, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8, $9)
         RETURNING *`,
        [title, sanitizedSlug, description || null, parentId || null, templateId || null, metadata || {}, seoConfig || {}, userId, userId]
      );

      const page = pageRows[0];

      // Add components if provided
      if (components && Array.isArray(components) && components.length > 0) {
        for (let i = 0; i < components.length; i++) {
          const comp = components[i];
          await client.query(
            `INSERT INTO page_components (page_id, component_type, position, props, styles, responsive_config)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [page.id, comp.componentType, comp.position !== undefined ? comp.position : i, comp.props || {}, comp.styles || {}, comp.responsiveConfig || {}]
          );
        }
      }

      await client.query('COMMIT');

      // Fetch complete page with components
      const { rows: completePageRows } = await pool.query(
        `SELECT p.*, 
                COALESCE(json_agg(pc.* ORDER BY pc.position) FILTER (WHERE pc.id IS NOT NULL), '[]') as page_components
         FROM pages p
         LEFT JOIN page_components pc ON p.id = pc.page_id
         WHERE p.id = $1
         GROUP BY p.id`,
        [page.id]
      );

      res.status(201).json({ page: completePageRows[0] });
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('Error creating page:', error);
      res.status(400).json({ error: error.message || 'Failed to create page' });
    } finally {
      client.release();
    }
  }

  /**
   * Update an existing page
   */
  async updatePage(req: any, res: Response) {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const { title, slug, description, parentId, templateId, status, metadata, seoConfig, scheduledFor, expiresAt, components } = req.body;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await client.query('BEGIN');

      // Build dynamic update
      const updates: string[] = ['updated_by = $1', 'updated_at = NOW()'];
      const params: any[] = [userId];
      let paramIndex = 2;

      if (title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        params.push(title);
      }
      if (slug !== undefined) {
        const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        updates.push(`slug = $${paramIndex++}`);
        params.push(sanitizedSlug);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        params.push(description);
      }
      if (parentId !== undefined) {
        updates.push(`parent_id = $${paramIndex++}`);
        params.push(parentId);
      }
      if (templateId !== undefined) {
        updates.push(`template_id = $${paramIndex++}`);
        params.push(templateId);
      }
      if (status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        params.push(status);
      }
      if (metadata !== undefined) {
        updates.push(`metadata = $${paramIndex++}`);
        params.push(metadata);
      }
      if (seoConfig !== undefined) {
        updates.push(`seo_config = $${paramIndex++}`);
        params.push(seoConfig);
      }
      if (scheduledFor !== undefined) {
        updates.push(`scheduled_for = $${paramIndex++}`);
        params.push(scheduledFor);
      }
      if (expiresAt !== undefined) {
        updates.push(`expires_at = $${paramIndex++}`);
        params.push(expiresAt);
      }

      params.push(id);

      const { rows: pageRows } = await client.query(
        `UPDATE pages SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        params
      );

      if (pageRows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Page not found' });
      }

      // Update components if provided
      if (components && Array.isArray(components)) {
        // Delete existing components
        await client.query('DELETE FROM page_components WHERE page_id = $1', [id]);

        // Insert new components
        for (let i = 0; i < components.length; i++) {
          const comp = components[i];
          await client.query(
            `INSERT INTO page_components (page_id, component_type, position, props, styles, responsive_config)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, comp.componentType, comp.position !== undefined ? comp.position : i, comp.props || {}, comp.styles || {}, comp.responsiveConfig || {}]
          );
        }
      }

      await client.query('COMMIT');

      // Fetch complete page with components
      const { rows: completePageRows } = await pool.query(
        `SELECT p.*, 
                COALESCE(json_agg(pc.* ORDER BY pc.position) FILTER (WHERE pc.id IS NOT NULL), '[]') as page_components
         FROM pages p
         LEFT JOIN page_components pc ON p.id = pc.page_id
         WHERE p.id = $1
         GROUP BY p.id`,
        [id]
      );

      res.json({ page: completePageRows[0] });
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('Error updating page:', error);
      res.status(400).json({ error: error.message || 'Failed to update page' });
    } finally {
      client.release();
    }
  }

  /**
   * Delete a page
   */
  async deletePage(req: any, res: Response) {
    try {
      const { id } = req.params;

      // Check if page has children
      const { rows: children } = await pool.query(
        'SELECT id FROM pages WHERE parent_id = $1',
        [id]
      );

      if (children.length > 0) {
        return res.status(400).json({
          error: 'Cannot delete page with child pages',
          childCount: children.length
        });
      }

      const { rowCount } = await pool.query('DELETE FROM pages WHERE id = $1', [id]);

      if (rowCount === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json({ message: 'Page deleted successfully' });
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Duplicate a page
   */
  async duplicatePage(req: any, res: Response) {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const { newSlug } = req.body;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!newSlug) {
        return res.status(400).json({ error: 'New slug is required' });
      }

      await client.query('BEGIN');

      // Get source page
      const { rows: sourcePages } = await client.query('SELECT * FROM pages WHERE id = $1', [id]);
      if (sourcePages.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Source page not found' });
      }

      const source = sourcePages[0];

      // Create duplicate page
      const { rows: newPages } = await client.query(
        `INSERT INTO pages (title, slug, description, parent_id, template_id, status, metadata, seo_config, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8, $9)
         RETURNING *`,
        [`${source.title} (Copy)`, newSlug, source.description, source.parent_id, source.template_id, source.metadata, source.seo_config, userId, userId]
      );

      const newPage = newPages[0];

      // Copy components
      const { rows: sourceComponents } = await client.query(
        'SELECT * FROM page_components WHERE page_id = $1 ORDER BY position',
        [id]
      );

      for (const comp of sourceComponents) {
        await client.query(
          `INSERT INTO page_components (page_id, component_type, position, props, styles, responsive_config)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [newPage.id, comp.component_type, comp.position, comp.props, comp.styles, comp.responsive_config]
        );
      }

      await client.query('COMMIT');

      // Fetch complete duplicated page
      const { rows: completePageRows } = await pool.query(
        `SELECT p.*, 
                COALESCE(json_agg(pc.* ORDER BY pc.position) FILTER (WHERE pc.id IS NOT NULL), '[]') as page_components
         FROM pages p
         LEFT JOIN page_components pc ON p.id = pc.page_id
         WHERE p.id = $1
         GROUP BY p.id`,
        [newPage.id]
      );

      res.status(201).json({ page: completePageRows[0] });
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('Error duplicating page:', error);
      res.status(400).json({ error: error.message || 'Failed to duplicate page' });
    } finally {
      client.release();
    }
  }

  /**
   * Preview a page
   */
  async previewPage(req: any, res: Response) {
    try {
      const { id } = req.params;

      const { rows } = await pool.query(
        `SELECT p.*, 
                COALESCE(json_agg(pc.* ORDER BY pc.position) FILTER (WHERE pc.id IS NOT NULL), '[]') as page_components
         FROM pages p
         LEFT JOIN page_components pc ON p.id = pc.page_id
         WHERE p.id = $1
         GROUP BY p.id`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json({ page: rows[0] });
    } catch (error) {
      console.error('Error previewing page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ==================== PUBLISHING OPERATIONS ====================

  /**
   * Publish a page
   */
  async publishPage(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { rows } = await pool.query(
        `UPDATE pages SET status = 'published', published_at = NOW(), updated_by = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [userId, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json({ page: rows[0], message: 'Page published successfully' });
    } catch (error) {
      console.error('Error publishing page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Unpublish a page
   */
  async unpublishPage(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { rows } = await pool.query(
        `UPDATE pages SET status = 'draft', updated_by = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [userId, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json({ page: rows[0], message: 'Page unpublished successfully' });
    } catch (error) {
      console.error('Error unpublishing page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Schedule a page for publication
   */
  async schedulePage(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { scheduledFor, expiresAt } = req.body;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!scheduledFor) {
        return res.status(400).json({ error: 'Scheduled date is required' });
      }

      const { rows } = await pool.query(
        `UPDATE pages SET status = 'scheduled', scheduled_for = $1, expires_at = $2, updated_by = $3, updated_at = NOW()
         WHERE id = $4 RETURNING *`,
        [scheduledFor, expiresAt || null, userId, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json({ page: rows[0], message: 'Page scheduled successfully' });
    } catch (error) {
      console.error('Error scheduling page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Process scheduled pages (to be called by cron job)
   */
  async processScheduledPages(req: any, res: Response) {
    try {
      // Auto-publish scheduled pages
      const { rowCount: publishCount } = await pool.query(
        `UPDATE pages SET status = 'published', published_at = NOW()
         WHERE status = 'scheduled' AND scheduled_for <= NOW()`
      );

      // Auto-unpublish expired pages
      const { rowCount: unpublishCount } = await pool.query(
        `UPDATE pages SET status = 'expired'
         WHERE status = 'published' AND expires_at IS NOT NULL AND expires_at <= NOW()`
      );

      res.json({
        message: 'Scheduled pages processed',
        published: publishCount || 0,
        unpublished: unpublishCount || 0
      });
    } catch (error) {
      console.error('Error processing scheduled pages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
