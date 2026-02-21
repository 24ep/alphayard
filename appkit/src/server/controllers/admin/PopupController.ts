
import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PopupController {
  async getActivePopups(req: Request, res: Response) {
    try {
      const popups = await prisma.popup.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ popups });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async recordAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { type } = req.body; // 'view' or 'click'
      
      const data: any = {};
      if (type === 'view') data.viewCount = { increment: 1 };
      else if (type === 'click') data.clickCount = { increment: 1 };
      
      const popup = await prisma.popup.update({
        where: { id },
        data
      });
      return res.json({ analytics: { views: popup.viewCount, clicks: popup.clickCount } });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getUserSettings(req: Request, res: Response) {
    try {
      const { userId, appId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const settings = await prisma.userSettings.findUnique({
        where: { userId_applicationId: { userId: String(userId), applicationId: String(appId || '') } }
      });
      
      return res.json({ settings: settings?.settings || { disabledPopups: [] } });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateUserSettings(req: Request, res: Response) {
    try {
      const { userId, appId, settings } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const updated = await prisma.userSettings.upsert({
        where: { userId_applicationId: { userId: String(userId), applicationId: String(appId || '') } },
        update: { settings },
        create: { userId: String(userId), applicationId: String(appId || ''), settings }
      });
      
      return res.json({ settings: updated.settings });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async markAsShown(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      await prisma.popup.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      });

      // Also log to user settings if needed, but for now we'll just increment global count
      return res.json({ success: true, message: 'Popup marked as shown' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAllPopups(req: Request, res: Response) {
    try {
      const popups = await prisma.popup.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ popups });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getPopupById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const popup = await prisma.popup.findUnique({ where: { id } });
      if (!popup) return res.status(404).json({ error: 'Popup not found' });
      return res.json({ popup });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createPopup(req: Request, res: Response) {
    try {
      const data = req.body;
      const popup = await prisma.popup.create({ data });
      return res.status(201).json({ popup });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updatePopup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const popup = await prisma.popup.update({
        where: { id },
        data
      });
      return res.json({ popup });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deletePopup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.popup.delete({ where: { id } });
      return res.json({ message: 'Popup deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAnalyticsOverview(req: Request, res: Response) {
    try {
      const stats = await prisma.popup.aggregate({
        _sum: { viewCount: true, clickCount: true }
      });
      return res.json({ 
        totalViews: stats._sum.viewCount || 0,
        totalClicks: stats._sum.clickCount || 0 
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getPopupAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const popup = await prisma.popup.findUnique({
        where: { id },
        select: { viewCount: true, clickCount: true }
      });
      return res.json({ analytics: popup });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async exportAnalytics(req: Request, res: Response) {
    // Basic CSV export logic would go here
    return res.json({ message: 'Analytics exported (placeholder)' });
  }
}
