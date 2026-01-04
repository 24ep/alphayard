import express from 'express';
import http from 'http';
import https from 'https';
import { authenticateToken, requireFamilyMember } from '../middleware/auth';
import { storageService } from '../services/storageService';
import StorageController from '../controllers/StorageController';
import { pool } from '../config/database';

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

        // Look up the file URL from database
        const { rows } = await pool.query(
            'SELECT url, mime_type, file_name FROM files WHERE id = $1',
            [fileId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = rows[0];
        const imageUrl = file.url;

        // Fetch the image from MinIO/S3
        const imageData = await fetchUrl(imageUrl);

        // Set appropriate headers for cross-origin image loading
        res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

        // Send the image data
        res.send(imageData);
    } catch (error: any) {
        console.error('Image proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});

// All other routes require authentication and family membership
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
