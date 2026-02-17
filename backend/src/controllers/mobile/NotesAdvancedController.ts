import { Request, Response } from 'express';
import notesService from '../../services/notesService';

/**
 * Controller for advanced note features: templates, linking, versioning, export, search
 */
export class NotesAdvancedController {
    // =============================================
    // TEMPLATES
    // =============================================

    async getTemplates(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const result = await notesService.getTemplates(userId);
            res.json({ success: true, data: result.entities });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async createTemplate(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { name, content, checklist } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, error: 'Template name is required' });
            }
            const template = await notesService.createTemplate({ name, content, checklist, userId });
            res.status(201).json({ success: true, data: template });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateTemplate(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const template = await notesService.updateTemplate(req.params.templateId, req.body, userId);
            res.json({ success: true, data: template });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async deleteTemplate(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            await notesService.deleteTemplate(req.params.templateId, userId);
            res.json({ success: true, message: 'Template deleted' });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async createFromTemplate(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { overrides } = req.body;
            const note = await notesService.createFromTemplate(req.params.templateId, userId, overrides);
            res.status(201).json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // NOTE LINKING
    // =============================================

    async linkNotes(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { targetNoteId, linkType } = req.body;
            if (!targetNoteId) {
                return res.status(400).json({ success: false, error: 'targetNoteId is required' });
            }
            const note = await notesService.linkNotes(req.params.id, targetNoteId, userId, linkType);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async unlinkNotes(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { targetNoteId } = req.params;
            const note = await notesService.unlinkNotes(req.params.id, targetNoteId, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getLinkedNotes(req: Request, res: Response) {
        try {
            const result = await notesService.getLinkedNotes(req.params.id);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // VERSION HISTORY
    // =============================================

    async saveVersion(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const note = await notesService.saveVersion(req.params.id, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getVersions(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const versions = await notesService.getVersions(req.params.id, userId);
            res.json({ success: true, data: versions });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async restoreVersion(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { versionId } = req.params;
            const note = await notesService.restoreVersion(req.params.id, versionId, userId);
            res.json({ success: true, data: note });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // EXPORT
    // =============================================

    async exportToMarkdown(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const markdown = await notesService.exportToMarkdown(req.params.id, userId);
            res.setHeader('Content-Type', 'text/markdown');
            res.setHeader('Content-Disposition', `attachment; filename="note-${req.params.id}.md"`);
            res.send(markdown);
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async exportToJSON(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const json = await notesService.exportToJSON(req.params.id, userId);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="note-${req.params.id}.json"`);
            res.json(json);
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // =============================================
    // ENHANCED SEARCH
    // =============================================

    async searchNotes(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { q, inContent, inTags, inChecklist, includeShared, includeArchived } = req.query;
            
            if (!q) {
                return res.status(400).json({ success: false, error: 'Search query (q) is required' });
            }

            const result = await notesService.searchNotes(userId, q as string, {
                inContent: inContent !== 'false',
                inTags: inTags !== 'false',
                inChecklist: inChecklist !== 'false',
                includeShared: includeShared === 'true',
                includeArchived: includeArchived === 'true'
            });

            res.json({ success: true, data: result.entities, total: result.total });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const notesAdvancedController = new NotesAdvancedController();
