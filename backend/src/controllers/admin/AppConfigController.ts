import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../prisma/generated/prisma/client';

/**
 * App Configuration Controller
 * Manages dynamic app configuration similar to Adobe Experience Manager (AEM)
 * Handles themes, screens, assets, feature flags, etc.
 * 
 * MIGRATED: Using Prisma client with $queryRaw for tables not yet in Prisma schema
 */
export class AppConfigController {

  /**
   * Get complete app configuration bundle
   * Returns all configuration needed for app initialization
   */
  async getAppConfig(req: Request, res: Response) {
    try {
      const { platform } = req.query;

      // Fetch all configuration data in parallel using Prisma $queryRaw
      const [
        configResult,
        screensResult,
        themesResult,
        featuresResult,
        assetsResult,
        brandingResult
      ] = await Promise.all([
        prisma.$queryRaw<any[]>`
          SELECT * FROM app_configuration WHERE is_active = true
        `,
        prisma.$queryRaw<any[]>`
          SELECT * FROM app_screens WHERE is_active = true
        `,
        prisma.$queryRaw<any[]>`
          SELECT * FROM app_themes WHERE is_active = true
        `,
        prisma.$queryRaw<any[]>`
          SELECT * FROM app_feature_flags
        `,
        prisma.$queryRaw<any[]>`
          SELECT * FROM app_assets WHERE is_active = true
        `,
        prisma.$queryRaw<any[]>`
          SELECT * FROM public.app_settings WHERE key = 'branding' LIMIT 1
        `
      ]);

      // Transform configuration into key-value object
      const configuration: Record<string, any> = {};
      if (configResult) {
        configResult.forEach((config: any) => {
          configuration[config.config_key] = config.config_value;
        });
      }

      // Transform screens into key-value object
      const screens: Record<string, any> = {};
      if (screensResult) {
        screensResult.forEach((screen: any) => {
          screens[screen.screen_key] = {
            name: screen.screen_name,
            type: screen.screen_type,
            config: screen.configuration,
            version: screen.version
          };
        });
      }

      // Get default theme
      const defaultTheme = themesResult?.find((t: any) => t.is_default) || themesResult?.[0];

      // Filter feature flags based on platform
      let features = featuresResult || [];
      if (platform) {
        features = features.filter((f: any) =>
          !f.target_platforms ||
          f.target_platforms.length === 0 ||
          f.target_platforms.includes(platform as string)
        );
      }

      // Filter assets based on platform
      let assets = assetsResult || [];
      if (platform) {
        assets = assets.filter((a: any) =>
          a.platform === 'all' || a.platform === platform
        );
      }

      // Transform assets into grouped object
      const assetsByType: Record<string, any[]> = {};
      assets.forEach((asset: any) => {
        if (!assetsByType[asset.asset_type]) {
          assetsByType[asset.asset_type] = [];
        }
        assetsByType[asset.asset_type].push({
          key: asset.asset_key,
          name: asset.asset_name,
          url: asset.asset_url,
          metadata: asset.metadata,
          dimensions: asset.dimensions
        });
      });

      // Build response
      const response = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        configuration,
        branding: brandingResult[0]?.value || null,
        screens,
        theme: defaultTheme ? {
          key: defaultTheme.theme_key,
          name: defaultTheme.theme_name,
          config: defaultTheme.theme_config
        } : null,
        features: features.reduce((acc: Record<string, any>, f: any) => {
          acc[f.feature_key] = {
            enabled: f.is_enabled,
            rollout: f.rollout_percentage,
            metadata: f.metadata
          };
          return acc;
        }, {} as Record<string, any>),
        assets: assetsByType
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching app config:', error);
      res.status(500).json({ error: 'Failed to fetch app configuration' });
    }
  }

  /**
   * Get specific screen configuration
   */
  async getScreenConfig(req: Request, res: Response) {
    try {
      const { screenKey } = req.params;

      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM app_screens WHERE screen_key = ${screenKey} AND is_active = true LIMIT 1
      `;

      const data = rows[0];

      if (!data) {
        // Return default screen config if not found (prevents 404 errors)
        return res.json({
          screen: {
            key: screenKey,
            name: screenKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            type: 'default',
            config: {
              background: {
                type: 'gradient',
                colors: ['#FA7272', '#FFBBB4']
              }
            },
            version: 1
          }
        });
      }

      res.json({
        screen: {
          key: data.screen_key,
          name: data.screen_name,
          type: data.screen_type,
          config: data.configuration,
          version: data.version
        }
      });
    } catch (error) {
      console.error('Error fetching screen config:', error);
      res.status(500).json({ error: 'Failed to fetch screen configuration' });
    }
  }

  /**
   * Update screen configuration (Admin only)
   */
  async updateScreenConfig(req: any, res: Response) {
    try {
      const { screenKey } = req.params;
      const { configuration } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // First get current version
      const currentRows = await prisma.$queryRaw<any[]>`
        SELECT version FROM app_screens WHERE screen_key = ${screenKey}
      `;

      const newVersion = (currentRows[0]?.version || 0) + 1;

      const rows = await prisma.$queryRaw<any[]>`
        UPDATE app_screens 
        SET configuration = ${JSON.stringify(configuration)}::jsonb, 
            updated_by = ${userId}, 
            version = ${newVersion}, 
            updated_at = NOW()
        WHERE screen_key = ${screenKey}
        RETURNING *
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Screen not found' });
      }

      res.json({ screen: rows[0] });
    } catch (error) {
      console.error('Error updating screen config:', error);
      res.status(500).json({ error: 'Failed to update screen configuration' });
    }
  }

  /**
   * Get all themes
   */
  async getThemes(req: Request, res: Response) {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM app_themes WHERE is_active = true ORDER BY is_default DESC
      `;

      res.json({ themes: rows });
    } catch (error) {
      console.error('Error fetching themes:', error);
      res.status(500).json({ error: 'Failed to fetch themes' });
    }
  }

  /**
   * Update theme configuration (Admin only)
   */
  async updateTheme(req: any, res: Response) {
    try {
      const { themeKey } = req.params;
      const { theme_config, theme_name, is_default } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // If setting as default, unset others first
      if (is_default) {
        await prisma.$queryRaw`
          UPDATE app_themes SET is_default = false WHERE theme_key != ${themeKey}
        `;
      }

      // Build dynamic update using Prisma.sql for dynamic queries
      const updateParts: Prisma.Sql[] = [
        Prisma.sql`updated_by = ${userId}`,
        Prisma.sql`updated_at = NOW()`
      ];

      if (theme_config !== undefined) {
        updateParts.push(Prisma.sql`theme_config = ${JSON.stringify(theme_config)}::jsonb`);
      }
      if (theme_name !== undefined) {
        updateParts.push(Prisma.sql`theme_name = ${theme_name}`);
      }
      if (is_default !== undefined) {
        updateParts.push(Prisma.sql`is_default = ${is_default}`);
      }

      const updateClause = Prisma.join(updateParts, ', ');
      
      const rows = await prisma.$queryRaw<any[]>`
        UPDATE app_themes 
        SET ${updateClause}
        WHERE theme_key = ${themeKey}
        RETURNING *
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Theme not found' });
      }

      res.json({ theme: rows[0] });
    } catch (error) {
      console.error('Error updating theme:', error);
      res.status(500).json({ error: 'Failed to update theme' });
    }
  }

  /**
   * Get specific asset by key
   */
  async getAsset(req: Request, res: Response) {
    try {
      const { assetKey } = req.params;

      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM app_assets WHERE asset_key = ${assetKey} AND is_active = true LIMIT 1
      `;

      const data = rows[0];

      if (!data) {
        // Return default asset if not found (prevents 404 errors in development)
        console.warn(`[APP_CONFIG] Asset not found: ${assetKey}. Returning fallback.`);

        let fallbackUrl = '';
        if (assetKey.includes('logo')) {
          fallbackUrl = 'https://via.placeholder.com/200x200?text=Logo';
        } else if (assetKey.includes('background')) {
          fallbackUrl = 'https://via.placeholder.com/1080x1920?text=Background';
        } else {
          fallbackUrl = `https://via.placeholder.com/150?text=${assetKey}`;
        }

        return res.json({
          asset: {
            asset_key: assetKey,
            asset_name: assetKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            asset_type: 'image',
            asset_url: fallbackUrl,
            is_active: true,
            version: 1
          }
        });
      }

      res.json({ asset: data });
    } catch (error) {
      console.error('Error fetching asset:', error);
      res.status(500).json({ error: 'Failed to fetch asset' });
    }
  }

  /**
   * Get assets by type
   */
  async getAssetsByType(req: Request, res: Response) {
    try {
      const { assetType } = req.params;
      const { platform } = req.query;

      let rows: any[];
      if (platform) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM app_assets 
          WHERE asset_type = ${assetType} 
            AND is_active = true 
            AND (platform = 'all' OR platform = ${platform as string})
          ORDER BY priority DESC
        `;
      } else {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM app_assets 
          WHERE asset_type = ${assetType} 
            AND is_active = true 
          ORDER BY priority DESC
        `;
      }

      res.json({ assets: rows });
    } catch (error) {
      console.error('Error fetching assets:', error);
      res.status(500).json({ error: 'Failed to fetch assets' });
    }
  }

  /**
   * Create or update asset (Admin only)
   */
  async upsertAsset(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { asset_key, asset_name, asset_type, asset_url, platform, priority, metadata, dimensions } = req.body;

      const rows = await prisma.$queryRaw<any[]>`
        INSERT INTO app_assets (asset_key, asset_name, asset_type, asset_url, platform, priority, metadata, dimensions, updated_by, is_active)
        VALUES (
          ${asset_key}, 
          ${asset_name}, 
          ${asset_type}, 
          ${asset_url}, 
          ${platform || 'all'}, 
          ${priority || 0}, 
          ${JSON.stringify(metadata || {})}::jsonb, 
          ${JSON.stringify(dimensions || {})}::jsonb, 
          ${userId}, 
          true
        )
        ON CONFLICT (asset_key) DO UPDATE SET
          asset_name = EXCLUDED.asset_name,
          asset_type = EXCLUDED.asset_type,
          asset_url = EXCLUDED.asset_url,
          platform = EXCLUDED.platform,
          priority = EXCLUDED.priority,
          metadata = EXCLUDED.metadata,
          dimensions = EXCLUDED.dimensions,
          updated_by = EXCLUDED.updated_by,
          updated_at = NOW()
        RETURNING *
      `;

      res.json({ asset: rows[0] });
    } catch (error) {
      console.error('Error upserting asset:', error);
      res.status(500).json({ error: 'Failed to save asset' });
    }
  }

  /**
   * Get feature flags
   */
  async getFeatureFlags(req: Request, res: Response) {
    try {
      const { platform } = req.query;

      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM app_feature_flags
      `;

      // Filter by platform if specified
      let features = rows || [];
      if (platform) {
        features = features.filter((f: any) =>
          !f.target_platforms ||
          f.target_platforms.length === 0 ||
          f.target_platforms.includes(platform as string)
        );
      }

      // Transform to simple object
      const flags: Record<string, boolean> = {};
      features.forEach((f: any) => {
        flags[f.feature_key] = f.is_enabled;
      });

      res.json({ features: flags, detailed: features });
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      res.status(500).json({ error: 'Failed to fetch feature flags' });
    }
  }

  /**
   * Update feature flag (Admin only)
   */
  async updateFeatureFlag(req: any, res: Response) {
    try {
      const { featureKey } = req.params;
      const { is_enabled, rollout_percentage } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Build dynamic update using Prisma.sql for dynamic queries
      const updateParts: Prisma.Sql[] = [
        Prisma.sql`updated_by = ${userId}`,
        Prisma.sql`updated_at = NOW()`
      ];

      if (is_enabled !== undefined) {
        updateParts.push(Prisma.sql`is_enabled = ${is_enabled}`);
      }
      if (rollout_percentage !== undefined) {
        updateParts.push(Prisma.sql`rollout_percentage = ${rollout_percentage}`);
      }

      const updateClause = Prisma.join(updateParts, ', ');

      const rows = await prisma.$queryRaw<any[]>`
        UPDATE app_feature_flags 
        SET ${updateClause}
        WHERE feature_key = ${featureKey}
        RETURNING *
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Feature flag not found' });
      }

      res.json({ feature: rows[0] });
    } catch (error) {
      console.error('Error updating feature flag:', error);
      res.status(500).json({ error: 'Failed to update feature flag' });
    }
  }

  /**
   * Get app configuration value by key
   */
  async getConfigValue(req: Request, res: Response) {
    try {
      const { configKey } = req.params;

      const rows = await prisma.$queryRaw<any[]>`
        SELECT config_value FROM app_configuration 
        WHERE config_key = ${configKey} AND is_active = true LIMIT 1
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Configuration not found' });
      }

      res.json({ value: rows[0].config_value });
    } catch (error) {
      console.error('Error fetching config value:', error);
      res.status(500).json({ error: 'Failed to fetch configuration value' });
    }
  }

  /**
   * Update app configuration (Admin only)
   */
  async updateConfigValue(req: any, res: Response) {
    try {
      const { configKey } = req.params;
      const { value } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // First get current version
      const currentRows = await prisma.$queryRaw<any[]>`
        SELECT version FROM app_configuration WHERE config_key = ${configKey}
      `;

      const newVersion = (currentRows[0]?.version || 0) + 1;

      const rows = await prisma.$queryRaw<any[]>`
        UPDATE app_configuration 
        SET config_value = ${JSON.stringify(value)}::jsonb, 
            updated_by = ${userId}, 
            version = ${newVersion}, 
            updated_at = NOW()
        WHERE config_key = ${configKey}
        RETURNING *
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Configuration not found' });
      }

      res.json({ config: rows[0] });
    } catch (error) {
      console.error('Error updating config value:', error);
      res.status(500).json({ error: 'Failed to update configuration value' });
    }
  }
}

export const appConfigController = new AppConfigController();
