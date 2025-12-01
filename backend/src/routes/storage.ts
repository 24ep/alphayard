import express from 'express';
import { authenticateToken, requireFamilyMember } from '../middleware/auth';
import { storageService } from '../services/storageService';
import StorageController from '../controllers/StorageController';

const router = express.Router();

// All routes require authentication and hourse membership
router.use(authenticateToken as any);
router.use(requireFamilyMember as any);

// Get files
router.get('/files', StorageController.getFiles);

// Get file by ID
router.get('/files/:id', StorageController.getFileById);

// Upload file
router.post('/upload', storageService.getMulterConfig().single('file'), StorageController.uploadFile);

// Update file
router.put('/files/:id', StorageController.updateFile);

// Delete file
router.delete('/files/:id', StorageController.deleteFile);

// Get storage statistics
router.get('/stats', StorageController.getStorageStats);

// Create folder
router.post('/folders', StorageController.createFolder);

// Toggle file favorite status
router.patch('/files/:id/favorite', StorageController.toggleFavorite);

// Toggle file shared status
router.patch('/files/:id/shared', StorageController.toggleShared);

export default router;
