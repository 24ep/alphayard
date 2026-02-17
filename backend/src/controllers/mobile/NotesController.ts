import { Request, Response } from 'express';
import notesService from '../../services/notesService';

// Import sub-controllers
import { notesAttachmentsController, NotesAttachmentsController } from './NotesAttachmentsController';
import { notesAdvancedController, NotesAdvancedController } from './NotesAdvancedController';

export class NotesController {
    // Sub-controllers
    private attachments: NotesAttachmentsController = notesAttachmentsController;
    private advanced: NotesAdvancedController = notesAdvancedController;

    // =============================================
    // CORE CRUD OPERATIONS
    // =============================================

    async list(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const circleId = (req as any).circleId;
            
            const { folderId, tags, isPinned, isFavorite, isArchived, search, sortBy, sortOrder, page, limit } = req.query;

            const result = await notesService.list({
                ownerId: userId,
                circleId: circleId as string,
                folderId: folderId as string,
                tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined,
                isPinned: isPinned !== undefined ? isPinned === 'true' : undefined,
                isFavorite: isFavorite !== undefined ? isFavorite === 'true' : undefined,
                isArchived: isArchived !== undefined ? isArchived === 'true' : false,
                search: search as string,
                sortBy: sortBy as 'createdAt' | 'updatedAt' | 'title' | 'pinned',
                sortOrder: sortOrder as 'asc' | 'desc',
                page: page ? parseInt(page as string, 10) : 1,
                limit: limit ? parseInt(limit as string, 10) : 50
            });

            res.json({ 
                success: true, 
                data: result.entities,
                pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages }
            });
        } catch (error: any) {
            console.error('[NotesController] Error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const note = await notesService.getById(req.params.id);
            if (!note) {
                return res.status(404).json({ success: false, error: 'Note not found' });
            }
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const noteData = { ...req.body, userId: (req as any).user.id };
            const note = await notesService.create(noteData);
            res.status(201).json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const note = await notesService.update(req.params.id, req.body);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async remove(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            await notesService.delete(req.params.id, userId);
            res.json({ success: true, message: 'Note deleted' });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // PIN / FAVORITE / ARCHIVE
    // =============================================

    async togglePin(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const note = await notesService.togglePin(req.params.id, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async toggleFavorite(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const note = await notesService.toggleFavorite(req.params.id, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async archive(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const note = await notesService.archive(req.params.id, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async unarchive(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const note = await notesService.unarchive(req.params.id, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // TAGS
    // =============================================

    async addTag(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { tag } = req.body;
            if (!tag) return res.status(400).json({ success: false, error: 'Tag is required' });
            const note = await notesService.addTag(req.params.id, tag, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async removeTag(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { tag } = req.params;
            const note = await notesService.removeTag(req.params.id, tag, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getAllTags(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const tags = await notesService.getAllTags(userId);
            res.json({ success: true, data: tags });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // FOLDERS
    // =============================================

    async getFolders(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const result = await notesService.getFolders(userId);
            res.json({ success: true, data: result.entities });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async createFolder(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { name, color } = req.body;
            if (!name) return res.status(400).json({ success: false, error: 'Folder name is required' });
            const folder = await notesService.createFolder({ name, color, userId });
            res.status(201).json({ success: true, data: folder });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateFolder(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const folder = await notesService.updateFolder(req.params.folderId, req.body, userId);
            res.json({ success: true, data: folder });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async deleteFolder(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            await notesService.deleteFolder(req.params.folderId, userId);
            res.json({ success: true, message: 'Folder deleted' });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async moveToFolder(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { folderId } = req.body;
            const note = await notesService.moveToFolder(req.params.id, folderId, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // CHECKLISTS
    // =============================================

    async addChecklistItem(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { text, order } = req.body;
            if (!text) return res.status(400).json({ success: false, error: 'Text is required' });
            const item = await notesService.addChecklistItem(req.params.id, { text, order }, userId);
            res.status(201).json({ success: true, data: item });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateChecklistItem(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { itemId } = req.params;
            const item = await notesService.updateChecklistItem(req.params.id, itemId, req.body, userId);
            res.json({ success: true, data: item });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async removeChecklistItem(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { itemId } = req.params;
            const note = await notesService.removeChecklistItem(req.params.id, itemId, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async reorderChecklist(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { itemIds } = req.body;
            if (!itemIds || !Array.isArray(itemIds)) return res.status(400).json({ success: false, error: 'itemIds array is required' });
            const note = await notesService.reorderChecklist(req.params.id, itemIds, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // COLOR & DUPLICATE
    // =============================================

    async setColor(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { color } = req.body;
            const note = await notesService.setColor(req.params.id, color, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async duplicate(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const note = await notesService.duplicate(req.params.id, userId);
            res.status(201).json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // ATTACHMENTS (delegated to NotesAttachmentsController)
    // =============================================

    async uploadAttachment(req: Request, res: Response) {
        return this.attachments.uploadAttachment(req, res);
    }

    async addAttachmentToNote(req: Request, res: Response) {
        return this.attachments.addAttachmentToNote(req, res);
    }

    async removeAttachmentFromNote(req: Request, res: Response) {
        return this.attachments.removeAttachmentFromNote(req, res);
    }

    // =============================================
    // SHARING
    // =============================================

    async shareWithCircle(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { circleId, permission } = req.body;
            if (!circleId) return res.status(400).json({ success: false, error: 'circleId is required' });
            const note = await notesService.shareWithCircle(req.params.id, circleId, userId, permission);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async shareWithUser(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { targetUserId, permission } = req.body;
            if (!targetUserId) return res.status(400).json({ success: false, error: 'targetUserId is required' });
            const note = await notesService.shareWithUser(req.params.id, targetUserId, userId, permission);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async unshareWithCircle(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { circleId } = req.params;
            const note = await notesService.unshareWithCircle(req.params.id, circleId, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async unshareWithUser(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { targetUserId } = req.params;
            const note = await notesService.unshareWithUser(req.params.id, targetUserId, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getSharedWithMe(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const result = await notesService.getSharedWithMe(userId);
            res.json({ success: true, data: result.entities });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // REMINDERS
    // =============================================

    async setReminder(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { reminderAt, repeatType } = req.body;
            if (!reminderAt) return res.status(400).json({ success: false, error: 'reminderAt is required' });
            const note = await notesService.setReminder(req.params.id, reminderAt, userId, repeatType);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async clearReminder(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const note = await notesService.clearReminder(req.params.id, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // TRASH
    // =============================================

    async moveToTrash(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const note = await notesService.moveToTrash(req.params.id, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async restoreFromTrash(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const note = await notesService.restoreFromTrash(req.params.id, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getTrash(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const result = await notesService.getTrash(userId);
            res.json({ success: true, data: result.entities });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async emptyTrash(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const result = await notesService.emptyTrash(userId);
            res.json({ success: true, message: `Deleted ${result.deleted} notes` });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async permanentDelete(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            await notesService.permanentDelete(req.params.id, userId);
            res.json({ success: true, message: 'Note permanently deleted' });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // TEMPLATES (delegated to NotesAdvancedController)
    // =============================================

    async getTemplates(req: Request, res: Response) { return this.advanced.getTemplates(req, res); }
    async createTemplate(req: Request, res: Response) { return this.advanced.createTemplate(req, res); }
    async updateTemplate(req: Request, res: Response) { return this.advanced.updateTemplate(req, res); }
    async deleteTemplate(req: Request, res: Response) { return this.advanced.deleteTemplate(req, res); }
    async createFromTemplate(req: Request, res: Response) { return this.advanced.createFromTemplate(req, res); }

    // =============================================
    // NOTE LINKING (delegated to NotesAdvancedController)
    // =============================================

    async linkNotes(req: Request, res: Response) { return this.advanced.linkNotes(req, res); }
    async unlinkNotes(req: Request, res: Response) { return this.advanced.unlinkNotes(req, res); }
    async getLinkedNotes(req: Request, res: Response) { return this.advanced.getLinkedNotes(req, res); }

    // =============================================
    // VERSION HISTORY (delegated to NotesAdvancedController)
    // =============================================

    async saveVersion(req: Request, res: Response) { return this.advanced.saveVersion(req, res); }
    async getVersions(req: Request, res: Response) { return this.advanced.getVersions(req, res); }
    async restoreVersion(req: Request, res: Response) { return this.advanced.restoreVersion(req, res); }

    // =============================================
    // EXPORT (delegated to NotesAdvancedController)
    // =============================================

    async exportToMarkdown(req: Request, res: Response) { return this.advanced.exportToMarkdown(req, res); }
    async exportToJSON(req: Request, res: Response) { return this.advanced.exportToJSON(req, res); }

    // =============================================
    // ENHANCED SEARCH (delegated to NotesAdvancedController)
    // =============================================

    async searchNotes(req: Request, res: Response) { return this.advanced.searchNotes(req, res); }
}

export default new NotesController();
