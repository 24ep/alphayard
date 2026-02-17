import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import storageService from '../../services/storageService';
import entityService from '../../services/EntityService';

export class StorageController {
  // Get files with filtering and pagination
  async getFiles(req: any, res: Response) {
    try {
      const { limit = 50, offset = 0, type, shared, favorite, search } = req.query;
      const userId = req.user.id;
      const circleId = req.user.circleId;

      const filters: any = {
          applicationId: circleId,
          status: 'active'
      };

      if (type === 'folders') {
          filters['data->>mime_type'] = 'folder';
      } else if (type === 'files') {
          filters['data->>mime_type'] = { NOT: 'folder' };
      }

      if (shared === 'true') {
          filters['data->>is_shared'] = 'true';
      }

      if (favorite === 'true') {
          filters['data->>is_favorite'] = 'true';
      }

      const result = await entityService.queryEntities('file', {
          ...filters,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          sortBy: 'created_at',
          sortOrder: 'DESC'
      } as any);

      // Get storage usage
      const storageUsage = await storageService.getStorageUsage(userId, circleId);

      res.json({
        success: true,
        files: result.entities.map(e => ({ id: e.id, ...e.attributes, createdAt: e.createdAt })),
        total: result.total,
        storageUsage
      });
    } catch (error: any) {
      console.error('Get files error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve files',
        details: error.message
      });
    }
  }

  // Get file by ID
  async getFileById(req: any, res: Response) {
    try {
      const { id } = req.params;
      const file = await entityService.getEntity(id);

      if (!file || file.type !== 'file') {
        return res.status(404).json({
          error: 'File not found',
          message: 'The requested file could not be found'
        });
      }

      res.json({
        success: true,
        file: { id: file.id, ...file.attributes, createdAt: file.createdAt }
      });
    } catch (error: any) {
      console.error('Get file error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve file',
        details: error.message
      });
    }
  }

  // Upload file - already uses storageService which we can wrap or modify
  // For now, let's ensure storageService uses entityService
  async uploadFile(req: any, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      // Handle both regular users and admin users
      // Note: authenticateToken middleware sets req.user for both regular and admin users
      // For admin users, req.user.id might be admin_users.id, which storageService will resolve
      let userId: string;
      if (req.admin && req.admin.id) {
        // Admin user authenticated via authenticateAdmin middleware - use admin.id (users.id)
        userId = req.admin.id;
      } else if (req.user && req.user.id) {
        // Regular user or admin user authenticated via authenticateToken middleware
        // storageService will resolve admin_users.id to users.id if needed
        userId = req.user.id;
      } else {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Admin users might not have circleId, use null or undefined
      const circleId = req.user?.circleId || req.user?.applicationId || req.admin?.currentApp?.id || null;

      console.log('[StorageController] Upload file:', {
        userId,
        circleId,
        isAdmin: !!req.admin,
        reqUser: req.user ? { id: req.user.id, type: req.user.type, role: req.user.role } : null,
        reqAdmin: req.admin ? { id: req.admin.id, adminId: req.admin.adminId } : null,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });

      const uploadedFile = await storageService.uploadFile(
        req.file,
        userId,
        circleId
      );

      res.json({
        success: true,
        file: uploadedFile
      });
    } catch (error: any) {
      console.error('[StorageController] Upload error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Update file
  async updateFile(req: any, res: Response) {
    try {
      const { id } = req.params;
      const updated = await entityService.updateEntity(id, { attributes: req.body });

      if (!updated) return res.status(404).json({ success: false, error: 'File not found' });

      res.json({
        success: true,
        file: { id: updated.id, ...updated.attributes }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete file
  async deleteFile(req: any, res: Response) {
    try {
      const { id } = req.params;
      await entityService.deleteEntity(id);
      res.json({ success: true, message: 'File deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Create folder
  async createFolder(req: any, res: Response) {
      try {
          const { name, parentId } = req.body;
          const folder = await entityService.createEntity({
              typeName: 'file',
              ownerId: req.user.id,
              applicationId: req.user.circleId,
              attributes: {
                  original_name: name,
                  mime_type: 'folder',
                  parentId
              }
          });
          res.json({ success: true, folder });
      } catch (error: any) {
          res.status(500).json({ success: false, error: error.message });
      }
  }

  // Get storage stats
  async getStorageStats(req: any, res: Response) {
    try {
      const stats = await storageService.getStorageUsage(req.user.id, req.user.circleId);
      res.json({ success: true, stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Toggle favorite
  async toggleFavorite(req: any, res: Response) {
    try {
      const { id } = req.params;
      const file = await entityService.getEntity(id);
      if (!file) return res.status(404).json({ success: false, error: 'File not found' });
      
      const updated = await entityService.updateEntity(id, {
        attributes: { is_favorite: !file.attributes.is_favorite }
      });
      res.json({ success: true, file: { id: updated?.id, ...updated?.attributes } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Toggle shared
  async toggleShared(req: any, res: Response) {
    try {
      const { id } = req.params;
      const file = await entityService.getEntity(id);
      if (!file) return res.status(404).json({ success: false, error: 'File not found' });
      
      const updated = await entityService.updateEntity(id, {
        attributes: { is_shared: !file.attributes.is_shared }
      });
      res.json({ success: true, file: { id: updated?.id, ...updated?.attributes } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new StorageController();
