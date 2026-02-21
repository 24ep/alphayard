
import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CMSController {
  async getContent(req: Request, res: Response) {
    try {
      const { categoryId, publishedOnly } = req.query;
      const filter: any = {};
      if (categoryId) filter.categoryId = String(categoryId);
      if (publishedOnly === 'true') filter.isPublished = true;
      
      const content = await prisma.cmsContent.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      });
      return res.json({ content });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getContentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const content = await prisma.cmsContent.findUnique({
        where: { id },
        include: { category: true, comments: true }
      });
      if (!content) return res.status(404).json({ error: 'Content not found' });
      return res.json({ content });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createContent(req: Request, res: Response) {
    try {
      const data = req.body;
      const content = await prisma.cmsContent.create({ data });
      return res.status(201).json({ content });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const content = await prisma.cmsContent.update({
        where: { id },
        data
      });
      return res.json({ content });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.cmsContent.delete({ where: { id } });
      return res.json({ message: 'Content deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async likeContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const content = await prisma.cmsContent.update({
        where: { id },
        data: { likeCount: { increment: 1 } }
      });
      return res.json({ likeCount: content.likeCount });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async viewContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const content = await prisma.cmsContent.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      });
      return res.json({ viewCount: content.viewCount });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async shareContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const content = await prisma.cmsContent.update({
        where: { id },
        data: { shareCount: { increment: 1 } }
      });
      return res.json({ shareCount: content.shareCount });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getComments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const comments = await prisma.cmsComment.findMany({
        where: { contentId: id },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ comments });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = { ...req.body, contentId: id };
      const comment = await prisma.cmsComment.create({ data });
      return res.status(201).json({ comment });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.cmsCategory.findMany({
        orderBy: { name: 'asc' }
      });
      return res.json({ categories });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const data = req.body;
      const category = await prisma.cmsCategory.create({ data });
      return res.status(201).json({ category });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getContentAnalytics(req: Request, res: Response) {
    try {
      const totalContent = await prisma.cmsContent.count();
      const publishedContent = await prisma.cmsContent.count({ where: { isPublished: true } });
      const stats = await prisma.cmsContent.aggregate({
        _sum: { viewCount: true, likeCount: true, shareCount: true }
      });
      return res.json({ 
        totalContent, 
        publishedContent, 
        totalViews: stats._sum.viewCount || 0,
        totalLikes: stats._sum.likeCount || 0, 
        totalShares: stats._sum.shareCount || 0
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getPopularContent(req: Request, res: Response) {
    try {
      const content = await prisma.cmsContent.findMany({
        where: { isPublished: true },
        orderBy: { viewCount: 'desc' },
        take: 10
      });
      return res.json({ content });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

const cmsController = new CMSController();
export default cmsController;
