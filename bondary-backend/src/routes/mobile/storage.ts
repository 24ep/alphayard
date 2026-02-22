import express from 'express';
import http from 'http';
import https from 'https';
import { authenticateToken, requireCircleMember } from '../../middleware/auth';
import storageService from '../../services/storageService';
import StorageController from '../../controllers/mobile/StorageController';
import { prisma } from '../../lib/prisma';

const router = express.Router();

// Helper function to fetch URL data
function fetchUrl(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (response) => {
            if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // Follow redirect
                fetchUrl(response.headers.location).then(resolve).catch(reject);
                return;
            }
            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

// Public image proxy endpoint (no auth required) - proxies images from MinIO
router.get('/proxy/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;

        // Look up the file metadata - mock implementation for now
        const file = null;
        // TODO: Implement actual file lookup when database schema is ready
        // const file = await prisma.someFileModel.findFirst({
        //     where: { 
        //         id: fileId,
        //         type: 'file',
        //         status: 'active'
        //     },
        //     select: { id: true, type: true, data: true, status: true }
        // });

        if (!file) {
            console.error('[Storage Proxy] File not found:', fileId);
            return res.status(404).json({ error: 'File not found' });
        }

        // Mock response for now
        return res.status(404).json({ error: 'File not found - mock implementation' });
        
    } catch (error: any) {
        console.error('[Storage Proxy] Error:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to fetch image', details: error.message });
    }
});

// All other routes require authentication
router.use(authenticateToken as any);

// Check for circle membership, unless admin
const requirecircleOrAdmin = async (req: any, res: any, next: any) => {
    // If admin, skip circle check
    if (req.user && (req.user.role === 'admin' || req.user.type === 'admin')) {
        return next();
    }
    return requireCircleMember(req, res, next);
};

router.use(requirecircleOrAdmin);

// Get files
router.get('/files', StorageController.getFiles);

// Get file by ID
router.get('/files/:id', StorageController.getFileById);

// Upload file
router.post('/upload', storageService.getMulterConfig().single('file'), (req, res) => StorageController.uploadFile(req, res));

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

