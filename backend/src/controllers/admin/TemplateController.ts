import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../prisma/generated/prisma/client';

export class TemplateController {
  /**
   * Get all templates
   */
  async getTemplates(req: any, res: Response) {
    try {
      const { category, isActive, search } = req.query;

      let sql = Prisma.sql`SELECT * FROM templates WHERE 1=1`;
      const conditions: Prisma.Sql[] = [];

      // Apply filters
      if (category) {
        conditions.push(Prisma.sql`category = ${category}`);
      }
      if (isActive !== undefined) {
        conditions.push(Prisma.sql`is_active = ${isActive === 'true'}`);
      }
      if (search) {
        const searchPattern = `%${search}%`;
        conditions.push(Prisma.sql`(name ILIKE ${searchPattern} OR description ILIKE ${searchPattern})`);
      }

      // Combine conditions
      if (conditions.length > 0) {
        sql = Prisma.sql`SELECT * FROM templates WHERE ${Prisma.join(conditions, ' AND ')} ORDER BY category ASC, name ASC`;
      } else {
        sql = Prisma.sql`SELECT * FROM templates ORDER BY category ASC, name ASC`;
      }

      const rows = await prisma.$queryRaw<Array<any>>(sql);

      res.json({ templates: rows });
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req: any, res: Response) {
    try {
      const { id } = req.params;

      const rows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`SELECT * FROM templates WHERE id = ${id}`
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json({ template: rows[0] });
    } catch (error: any) {
      console.error('Error fetching template:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(req: any, res: Response) {
    try {
      const { name, description, category, thumbnail, components, metadata, isSystem } = req.body;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!name || !components) {
        return res.status(400).json({ error: 'Name and components are required' });
      }

      if (!Array.isArray(components)) {
        return res.status(400).json({ error: 'Components must be an array' });
      }

      const rows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`
          INSERT INTO templates (
            name, description, category, thumbnail, components, metadata, is_system, is_active, created_by
          ) VALUES (
            ${name}, 
            ${description || null}, 
            ${category || 'custom'}, 
            ${thumbnail || null}, 
            ${JSON.stringify(components)}::jsonb, 
            ${JSON.stringify(metadata || {})}::jsonb, 
            ${isSystem || false}, 
            ${true}, 
            ${userId}
          ) RETURNING *
        `
      );

      res.status(201).json({ template: rows[0] });
    } catch (error: any) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Create template from existing page
   */
  async createTemplateFromPage(req: any, res: Response) {
    try {
      const { pageId, name, description, category, thumbnail } = req.body;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!pageId || !name) {
        return res.status(400).json({ error: 'Page ID and name are required' });
      }

      // Get page components
      const components = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`
          SELECT component_type, position, props, styles, responsive_config 
          FROM page_components 
          WHERE page_id = ${pageId} 
          ORDER BY position ASC
        `
      );

      // Transform components to template format
      const templateComponents = components.map((comp: any) => ({
        componentType: comp.component_type,
        position: comp.position,
        props: comp.props,
        styles: comp.styles,
        responsiveConfig: comp.responsive_config
      }));

      // Create template
      const rows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`
          INSERT INTO templates (
            name, description, category, thumbnail, components, metadata, is_system, is_active, created_by
          ) VALUES (
            ${name}, 
            ${description || null}, 
            ${category || 'custom'}, 
            ${thumbnail || null}, 
            ${JSON.stringify(templateComponents)}::jsonb, 
            ${JSON.stringify({})}::jsonb, 
            ${false}, 
            ${true}, 
            ${userId}
          ) RETURNING *
        `
      );

      res.status(201).json({ template: rows[0] });
    } catch (error: any) {
      console.error('Error creating template from page:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, category, thumbnail, components, metadata, isActive } = req.body;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if template exists and is not a system template
      const existingRows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`SELECT is_system FROM templates WHERE id = ${id}`
      );

      if (existingRows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const existing = existingRows[0];
      if (existing.is_system && !req.admin) {
        return res.status(403).json({ error: 'Cannot modify system templates' });
      }

      // Build dynamic update
      const updates: Prisma.Sql[] = [Prisma.sql`updated_at = NOW()`];

      if (name !== undefined) {
        updates.push(Prisma.sql`name = ${name}`);
      }
      if (description !== undefined) {
        updates.push(Prisma.sql`description = ${description}`);
      }
      if (category !== undefined) {
        updates.push(Prisma.sql`category = ${category}`);
      }
      if (thumbnail !== undefined) {
        updates.push(Prisma.sql`thumbnail = ${thumbnail}`);
      }
      if (components !== undefined) {
        if (!Array.isArray(components)) {
          return res.status(400).json({ error: 'Components must be an array' });
        }
        updates.push(Prisma.sql`components = ${JSON.stringify(components)}::jsonb`);
      }
      if (metadata !== undefined) {
        updates.push(Prisma.sql`metadata = ${JSON.stringify(metadata)}::jsonb`);
      }
      if (isActive !== undefined) {
        updates.push(Prisma.sql`is_active = ${isActive}`);
      }

      const rows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`UPDATE templates SET ${Prisma.join(updates, ', ')} WHERE id = ${id} RETURNING *`
      );

      res.json({ template: rows[0] });
    } catch (error: any) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(req: any, res: Response) {
    try {
      const { id } = req.params;

      // Check if template exists and is not a system template
      const existingRows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`SELECT is_system FROM templates WHERE id = ${id}`
      );

      if (existingRows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const existing = existingRows[0];
      if (existing.is_system) {
        return res.status(403).json({ error: 'Cannot delete system templates' });
      }

      // Check if template is being used
      const usages = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`SELECT id FROM pages WHERE template_id = ${id} LIMIT 1`
      );

      if (usages.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete template that is being used',
          message: 'This template is used by one or more pages'
        });
      }

      await prisma.$executeRaw(Prisma.sql`DELETE FROM templates WHERE id = ${id}`);

      res.json({ message: 'Template deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Get template categories
   */
  async getCategories(req: any, res: Response) {
    try {
      const rows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`SELECT DISTINCT category FROM templates WHERE is_active = true ORDER BY category ASC`
      );

      const categories = rows.map(item => item.category);

      res.json({ categories });
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Preview template (returns template with component definitions)
   */
  async previewTemplate(req: any, res: Response) {
    try {
      const { id } = req.params;

      // Get template
      const templateRows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`SELECT * FROM templates WHERE id = ${id}`
      );

      if (templateRows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const template = templateRows[0];

      // Get component definitions for all components in template
      const components = Array.isArray(template.components) ? template.components : [];
      const componentTypes = components.map((comp: any) => comp.componentType);
      const uniqueComponentTypes = [...new Set(componentTypes)];

      if (uniqueComponentTypes.length === 0) {
        return res.json({ 
          template,
          componentDefinitions: []
        });
      }

      // Build IN clause for component types
      const componentTypeConditions = uniqueComponentTypes.map(type => Prisma.sql`${type}`);
      const componentDefs = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`SELECT * FROM component_definitions WHERE name IN (${Prisma.join(componentTypeConditions, ', ')})`
      );

      res.json({ 
        template,
        componentDefinitions: componentDefs
      });
    } catch (error: any) {
      console.error('Error previewing template:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}
