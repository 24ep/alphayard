import { Request, Response } from 'express';
import notesService from '../../services/notesService';
import storageService from '../../services/storageService';

/**
 * Controller for handling note attachments
 */
export class NotesAttachmentsController {
    /**
     * Upload attachment for notes - returns URL to be used when creating/updating notes
     * POST /api/notes/upload
     */
    async uploadAttachment(req: Request, res: Response) {
        try {
            const file = (req as any).file;
            if (!file) {
                return res.status(400).json({ success: false, error: 'No file provided' });
            }

            const userId = (req as any).user?.id || 'system';

            // Upload to S3/MinIO
            const uploaded = await storageService.uploadFile(file, userId, null, {
                folder: 'notes/attachments'
            });

            if (!uploaded || !uploaded.url) {
                return res.status(500).json({ success: false, error: 'Upload failed' });
            }

            // Determine file type
            const fileType = this.determineFileType(file.mimetype);

            res.json({
                success: true,
                data: {
                    id: uploaded.id,
                    url: uploaded.url,
                    type: fileType,
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size
                }
            });
        } catch (error: any) {
            console.error('[NotesAttachmentsController] Upload error:', error);
            res.status(500).json({ success: false, error: error.message || 'Upload failed' });
        }
    }

    /**
     * Add attachment to an existing note
     * POST /api/notes/:id/attachments
     */
    async addAttachmentToNote(req: Request, res: Response) {
        try {
            const noteId = req.params.id;
            const file = (req as any).file;
            
            if (!file) {
                return res.status(400).json({ success: false, error: 'No file provided' });
            }

            const userId = (req as any).user?.id || 'system';

            // Upload to S3/MinIO
            const uploaded = await storageService.uploadFile(file, userId, null, {
                folder: `notes/${noteId}/attachments`
            });

            if (!uploaded || !uploaded.url) {
                return res.status(500).json({ success: false, error: 'Upload failed' });
            }

            const fileType = this.determineFileType(file.mimetype);

            const attachment = {
                id: uploaded.id,
                url: uploaded.url,
                type: fileType as 'image' | 'video' | 'audio' | 'pdf' | 'file',
                fileName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                uploadedAt: new Date().toISOString()
            };

            // Add attachment to note
            const updatedNote = await notesService.addAttachment(noteId, attachment);

            res.json({
                success: true,
                data: {
                    note: updatedNote,
                    attachment
                }
            });
        } catch (error: any) {
            console.error('[NotesAttachmentsController] Add attachment error:', error);
            res.status(500).json({ success: false, error: error.message || 'Failed to add attachment' });
        }
    }

    /**
     * Remove attachment from a note
     * DELETE /api/notes/:id/attachments/:attachmentId
     */
    async removeAttachmentFromNote(req: Request, res: Response) {
        try {
            const { id: noteId, attachmentId } = req.params;
            const userId = (req as any).user?.id;

            // Remove attachment from note and delete from S3
            const updatedNote = await notesService.removeAttachment(noteId, attachmentId, userId);

            res.json({
                success: true,
                data: updatedNote,
                message: 'Attachment removed'
            });
        } catch (error: any) {
            console.error('[NotesAttachmentsController] Remove attachment error:', error);
            res.status(500).json({ success: false, error: error.message || 'Failed to remove attachment' });
        }
    }

    private determineFileType(mimeType: string): 'image' | 'video' | 'audio' | 'pdf' | 'file' {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType === 'application/pdf') return 'pdf';
        return 'file';
    }
}

export const notesAttachmentsController = new NotesAttachmentsController();
