
import { pool } from '../config/database';
import crypto from 'crypto';

export interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string;
  parentId?: string;
  templateId?: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  publishedAt?: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  metadata?: any;
  seoConfig?: any;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageComponent {
  id: string;
  pageId: string;
  componentType: string;
  position: number;
  props?: any;
  styles?: any;
  responsiveConfig?: any;
}

export class PageService {
  
  async getAllPages(options: { 
    limit?: number; 
    offset?: number; 
    status?: string; 
    search?: string 
  }) {
    const { limit = 20, offset = 0, status, search } = options;
    const params: any[] = [];
    let whereClauses = [];

    if (status) {
      params.push(status);
      whereClauses.push(`status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`(title ILIKE $${params.length} OR slug ILIKE $${params.length})`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT * FROM pages
      ${whereSql}
      ORDER BY updated_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const { rows } = await pool.query(sql, [...params, limit, offset]);
    
    // Get total count
    const countSql = `SELECT COUNT(*) FROM pages ${whereSql}`;
    const { rows: countRows } = await pool.query(countSql, params);
    
    return {
      pages: rows,
      total: parseInt(countRows[0].count),
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(parseInt(countRows[0].count) / limit)
    };
  }

  async getPageById(id: string) {
    // defined in 013_page_builder.sql
    const sql = `SELECT * FROM get_page_with_components($1)`;
    const { rows } = await pool.query(sql, [id]);
    
    if (rows.length === 0) return null;
    
    // The function returns { page_data, components_data }
    const { page_data, components_data } = rows[0];
    return {
      ...page_data,
      components: components_data
    };
  }

  async getPageBySlug(slug: string) {
    const sql = `
      SELECT p.*, 
             COALESCE(
               jsonb_agg(
                 jsonb_build_object(
                   'id', pc.id,
                   'componentType', pc.component_type,
                   'position', pc.position,
                   'props', pc.props,
                   'styles', pc.styles
                 ) ORDER BY pc.position
               ) FILTER (WHERE pc.id IS NOT NULL),
               '[]'::jsonb
             ) as components
      FROM pages p
      LEFT JOIN page_components pc ON p.id = pc.page_id
      WHERE p.slug = $1
      GROUP BY p.id
    `;
    const { rows } = await pool.query(sql, [slug]);
    return rows[0] || null;
  }

  async createPage(data: Partial<Page>, userId: string) {
    const sql = `
      INSERT INTO pages (
        title, slug, description, parent_id, template_id, 
        status, metadata, seo_config, created_by, updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
      RETURNING *
    `;
    
    const values = [
      data.title,
      data.slug,
      data.description,
      data.parentId,
      data.templateId,
      data.status || 'draft',
      JSON.stringify(data.metadata || {}),
      JSON.stringify(data.seoConfig || {}),
      userId
    ];

    const { rows } = await pool.query(sql, values);
    return rows[0];
  }

  async updatePage(id: string, data: Partial<Page>, userId: string) {
    const columns = [];
    const values = [];
    let paramIndex = 1;

    if (data.title) { columns.push(`title = $${paramIndex++}`); values.push(data.title); }
    if (data.slug) { columns.push(`slug = $${paramIndex++}`); values.push(data.slug); }
    if (data.description !== undefined) { columns.push(`description = $${paramIndex++}`); values.push(data.description); }
    if (data.parentId !== undefined) { columns.push(`parent_id = $${paramIndex++}`); values.push(data.parentId); }
    if (data.status) { columns.push(`status = $${paramIndex++}`); values.push(data.status); }
    if (data.metadata) { columns.push(`metadata = $${paramIndex++}`); values.push(JSON.stringify(data.metadata)); }
    if (data.seoConfig) { columns.push(`seo_config = $${paramIndex++}`); values.push(JSON.stringify(data.seoConfig)); }
    
    // Always update updated_by and updated_at
    columns.push(`updated_by = $${paramIndex++}`); values.push(userId);
    columns.push(`updated_at = NOW()`);

    if (columns.length === 0) return null;

    values.push(id);
    const sql = `
      UPDATE pages 
      SET ${columns.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const { rows } = await pool.query(sql, values);
    return rows[0];
  }

  async deletePage(id: string) {
    const sql = `DELETE FROM pages WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(sql, [id]);
    return rows[0];
  }

  async updatePageComponents(pageId: string, components: Partial<PageComponent>[]) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete existing components
      await client.query('DELETE FROM page_components WHERE page_id = $1', [pageId]);
      
      // Insert new components
      if (components.length > 0) {
        const values = components.map((c, index) => 
          `('${c.id || crypto.randomUUID()}', '${pageId}', '${c.componentType}', ${index}, '${JSON.stringify(c.props || {})}', '${JSON.stringify(c.styles || {})}')`
        ).join(',');
        
        await client.query(`
          INSERT INTO page_components (id, page_id, component_type, position, props, styles)
          VALUES ${values}
        `);
      }
      
      await client.query('COMMIT');
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async publishPage(id: string, userId: string) {
    const sql = `
      UPDATE pages
      SET status = 'published', published_at = NOW(), updated_by = $2
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(sql, [id, userId]);
    return rows[0];
  }
}
