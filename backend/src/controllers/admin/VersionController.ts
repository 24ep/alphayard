import { Response } from 'express';
import { prisma } from '../../lib/prisma';

export class VersionController {
  /**
   * Get version history for a page
   */
  async getVersionHistory(req: any, res: Response) {
    try {
      const { pageId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM page_versions 
        WHERE page_id = ${pageId}::uuid
        ORDER BY version_number DESC 
        LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}
      `;

      res.json({ versions: rows });
    } catch (error: any) {
      console.error('Error fetching version history:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Get a specific version
   */
  async getVersion(req: any, res: Response) {
    try {
      const { pageId, versionId } = req.params;

      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM page_versions 
        WHERE page_id = ${pageId}::uuid AND id = ${versionId}::uuid
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Version not found' });
      }

      res.json({ version: rows[0] });
    } catch (error: any) {
      console.error('Error fetching version:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Get a specific version by version number
   */
  async getVersionByNumber(req: any, res: Response) {
    try {
      const { pageId, versionNumber } = req.params;

      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM page_versions 
        WHERE page_id = ${pageId}::uuid AND version_number = ${parseInt(versionNumber)}
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Version not found' });
      }

      res.json({ version: rows[0] });
    } catch (error: any) {
      console.error('Error fetching version:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Preview a specific version (render version without affecting current page)
   */
  async previewVersion(req: any, res: Response) {
    try {
      const { pageId, versionId } = req.params;

      // Get version
      const versionRows = await prisma.$queryRaw<any[]>`
        SELECT * FROM page_versions 
        WHERE page_id = ${pageId}::uuid AND id = ${versionId}::uuid
      `;

      if (versionRows.length === 0) {
        return res.status(404).json({ error: 'Version not found' });
      }

      const version = versionRows[0];

      // Get page metadata
      const pageRows = await prisma.$queryRaw<any[]>`
        SELECT id, title, slug, description, metadata, seo_config 
        FROM pages 
        WHERE id = ${pageId}::uuid
      `;

      if (pageRows.length === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }

      const page = pageRows[0];

      // Combine page metadata with version components
      const preview = {
        ...page,
        components: version.components,
        version_number: version.version_number,
        version_created_at: version.created_at,
        version_created_by: version.created_by
      };

      res.json({ preview });
    } catch (error: any) {
      console.error('Error previewing version:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Restore a previous version (creates a new version based on the selected one)
   */
  async restoreVersion(req: any, res: Response) {
    try {
      const { pageId, versionId } = req.params;
      const { changeDescription } = req.body;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Get the version to restore
        const versionRows = await tx.$queryRaw<any[]>`
          SELECT * FROM page_versions 
          WHERE page_id = ${pageId}::uuid AND id = ${versionId}::uuid
        `;

        if (versionRows.length === 0) {
          throw new Error('Version not found');
        }

        const version = versionRows[0];

        // Delete current page components
        await tx.$executeRaw`
          DELETE FROM page_components WHERE page_id = ${pageId}::uuid
        `;

        // Insert components from the version
        if (version.components && Array.isArray(version.components) && version.components.length > 0) {
          for (const comp of version.components) {
            await tx.$executeRaw`
              INSERT INTO page_components (
                page_id, component_type, position, props, styles, responsive_config
              ) VALUES (
                ${pageId}::uuid, 
                ${comp.componentType || comp.component_type}, 
                ${comp.position}, 
                ${JSON.stringify(comp.props || {})}::jsonb, 
                ${JSON.stringify(comp.styles || {})}::jsonb, 
                ${JSON.stringify(comp.responsiveConfig || comp.responsive_config || {})}::jsonb
              )
            `;
          }
        }

        // Update page to trigger version creation (assuming there's a trigger or we create version manually)
        const updatedPageRows = await tx.$queryRaw<any[]>`
          UPDATE pages SET 
            updated_by = ${userId}::uuid, 
            updated_at = NOW(),
            metadata = ${JSON.stringify({
              ...version.metadata,
              restored_from_version: version.version_number,
              restore_description: changeDescription || `Restored from version ${version.version_number}`
            })}::jsonb
          WHERE id = ${pageId}::uuid 
          RETURNING *
        `;

        // Get the newly created version
        const newVersionRows = await tx.$queryRaw<any[]>`
          SELECT * FROM page_versions 
          WHERE page_id = ${pageId}::uuid
          ORDER BY version_number DESC 
          LIMIT 1
        `;

        return {
          page: updatedPageRows[0],
          newVersion: newVersionRows[0],
          message: `Successfully restored version ${version.version_number}`
        };
      });

      res.json(result);
    } catch (error: any) {
      if (error.message === 'Version not found') {
        return res.status(404).json({ error: 'Version not found' });
      }
      console.error('Error restoring version:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Compare two versions
   */
  async compareVersions(req: any, res: Response) {
    try {
      const { pageId } = req.params;
      const { version1, version2 } = req.query;

      if (!version1 || !version2) {
        return res.status(400).json({ error: 'Both version IDs are required' });
      }

      // Get both versions
      const versions = await prisma.$queryRaw<any[]>`
        SELECT * FROM page_versions 
        WHERE page_id = ${pageId}::uuid 
        AND id IN (${version1}::uuid, ${version2}::uuid)
      `;

      if (versions.length !== 2) {
        return res.status(404).json({ error: 'One or both versions not found' });
      }

      const v1 = versions.find(v => v.id === version1);
      const v2 = versions.find(v => v.id === version2);

      if (!v1 || !v2) {
        return res.status(404).json({ error: 'One or both versions not found' });
      }

      // Compare components
      const comparison = this.compareComponents(v1.components || [], v2.components || []);

      res.json({
        version1: {
          id: v1.id,
          version_number: v1.version_number,
          created_at: v1.created_at,
          created_by: v1.created_by
        },
        version2: {
          id: v2.id,
          version_number: v2.version_number,
          created_at: v2.created_at,
          created_by: v2.created_by
        },
        comparison
      });
    } catch (error: any) {
      console.error('Error comparing versions:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Helper method to compare components between two versions
   */
  private compareComponents(components1: any[], components2: any[]) {
    const added: any[] = [];
    const removed: any[] = [];
    const modified: any[] = [];

    // Create maps for easier comparison
    const map1 = new Map(components1.map((c, i) => [i, c]));
    const map2 = new Map(components2.map((c, i) => [i, c]));

    // Find added and modified components
    map2.forEach((comp2, index) => {
      const comp1 = map1.get(index);
      
      if (!comp1) {
        added.push({
          position: index,
          component: comp2
        });
      } else {
        // Check if component was modified
        const changes = this.findComponentChanges(comp1, comp2);
        if (changes.length > 0) {
          modified.push({
            position: index,
            componentType: comp2.componentType || comp2.component_type,
            changes
          });
        }
      }
    });

    // Find removed components
    map1.forEach((comp1, index) => {
      if (!map2.has(index)) {
        removed.push({
          position: index,
          component: comp1
        });
      }
    });

    return {
      added,
      removed,
      modified,
      summary: {
        addedCount: added.length,
        removedCount: removed.length,
        modifiedCount: modified.length
      }
    };
  }

  /**
   * Helper method to find changes between two components
   */
  private findComponentChanges(comp1: any, comp2: any) {
    const changes: any[] = [];

    // Check component type
    const type1 = comp1.componentType || comp1.component_type;
    const type2 = comp2.componentType || comp2.component_type;
    if (type1 !== type2) {
      changes.push({
        property: 'componentType',
        oldValue: type1,
        newValue: type2
      });
    }

    // Check position
    if (comp1.position !== comp2.position) {
      changes.push({
        property: 'position',
        oldValue: comp1.position,
        newValue: comp2.position
      });
    }

    // Check props
    const propsChanges = this.findObjectChanges(comp1.props || {}, comp2.props || {});
    if (propsChanges.length > 0) {
      changes.push({
        property: 'props',
        changes: propsChanges
      });
    }

    // Check styles
    const stylesChanges = this.findObjectChanges(comp1.styles || {}, comp2.styles || {});
    if (stylesChanges.length > 0) {
      changes.push({
        property: 'styles',
        changes: stylesChanges
      });
    }

    return changes;
  }

  /**
   * Helper method to find changes between two objects
   */
  private findObjectChanges(obj1: any, obj2: any) {
    const changes: any[] = [];
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    allKeys.forEach(key => {
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        changes.push({
          key,
          oldValue: val1,
          newValue: val2
        });
      }
    });

    return changes;
  }

  /**
   * Delete a version (only for non-current versions)
   */
  async deleteVersion(req: any, res: Response) {
    try {
      const { pageId, versionId } = req.params;

      // Get the latest version number
      const latestVersionRows = await prisma.$queryRaw<any[]>`
        SELECT version_number FROM page_versions 
        WHERE page_id = ${pageId}::uuid 
        ORDER BY version_number DESC 
        LIMIT 1
      `;

      // Get the version to delete
      const versionToDeleteRows = await prisma.$queryRaw<any[]>`
        SELECT version_number FROM page_versions 
        WHERE id = ${versionId}::uuid
      `;

      if (versionToDeleteRows.length === 0) {
        return res.status(404).json({ error: 'Version not found' });
      }

      const versionToDelete = versionToDeleteRows[0];
      const latestVersion = latestVersionRows[0];

      // Prevent deletion of the current version
      if (latestVersion && versionToDelete.version_number === latestVersion.version_number) {
        return res.status(400).json({ error: 'Cannot delete the current version' });
      }

      await prisma.$executeRaw`
        DELETE FROM page_versions WHERE id = ${versionId}::uuid
      `;

      res.json({ message: 'Version deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting version:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}
