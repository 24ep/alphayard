
import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SystemConfigController {
  async getAllConfigs(req: Request, res: Response) {
    try {
      const configs = await prisma.systemConfig.findMany();
      return res.json({ configs });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getCountries(req: Request, res: Response) {
    try {
      const countries = await prisma.country.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
      return res.json({ countries });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getConfig(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const config = await prisma.systemConfig.findUnique({ where: { key } });
      if (!config) return res.status(404).json({ error: 'Config not found' });
      return res.json({ config });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateConfig(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const { value, description, isPublic } = req.body;
      const config = await prisma.systemConfig.upsert({
        where: { key },
        update: { value, description, isPublic },
        create: { key, value, description, isPublic }
      });
      return res.json({ config });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteConfig(req: Request, res: Response) {
    try {
      const { key } = req.params;
      await prisma.systemConfig.delete({ where: { key } });
      return res.json({ message: 'Config deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getManagerSignupConfig(req: Request, res: Response) {
    try {
      const config = await prisma.systemConfig.findUnique({ where: { key: 'manager_signup' } });
      return res.json({ config: config?.value || {} });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateManagerSignupConfig(req: Request, res: Response) {
    try {
      const { config } = req.body;
      const updated = await prisma.systemConfig.upsert({
        where: { key: 'manager_signup' },
        update: { value: config },
        create: { key: 'manager_signup', value: config }
      });
      return res.json({ config: updated.value });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
