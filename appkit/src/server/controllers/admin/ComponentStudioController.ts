
import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ComponentStudioController {
  async getSidebar(req: Request, res: Response) {
    try {
      const styles = await prisma.componentStyle.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      return res.json({ sidebar: styles });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createStyle(req: Request, res: Response) {
    try {
      const data = req.body;
      const style = await prisma.componentStyle.create({ data });
      return res.status(201).json({ style });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateStyle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const style = await prisma.componentStyle.update({
        where: { id },
        data
      });
      return res.json({ style });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async duplicateStyle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const original = await prisma.componentStyle.findUnique({ where: { id } });
      if (!original) return res.status(404).json({ error: 'Style not found' });
      
      const data = {
        name: `${original.name} (Copy)`,
        cssRules: original.cssRules
      };
      const duplicated = await prisma.componentStyle.create({ data: data as any });
      return res.status(201).json({ style: duplicated });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteStyle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.componentStyle.delete({ where: { id } });
      return res.json({ message: 'Style deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
