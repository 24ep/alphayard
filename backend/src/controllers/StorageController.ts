import { Response } from 'express';
import { pool } from '../config/database';
import { storageService } from '../services/storageService';

export class StorageController {
  // Get files with filtering and pagination
  async getFiles(req: any, res: Response) {
    try {
      const { limit = 50, offset = 0, type, shared, favorite, search } = req.query;
      const userId = req.user.id;
      const circleId = req.user.circleId;

      let sql = 'SELECT *, COUNT(*) OVER() as total_count FROM files WHERE circle_id = $1';
      const params: any[] = [circleId];
      let paramIndex = 2;

      // Apply filters
      if (type === 'folders') {
        sql += ` AND mime_type = 'folder'`;
      } else if (type === 'files') {
        sql += ` AND mime_type != 'folder'`;
      }

      if (shared === 'true') {
        sql += ` AND is_shared = true`;
      }

      if (favorite === 'true') {
        sql += ` AND is_favorite = true`;
      }

      if (search) {
        sql += ` AND original_name ILIKE $${paramIndex++}`;
        params.push(`%${search}%`);
      }

      sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const { rows } = await pool.query(sql, params);
      const totalCount = rows.length > 0 ? parseInt(rows[0].total_count) : 0;

      // Get storage usage
      const storageUsage = await storageService.getStorageUsage(userId, circleId);

      res.json({
        success: true,
        files: rows,
        total: totalCount,
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
      const circleId = req.user.circleId;

      const { rows } = await pool.query(
        'SELECT * FROM files WHERE id = $1 AND circle_id = $2',
        [id, circleId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: 'File not found',
          message: 'The requested file could not be found'
        });
      }

      res.json({
        success: true,
        file: rows[0]
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

  // Upload file
  async uploadFile(req: any, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file provided',
          message: 'Please select a file to upload'
        });
      }

      const userId = req.user.id;
      const circleId = req.user.circleId;

      // Special handling for Admin/System uploads (no circleId)
      if (!circleId && (req.user.role === 'admin' || req.user.type === 'admin')) {
        const fileExtension = req.file.originalname.split('.').pop() || 'png';
        const fileName = `system/${req.user.id}/${Date.now()}_${req.file.originalname}`;
        const url = await storageService.uploadRawBuffer(
          req.file.buffer, 
          fileName, 
          req.file.mimetype
        );

        if (!url) throw new Error('Failed to upload system file');

        return res.json({
          success: true,
          message: 'System file uploaded successfully',
          file: {
            id: 'system-' + Date.now(),
            url: url,
            originalName: req.file.originalname,
            fileName: fileName,
            mimeType: req.file.mimetype,
            size: req.file.size
          }
        });
      }

      const uploadedFile = await storageService.uploadFile(
        req.file,
        userId,
        circleId,
        {
          generateThumbnails: true,
          compressImages: true
        }
      );

      // Use proxy URL for persistence
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
      uploadedFile.url = `${baseUrl}/api/v1/storage/proxy/${uploadedFile.id}`;

      res.json({
        success: true,
        message: 'File uploaded successfully',
        file: uploadedFile
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }

  // Update file
  async updateFile(req: any, res: Response) {
    try {
      const { id } = req.params;
      const circleId = req.user.circleId;
      const updates = req.body;

      // Build update sql
      const updateFields: string[] = ['updated_at = NOW()'];
      const params: any[] = [];
      let paramIndex = 1;

      // Allow updating common fields
      const allowedUpdates = ['original_name', 'is_shared', 'is_favorite', 'metadata'];
      for (const field of allowedUpdates) {
        if (updates[field] !== undefined) {
          updateFields.push(`"${field}" = $${paramIndex++}`);
          params.push(updates[field]);
        }
      }

      if (params.length === 0) {
        return res.status(400).json({ error: 'No update fields provided' });
      }

      params.push(id, circleId);
      const { rows } = await pool.query(
        `UPDATE files SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex++} AND circle_id = $${paramIndex} 
         RETURNING *`,
        params
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: 'File not found',
          message: 'The requested file could not be found'
        });
      }

      res.json({
        success: true,
        message: 'File updated successfully',
        file: rows[0]
      });
    } catch (error: any) {
      console.error('Update file error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update file',
        details: error.message
      });
    }
  }

  // Delete file
  async deleteFile(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const success = await storageService.deleteFile(id, userId);

      if (success) {
        res.json({
          success: true,
          message: 'File deleted successfully'
        });
      } else {
        res.status(404).json({
          error: 'File not found',
          message: 'The requested file could not be found or deleted'
        });
      }
    } catch (error: any) {
      console.error('Delete file error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete file',
        details: error.message
      });
    }
  }

  // Get storage statistics
  async getStorageStats(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const circleId = req.user.circleId;

      const storageUsage = await storageService.getStorageUsage(userId, circleId);

      res.json({
        success: true,
        stats: storageUsage
      });
    } catch (error: any) {
      console.error('Get storage stats error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve storage statistics',
        details: error.message
      });
    }
  }

  // Create folder
  async createFolder(req: any, res: Response) {
    try {
      const { name, parentId, description } = req.body;
      const userId = req.user.id;
      const circleId = req.user.circleId;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Folder name is required'
        });
      }

      const { rows } = await pool.query(
        `INSERT INTO files (
          original_name, file_name, mime_type, size, url, path, circle_id, uploaded_by, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          name.trim(), 
          name.trim(), 
          'folder', 
          0, 
          '', 
          parentId ? `/${parentId}/${name.trim()}` : `/${name.trim()}`,
          circleId, 
          userId, 
          { description: description || '' }
        ]
      );

      res.json({
        success: true,
        message: 'Folder created successfully',
        folder: rows[0]
      });
    } catch (error: any) {
      console.error('Create folder error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create folder',
        details: error.message
      });
    }
  }

  // Toggle file favorite status
  async toggleFavorite(req: any, res: Response) {
    try {
      const { id } = req.params;
      const circleId = req.user.circleId;

      const { rows } = await pool.query(
        'UPDATE files SET is_favorite = NOT is_favorite, updated_at = NOW() WHERE id = $1 AND circle_id = $2 RETURNING *',
        [id, circleId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: 'File not found',
          message: 'The requested file could not be found'
        });
      }

      const updatedFile = rows[0];
      res.json({
        success: true,
        message: `File ${updatedFile.is_favorite ? 'added to' : 'removed from'} favorites`,
        file: updatedFile
      });
    } catch (error: any) {
      console.error('Toggle favorite error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update favorite status',
        details: error.message
      });
    }
  }

  // Toggle file shared status
  async toggleShared(req: any, res: Response) {
    try {
      const { id } = req.params;
      const circleId = req.user.circleId;

      const { rows } = await pool.query(
        'UPDATE files SET is_shared = NOT is_shared, updated_at = NOW() WHERE id = $1 AND circle_id = $2 RETURNING *',
        [id, circleId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: 'File not found',
          message: 'The requested file could not be found'
        });
      }

      const updatedFile = rows[0];
      res.json({
        success: true,
        message: `File ${updatedFile.is_shared ? 'shared' : 'unshared'} successfully`,
        file: updatedFile
      });
    } catch (error: any) {
      console.error('Toggle shared error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update shared status',
        details: error.message
      });
    }
  }
}

export default new StorageController();
