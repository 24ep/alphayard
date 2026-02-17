import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../prisma/generated/prisma/client';

export class ComponentStudioController {
  /**
   * Get Component Studio Sidebar (Categories + Styles)
   */
  async getSidebar(req: any, res: Response) {
    try {
      const categories = await prisma.$queryRaw<any[]>`
        SELECT * FROM component_categories ORDER BY position ASC
      `;
      const styles = await prisma.$queryRaw<any[]>`
        SELECT * FROM component_styles WHERE is_active = true ORDER BY name ASC
      `;

      const sections = categories.map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        description: category.description,
        components: styles
          .filter(style => style.category_id === category.id)
          .map(style => ({
            id: style.id,
            name: style.name,
            definitionId: style.definition_id,
            styles: style.styles,
            config: style.config,
            mobileConfig: style.mobile_config,
            isSystem: style.is_system
          }))
      }));

      res.json({ sections });
    } catch (error: any) {
      console.error('Error fetching Component Studio sidebar:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Create a new component style variant
   */
  async createStyle(req: any, res: Response) {
    try {
      const { categoryId, definitionId, name, styles, config, mobileConfig } = req.body;

      if (!categoryId || !name) {
        return res.status(400).json({ error: 'Category ID and Name are required' });
      }

      const result = await prisma.$queryRaw<any[]>`
        INSERT INTO component_styles (category_id, definition_id, name, styles, config, mobile_config) 
        VALUES (
          ${categoryId}::uuid, 
          ${definitionId || null}::uuid, 
          ${name}, 
          ${JSON.stringify(styles || {})}::jsonb, 
          ${JSON.stringify(config || {})}::jsonb, 
          ${JSON.stringify(mobileConfig || {})}::jsonb
        ) 
        RETURNING *
      `;

      res.status(201).json({ style: result[0] });
    } catch (error: any) {
      console.error('Error creating component style:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Update an existing component style
   */
  async updateStyle(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { name, styles, config, mobileConfig, isActive } = req.body;

      const existing = await prisma.$queryRaw<any[]>`
        SELECT * FROM component_styles WHERE id = ${id}::uuid
      `;
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Component style not found' });
      }

      const result = await prisma.$queryRaw<any[]>`
        UPDATE component_styles 
        SET name = COALESCE(${name || null}, name),
            styles = COALESCE(${styles ? JSON.stringify(styles) : null}::jsonb, styles),
            config = COALESCE(${config ? JSON.stringify(config) : null}::jsonb, config),
            mobile_config = COALESCE(${mobileConfig ? JSON.stringify(mobileConfig) : null}::jsonb, mobile_config),
            is_active = COALESCE(${isActive ?? null}, is_active),
            updated_at = NOW()
        WHERE id = ${id}::uuid 
        RETURNING *
      `;

      res.json({ style: result[0] });
    } catch (error: any) {
      console.error('Error updating component style:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Duplicate a component style
   */
  async duplicateStyle(req: any, res: Response) {
    try {
      const { id } = req.params;

      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM component_styles WHERE id = ${id}::uuid
      `;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Component style not found' });
      }

      const source = rows[0];
      const result = await prisma.$queryRaw<any[]>`
        INSERT INTO component_styles (category_id, definition_id, name, styles, config, mobile_config) 
        VALUES (
          ${source.category_id}::uuid, 
          ${source.definition_id || null}::uuid, 
          ${`${source.name} (Copy)`}, 
          ${JSON.stringify(source.styles)}::jsonb, 
          ${JSON.stringify(source.config)}::jsonb, 
          ${JSON.stringify(source.mobile_config)}::jsonb
        ) 
        RETURNING *
      `;

      res.status(201).json({ style: result[0] });
    } catch (error: any) {
      console.error('Error duplicating component style:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Delete a component style
   */
  async deleteStyle(req: any, res: Response) {
    try {
      const { id } = req.params;

      const result = await prisma.$queryRaw<any[]>`
        DELETE FROM component_styles WHERE id = ${id}::uuid RETURNING id
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Component style not found' });
      }

      res.json({ message: 'Component style deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting component style:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}
