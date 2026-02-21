
import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TemplateController {
  async getTemplates(req: Request, res: Response) {
    try {
      const { category } = req.query;
      const where = category ? { category: String(category), isActive: true } : { isActive: true };
      const templates = await prisma.cmsTemplate.findMany({ where });
      return res.json({ templates });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.cmsTemplate.findMany({
        select: { category: true },
        distinct: ['category']
      });
      return res.json({ categories: categories.map((c: any) => c.category).filter(Boolean) });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await prisma.cmsTemplate.findUnique({ 
        where: { id, isActive: true }
      });
      if (!template) return res.status(404).json({ error: 'Template not found' });
      return res.json({ template });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async previewTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await prisma.cmsTemplate.findUnique({ 
        where: { id, isActive: true }
      });
      if (!template) return res.status(404).json({ error: 'Template not found' });
      return res.json({ preview: template.components });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createTemplate(req: Request, res: Response) {
    try {
      const data = req.body;
      const template = await prisma.cmsTemplate.create({ data });
      return res.status(201).json({ template });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async createTemplateFromPage(req: Request, res: Response) {
    try {
      const { pageId, name, category, description } = req.body;
      const page = await prisma.page.findUnique({ where: { id: pageId } });
      if (!page) return res.status(404).json({ error: 'Page not found' });

      const template = await prisma.cmsTemplate.create({
        data: {
          name: name || `Template from ${page.title}`,
          category,
          description,
          components: page.components || []
        }
      });
      return res.status(201).json({ template });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const template = await prisma.cmsTemplate.update({
        where: { id },
        data
      });
      return res.json({ template });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.cmsTemplate.delete({ where: { id } });
      return res.json({ message: 'Template deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
