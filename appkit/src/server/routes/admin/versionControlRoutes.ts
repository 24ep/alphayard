import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticateAdmin } from '../../middleware/adminAuth';
import { authenticateToken } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permissionCheck';

const router = Router();

// Apply admin auth to all routes
router.use(authenticateAdmin as any);

// Get all versions for a content page
router.get('/pages/:pageId/versions', requirePermission('pages', 'view'), async (req, res) => {
  try {
    const { pageId } = req.params;
    const { page = 1, page_size = 20 } = req.query;
    
    const offset = (Number(page) - 1) * Number(page_size);
    const limit = Number(page_size);
    
    const versions = await prisma.pageVersion.findMany({
      where: { pageId },
      include: {
        page: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { versionNumber: 'desc' },
      skip: offset,
      take: limit
    });

    res.json({ versions: versions || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific version
router.get('/pages/:pageId/versions/:versionId', authenticateToken as any, async (req, res) => {
  try {
    const { pageId, versionId } = req.params;
    
    const version = await prisma.pageVersion.findFirst({
      where: { 
        pageId,
        id: versionId 
      },
      include: {
        page: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json({ version });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new version
router.post('/pages/:pageId/versions', requirePermission('pages', 'edit'), async (req, res) => {
  try {
    const { pageId } = req.params;
    const { 
      title, 
      content, 
      change_description, 
      is_auto_save = false 
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Get the next version number
    const lastVersion = await prisma.pageVersion.findFirst({
      where: { pageId },
      orderBy: { versionNumber: 'desc' }
    });

    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    // Create the new version
    const version = await prisma.pageVersion.create({
      data: {
        pageId,
        versionNumber: nextVersionNumber,
        components: content,
        authorId: (req as any).user?.id,
        commitMessage: change_description || null
      }
    });

    res.status(201).json({ version });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Restore a version (creates a new version with restored content)
router.post('/pages/:pageId/versions/:versionId/restore', authenticateToken as any, async (req, res) => {
  try {
    const { pageId, versionId } = req.params;
    const { restore_description } = req.body;

    // Get the version to restore
    const versionToRestore = await prisma.pageVersion.findFirst({
      where: { 
        pageId,
        id: versionId 
      }
    });

    if (!versionToRestore) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Get the next version number
    const lastVersion = await prisma.pageVersion.findFirst({
      where: { pageId },
      orderBy: { versionNumber: 'desc' }
    });

    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    await prisma.page.update({
      where: { id: pageId },
      data: { 
        components: versionToRestore.components || [],
        versionNumber: { increment: 1 }
      }
    });

    const restoredVersion = await prisma.pageVersion.create({
      data: {
        pageId,
        versionNumber: nextVersionNumber,
        components: versionToRestore.components || [],
        authorId: (req as any).user?.id,
        commitMessage: restore_description || `Restored from version ${versionToRestore.versionNumber}: ${versionToRestore.commitMessage || 'Unknown'}`
      }
    });

    res.json({ 
      version: restoredVersion,
      message: 'Version restored successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a version
router.delete('/pages/:pageId/versions/:versionId', requirePermission('pages', 'delete'), async (req, res) => {
  try {
    const { pageId, versionId } = req.params;
    
    // Check if this is the only version
    const count = await prisma.pageVersion.count({
      where: { pageId }
    });

    if (count <= 1) {
      return res.status(400).json({ error: 'Cannot delete the only version' });
    }

    const result = await prisma.pageVersion.delete({
      where: { 
        pageId,
        id: versionId 
      }
    });

    res.json({ message: 'Version deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Compare two versions
router.get('/pages/:pageId/versions/:versionId1/compare/:versionId2', requirePermission('pages', 'view'), async (req, res) => {
  try {
    const { pageId, versionId1, versionId2 } = req.params;
    
    const versions = await prisma.pageVersion.findMany({
      where: {
        pageId,
        id: { in: [versionId1, versionId2] }
      }
    });

    if (versions.length !== 2) {
      return res.status(404).json({ error: 'One or both versions not found' });
    }

    // Sort to match requested order or just find them
    const v1 = versions.find((v: any) => v.id === versionId1);
    const v2 = versions.find((v: any) => v.id === versionId2);

    if (!v1 || !v2) return res.status(404).json({ error: 'Version mismatch' });

    const c1: any = typeof v1.components === 'string' ? JSON.parse(v1.components) : v1.components;
    const c2: any = typeof v2.components === 'string' ? JSON.parse(v2.components) : v2.components;
    
    const count1 = Array.isArray(c1) ? c1.length : (Array.isArray(c1?.components) ? c1.components.length : 0);
    const count2 = Array.isArray(c2) ? c2.length : (Array.isArray(c2?.components) ? c2.components.length : 0);

    const diff = {
      version1: {
        id: v1.id,
        versionNumber: v1.versionNumber,
        createdAt: v1.createdAt,
        component_count: count1
      },
      version2: {
        id: v2.id,
        versionNumber: v2.versionNumber,
        createdAt: v2.createdAt,
        component_count: count2
      },
      changes: {
        component_count_diff: count2 - count1,
        time_diff: new Date(v2.createdAt).getTime() - new Date(v1.createdAt).getTime()
      }
    };

    res.json({ diff });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-save functionality
router.post('/pages/:pageId/auto-save', requirePermission('pages', 'edit'), async (req, res) => {
  try {
    const { pageId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if there's a recent auto-save (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const recentAutoSave = await prisma.pageVersion.findFirst({
      where: {
        pageId,
        commitMessage: 'Auto-save',
        createdAt: {
          gte: new Date(fiveMinutesAgo)
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // If there's a recent auto-save, update it instead of creating a new one
    if (recentAutoSave) {
      const updatedVersion = await prisma.pageVersion.update({
        where: { id: recentAutoSave.id },
        data: {
          components: content
        }
      });

      return res.json({ version: updatedVersion, message: 'Auto-save updated' });
    }

    // Create new auto-save version
    const lastVersion = await prisma.pageVersion.findFirst({
      where: { pageId },
      orderBy: { versionNumber: 'desc' }
    });

    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    const autoSaveVersion = await prisma.pageVersion.create({
      data: {
        pageId,
        versionNumber: nextVersionNumber,
        components: content,
        commitMessage: 'Auto-save',
        authorId: (req as any).user?.id
      }
    });

    res.json({ version: autoSaveVersion, message: 'Auto-save created' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
