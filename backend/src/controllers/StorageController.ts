import { Response } from 'express';
import { supabase } from '../config/supabase';
import { storageService } from '../services/storageService';

export class StorageController {
  // Get files with filtering and pagination
  async getFiles(req: any, res: Response) {
    try {
      const { limit = 50, offset = 0, type, shared, favorite, search } = req.query;
      const userId = req.user.id;
      const familyId = req.user.familyId;

      let query = supabase
        .from('files')
        .select('*', { count: 'exact' })
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

      // Apply filters
      if (type === 'folders') {
        query = query.eq('mime_type', 'folder');
      } else if (type === 'files') {
        query = query.neq('mime_type', 'folder');
      }

      if (shared === 'true') {
        query = query.eq('is_shared', true);
      }

      if (favorite === 'true') {
        query = query.eq('is_favorite', true);
      }

      if (search) {
        query = query.ilike('original_name', `%${search}%`);
      }

      const { data: files, error, count } = await query;

      if (error) {
        throw error;
      }

      // Get storage usage
      const storageUsage = await storageService.getStorageUsage(userId, familyId);

      res.json({
        success: true,
        files: files || [],
        total: count || 0,
        storageUsage
      });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve files'
      });
    }
  }

  // Get file by ID
  async getFileById(req: any, res: Response) {
    try {
      const { id } = req.params;
      const familyId = req.user.familyId;

      const { data: file, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', id)
        .eq('family_id', familyId)
        .single();

      if (error || !file) {
        return res.status(404).json({
          error: 'File not found',
          message: 'The requested file could not be found'
        });
      }

      res.json({
        success: true,
        file
      });
    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve file'
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
      const familyId = req.user.familyId;
      const { isShared = false, metadata = {} } = req.body;

      const uploadedFile = await storageService.uploadFile(
        req.file,
        userId,
        familyId,
        {
          generateThumbnails: true,
          compressImages: true
        }
      );

      // Update file metadata in database
      const { error: updateError } = await supabase
        .from('files')
        .update({
          is_shared: isShared === 'true' || isShared === true,
          metadata: { ...metadata }
        })
        .eq('id', uploadedFile.id);

      if (updateError) {
        console.error('Failed to update file metadata:', updateError);
      }

      res.json({
        success: true,
        message: 'File uploaded successfully',
        file: uploadedFile
      });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to upload file'
      });
    }
  }

  // Update file
  async updateFile(req: any, res: Response) {
    try {
      const { id } = req.params;
      const familyId = req.user.familyId;
      const updates = req.body;

      // Check if file exists and user has access
      const { data: file, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', id)
        .eq('family_id', familyId)
        .single();

      if (fetchError || !file) {
        return res.status(404).json({
          error: 'File not found',
          message: 'The requested file could not be found'
        });
      }

      // Update file
      const { data: updatedFile, error: updateError } = await supabase
        .from('files')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('family_id', familyId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      res.json({
        success: true,
        message: 'File updated successfully',
        file: updatedFile
      });
    } catch (error) {
      console.error('Update file error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update file'
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
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete file'
      });
    }
  }

  // Get storage statistics
  async getStorageStats(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const familyId = req.user.familyId;

      const storageUsage = await storageService.getStorageUsage(userId, familyId);

      res.json({
        success: true,
        stats: storageUsage
      });
    } catch (error) {
      console.error('Get storage stats error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve storage statistics'
      });
    }
  }

  // Create folder
  async createFolder(req: any, res: Response) {
    try {
      const { name, parentId, description } = req.body;
      const userId = req.user.id;
      const familyId = req.user.familyId;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Folder name is required'
        });
      }

      const { data: folder, error } = await supabase
        .from('files')
        .insert({
          original_name: name.trim(),
          file_name: name.trim(),
          mime_type: 'folder',
          size: 0,
          url: '',
          path: parentId ? `/${parentId}/${name.trim()}` : `/${name.trim()}`,
          family_id: familyId,
          uploaded_by: userId,
          metadata: { description: description || '' }
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: 'Folder created successfully',
        folder
      });
    } catch (error) {
      console.error('Create folder error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create folder'
      });
    }
  }

  // Toggle file favorite status
  async toggleFavorite(req: any, res: Response) {
    try {
      const { id } = req.params;
      const familyId = req.user.familyId;

      const { data: file, error: fetchError } = await supabase
        .from('files')
        .select('is_favorite')
        .eq('id', id)
        .eq('family_id', familyId)
        .single();

      if (fetchError || !file) {
        return res.status(404).json({
          error: 'File not found',
          message: 'The requested file could not be found'
        });
      }

      const { data: updatedFile, error: updateError } = await supabase
        .from('files')
        .update({
          is_favorite: !file.is_favorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('family_id', familyId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      res.json({
        success: true,
        message: `File ${updatedFile.is_favorite ? 'added to' : 'removed from'} favorites`,
        file: updatedFile
      });
    } catch (error) {
      console.error('Toggle favorite error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update favorite status'
      });
    }
  }

  // Toggle file shared status
  async toggleShared(req: any, res: Response) {
    try {
      const { id } = req.params;
      const familyId = req.user.familyId;

      const { data: file, error: fetchError } = await supabase
        .from('files')
        .select('is_shared')
        .eq('id', id)
        .eq('family_id', familyId)
        .single();

      if (fetchError || !file) {
        return res.status(404).json({
          error: 'File not found',
          message: 'The requested file could not be found'
        });
      }

      const { data: updatedFile, error: updateError } = await supabase
        .from('files')
        .update({
          is_shared: !file.is_shared,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('family_id', familyId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      res.json({
        success: true,
        message: `File ${updatedFile.is_shared ? 'shared' : 'unshared'} successfully`,
        file: updatedFile
      });
    } catch (error) {
      console.error('Toggle shared error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update shared status'
      });
    }
  }
}

export default new StorageController();
