
import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AppConfigController {
  async getAppConfig(req: Request, res: Response) {
    try {
      const { appId } = req.query;
      if (!appId) return res.status(400).json({ error: 'appId is required' });
      
      const app = await prisma.application.findUnique({
        where: { id: String(appId) }
      });
      return res.json({ config: app?.branding || {} });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getScreenConfig(req: Request, res: Response) {
    try {
      const { appId, screenKey } = req.query;
      const setting = await prisma.appSetting.findFirst({
        where: { applicationId: String(appId), key: `screen_${screenKey}` }
      });
      return res.json({ config: setting?.value || {} });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getThemes(req: Request, res: Response) {
    try {
      const themes = await prisma.appSetting.findMany({
        where: { key: { startsWith: 'theme_' } }
      });
      return res.json({ themes });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAsset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const asset = await prisma.file.findUnique({ where: { id } });
      return res.json({ asset });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAssetsByType(req: Request, res: Response) {
    try {
      const { type } = req.query;
      const assets = await prisma.file.findMany({
        where: { mimeType: { contains: String(type) } }
      });
      return res.json({ assets });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getFeatureFlags(req: Request, res: Response) {
    try {
      const flags = await prisma.appSetting.findFirst({
        where: { key: 'feature_flags' }
      });
      return res.json({ flags: flags?.value || {} });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getConfigValue(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const setting = await prisma.appSetting.findFirst({
        where: { key }
      });
      return res.json({ value: setting?.value });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateScreenConfig(req: Request, res: Response) {
    try {
      const { appId, screenKey, config } = req.body;
      const setting = await prisma.appSetting.upsert({
        where: { applicationId_key: { applicationId: appId, key: `screen_${screenKey}` } },
        update: { value: config },
        create: { applicationId: appId, key: `screen_${screenKey}`, value: config }
      });
      return res.json({ setting });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateTheme(req: Request, res: Response) {
    try {
      const { appId, themeName, themeConfig } = req.body;
      const setting = await prisma.appSetting.upsert({
        where: { applicationId_key: { applicationId: appId, key: `theme_${themeName}` } },
        update: { value: themeConfig },
        create: { applicationId: appId, key: `theme_${themeName}`, value: themeConfig }
      });
      return res.json({ setting });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async upsertAsset(req: Request, res: Response) {
    // This would normally involve storageService as well.
    return res.json({ message: 'Asset upserted (placeholder)' });
  }

  async updateFeatureFlag(req: Request, res: Response) {
    try {
      const { appId, flag, value } = req.body;
      const existing = await prisma.appSetting.findFirst({
        where: { applicationId: appId, key: 'feature_flags' }
      });
      const flags = (existing?.value as any) || {};
      flags[flag] = value;
      
      const setting = await prisma.appSetting.upsert({
        where: { applicationId_key: { applicationId: appId, key: 'feature_flags' } },
        update: { value: flags },
        create: { applicationId: appId, key: 'feature_flags', value: flags }
      });
      return res.json({ setting });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateConfigValue(req: Request, res: Response) {
    try {
      const { appId, key, value } = req.body;
      const setting = await prisma.appSetting.upsert({
        where: { applicationId_key: { applicationId: appId, key } },
        update: { value },
        create: { applicationId: appId, key, value }
      });
      return res.json({ setting });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export const appConfigController = new AppConfigController();
