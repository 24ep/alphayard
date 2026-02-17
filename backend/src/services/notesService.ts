import entityService from './EntityService';
import storageService from './storageService';
import { getBondaryApplicationId } from '../utils/appHelper';

// Import helper modules
import { NotesSharingHelper } from './notes/notesSharingHelper';
import { NotesTemplatesHelper } from './notes/notesTemplatesHelper';
import { NotesVersioningHelper } from './notes/notesVersioningHelper';
import { NotesLinkingHelper } from './notes/notesLinkingHelper';
import { NotesExportHelper } from './notes/notesExportHelper';

interface NoteAttachment {
    id: string;
    url: string;
    type: 'image' | 'video' | 'audio' | 'pdf' | 'file';
    fileName: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
}

interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
    completedAt?: string;
    order: number;
}

interface NoteQueryOptions {
    ownerId: string;
    circleId?: string;
    folderId?: string;
    tags?: string[];
    isPinned?: boolean;
    isFavorite?: boolean;
    isArchived?: boolean;
    search?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'pinned';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

class NotesService {
    // Initialize helpers
    private sharingHelper: NotesSharingHelper;
    private templatesHelper: NotesTemplatesHelper;
    private versioningHelper: NotesVersioningHelper;
    private linkingHelper: NotesLinkingHelper;
    private exportHelper: NotesExportHelper;

    constructor() {
        // Bind the update method for helpers
        const boundUpdate = this.update.bind(this);
        const boundCreate = this.create.bind(this);

        this.sharingHelper = new NotesSharingHelper(boundUpdate);
        this.templatesHelper = new NotesTemplatesHelper(boundCreate);
        this.versioningHelper = new NotesVersioningHelper(boundUpdate);
        this.linkingHelper = new NotesLinkingHelper(boundUpdate);
        this.exportHelper = new NotesExportHelper();
    }

    // =============================================
    // CORE CRUD OPERATIONS
    // =============================================

    async list(options: NoteQueryOptions) {
        const { 
            ownerId, folderId, tags, isPinned, isFavorite, 
            isArchived = false, search,
            sortBy = 'updatedAt', sortOrder = 'desc',
            page = 1, limit = 50
        } = options;

        const applicationId = await getBondaryApplicationId();
        
        console.log('[NotesService] Querying notes - ownerId:', ownerId, 'options:', { folderId, tags, isPinned, isFavorite, isArchived, search });
        
        const result = await entityService.queryEntities('note', {
            ownerId,
            applicationId
        } as any);
        
        let notes = result.entities;

        // Apply filters
        notes = notes.filter(note => {
            const attrs = note.attributes || {};
            
            if (isArchived !== undefined) {
                if (isArchived && !attrs.isArchived) return false;
                if (!isArchived && attrs.isArchived) return false;
            }
            if (folderId && attrs.folderId !== folderId) return false;
            if (isPinned !== undefined && attrs.isPinned !== isPinned) return false;
            if (isFavorite !== undefined && attrs.isFavorite !== isFavorite) return false;
            if (tags && tags.length > 0) {
                const noteTags = attrs.tags || [];
                if (!tags.every(tag => noteTags.includes(tag))) return false;
            }
            if (search) {
                const searchLower = search.toLowerCase();
                const titleMatch = (attrs.title || '').toLowerCase().includes(searchLower);
                const contentMatch = (attrs.content || '').toLowerCase().includes(searchLower);
                const tagMatch = (attrs.tags || []).some((t: string) => t.toLowerCase().includes(searchLower));
                if (!titleMatch && !contentMatch && !tagMatch) return false;
            }
            return true;
        });

        // Sort notes
        notes.sort((a, b) => {
            const attrsA = a.attributes || {};
            const attrsB = b.attributes || {};

            if (sortBy === 'pinned' || sortBy === 'updatedAt' || sortBy === 'createdAt') {
                if (attrsA.isPinned && !attrsB.isPinned) return -1;
                if (!attrsA.isPinned && attrsB.isPinned) return 1;
            }

            let comparison = 0;
            switch (sortBy) {
                case 'title':
                    comparison = (attrsA.title || '').localeCompare(attrsB.title || '');
                    break;
                case 'createdAt':
                    comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                    break;
                default:
                    comparison = new Date(a.updatedAt || a.createdAt || 0).getTime() - new Date(b.updatedAt || b.createdAt || 0).getTime();
                    break;
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });

        const total = notes.length;
        const offset = (page - 1) * limit;
        const paginatedNotes = notes.slice(offset, offset + limit);

        console.log('[NotesService] Query result - total:', total, 'returned:', paginatedNotes.length);
        
        return { entities: paginatedNotes, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getById(id: string) {
        return entityService.getEntity(id);
    }

    async create(data: any) {
        const { userId, user_id, attachments, checklist, ...attributes } = data;
        const applicationId = await getBondaryApplicationId();
        
        const noteAttributes = {
            ...attributes,
            attachments: attachments || [],
            checklist: checklist || [],
            tags: attributes.tags || [],
            isPinned: attributes.isPinned || false,
            isFavorite: attributes.isFavorite || false,
            isArchived: false,
            folderId: attributes.folderId || null,
            color: attributes.color || null,
        };
        
        return entityService.createEntity({
            typeName: 'note',
            applicationId,
            ownerId: userId || user_id,
            attributes: noteAttributes
        });
    }

    async update(id: string, attributes: any) {
        const existingNote = await entityService.getEntity(id);
        if (!existingNote) throw new Error('Note not found');

        const updatedAttributes = {
            ...existingNote.attributes,
            ...attributes,
            updatedAt: new Date().toISOString()
        };

        return entityService.updateEntity(id, { attributes: updatedAttributes });
    }

    async delete(id: string, userId?: string) {
        try {
            const note = await entityService.getEntity(id);
            if (note && note.attributes?.attachments) {
                const ownerId = userId || note.ownerId || 'system';
                for (const attachment of note.attributes.attachments) {
                    try {
                        await storageService.deleteFile(attachment.id, ownerId);
                    } catch (err) {
                        console.error('[NotesService] Failed to delete attachment:', attachment.id, err);
                    }
                }
            }
        } catch (err) {
            console.error('[NotesService] Error getting note for cleanup:', err);
        }
        return entityService.deleteEntity(id);
    }

    // =============================================
    // PIN / FAVORITE / ARCHIVE
    // =============================================

    async togglePin(id: string, userId: string) {
        const note = await entityService.getEntity(id);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        const isPinned = !note.attributes?.isPinned;
        return this.update(id, { isPinned, pinnedAt: isPinned ? new Date().toISOString() : null });
    }

    async toggleFavorite(id: string, userId: string) {
        const note = await entityService.getEntity(id);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        const isFavorite = !note.attributes?.isFavorite;
        return this.update(id, { isFavorite, favoritedAt: isFavorite ? new Date().toISOString() : null });
    }

    async archive(id: string, userId: string) {
        const note = await entityService.getEntity(id);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        return this.update(id, { isArchived: true, archivedAt: new Date().toISOString() });
    }

    async unarchive(id: string, userId: string) {
        const note = await entityService.getEntity(id);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        return this.update(id, { isArchived: false, archivedAt: null });
    }

    // =============================================
    // TAGS
    // =============================================

    async addTag(id: string, tag: string, userId: string) {
        const note = await entityService.getEntity(id);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        const tags: string[] = note.attributes?.tags || [];
        if (!tags.includes(tag)) tags.push(tag);
        return this.update(id, { tags });
    }

    async removeTag(id: string, tag: string, userId: string) {
        const note = await entityService.getEntity(id);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        const tags: string[] = (note.attributes?.tags || []).filter((t: string) => t !== tag);
        return this.update(id, { tags });
    }

    async getAllTags(ownerId: string): Promise<string[]> {
        const result = await this.list({ ownerId, isArchived: undefined });
        const tagSet = new Set<string>();
        for (const note of result.entities) {
            const tags = note.attributes?.tags || [];
            tags.forEach((tag: string) => tagSet.add(tag));
        }
        return Array.from(tagSet).sort();
    }

    // =============================================
    // FOLDERS
    // =============================================

    async moveToFolder(id: string, folderId: string | null, userId: string) {
        const note = await entityService.getEntity(id);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        return this.update(id, { folderId });
    }

    async createFolder(data: { name: string; color?: string; userId: string }) {
        const applicationId = await getBondaryApplicationId();
        return entityService.createEntity({
            typeName: 'note_folder',
            applicationId,
            ownerId: data.userId,
            attributes: { name: data.name, color: data.color || null }
        });
    }

    async getFolders(ownerId: string) {
        const applicationId = await getBondaryApplicationId();
        return entityService.queryEntities('note_folder', { ownerId, applicationId } as any);
    }

    async updateFolder(id: string, attributes: any, userId: string) {
        const folder = await entityService.getEntity(id);
        if (!folder) throw new Error('Folder not found');
        if (folder.ownerId !== userId) throw new Error('Unauthorized');
        return entityService.updateEntity(id, { attributes: { ...folder.attributes, ...attributes } });
    }

    async deleteFolder(id: string, userId: string) {
        const folder = await entityService.getEntity(id);
        if (!folder) throw new Error('Folder not found');
        if (folder.ownerId !== userId) throw new Error('Unauthorized');
        const notes = await this.list({ ownerId: userId, folderId: id, isArchived: undefined });
        for (const note of notes.entities) {
            await this.update(note.id, { folderId: null });
        }
        return entityService.deleteEntity(id);
    }

    // =============================================
    // CHECKLISTS
    // =============================================

    async addChecklistItem(noteId: string, item: { text: string; order?: number }, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        const checklist: ChecklistItem[] = note.attributes?.checklist || [];
        const newItem: ChecklistItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: item.text,
            completed: false,
            order: item.order ?? checklist.length
        };
        checklist.push(newItem);
        await this.update(noteId, { checklist });
        return newItem;
    }

    async updateChecklistItem(noteId: string, itemId: string, updates: Partial<ChecklistItem>, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        const checklist: ChecklistItem[] = note.attributes?.checklist || [];
        const itemIndex = checklist.findIndex(i => i.id === itemId);
        if (itemIndex === -1) throw new Error('Checklist item not found');
        checklist[itemIndex] = {
            ...checklist[itemIndex],
            ...updates,
            completedAt: updates.completed ? new Date().toISOString() : undefined
        };
        await this.update(noteId, { checklist });
        return checklist[itemIndex];
    }

    async removeChecklistItem(noteId: string, itemId: string, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        const checklist: ChecklistItem[] = (note.attributes?.checklist || []).filter((i: ChecklistItem) => i.id !== itemId);
        return this.update(noteId, { checklist });
    }

    async reorderChecklist(noteId: string, itemIds: string[], userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        const checklist: ChecklistItem[] = note.attributes?.checklist || [];
        const reordered = itemIds.map((id, index) => {
            const item = checklist.find(i => i.id === id);
            return item ? { ...item, order: index } : null;
        }).filter(Boolean) as ChecklistItem[];
        return this.update(noteId, { checklist: reordered });
    }

    // =============================================
    // COLOR & DUPLICATE
    // =============================================

    async setColor(id: string, color: string | null, userId: string) {
        const note = await entityService.getEntity(id);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        return this.update(id, { color });
    }

    async duplicate(id: string, userId: string) {
        const note = await entityService.getEntity(id);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        const { attachments, ...attrs } = note.attributes || {};
        return this.create({
            userId,
            ...attrs,
            title: `${attrs.title || 'Untitled'} (Copy)`,
            isPinned: false,
            isFavorite: false,
            attachments: [],
        });
    }

    // =============================================
    // REMINDERS
    // =============================================

    async setReminder(noteId: string, reminderAt: string, userId: string, repeatType?: 'none' | 'daily' | 'weekly' | 'monthly') {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        const reminder = { reminderAt, repeatType: repeatType || 'none', createdAt: new Date().toISOString(), isActive: true };
        return this.update(noteId, { reminder });
    }

    async clearReminder(noteId: string, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        return this.update(noteId, { reminder: null });
    }

    async getNotesWithDueReminders() {
        const applicationId = await getBondaryApplicationId();
        const result = await entityService.queryEntities('note', { applicationId } as any);
        const now = new Date();
        return result.entities.filter(note => {
            const reminder = note.attributes?.reminder;
            if (!reminder || !reminder.isActive) return false;
            return new Date(reminder.reminderAt) <= now;
        });
    }

    // =============================================
    // TRASH / SOFT DELETE
    // =============================================

    async moveToTrash(noteId: string, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        return this.update(noteId, { 
            isTrashed: true, 
            trashedAt: new Date().toISOString(),
            autoDeleteAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    }

    async restoreFromTrash(noteId: string, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        return this.update(noteId, { isTrashed: false, trashedAt: null, autoDeleteAt: null });
    }

    async getTrash(userId: string) {
        const result = await this.list({ ownerId: userId, isArchived: undefined });
        const trashedNotes = result.entities.filter(note => note.attributes?.isTrashed === true);
        return { entities: trashedNotes, total: trashedNotes.length };
    }

    async emptyTrash(userId: string) {
        const trash = await this.getTrash(userId);
        for (const note of trash.entities) {
            await this.delete(note.id, userId);
        }
        return { deleted: trash.entities.length };
    }

    async permanentDelete(noteId: string, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');
        if (!note.attributes?.isTrashed) throw new Error('Note must be in trash first');
        return this.delete(noteId, userId);
    }

    // =============================================
    // SHARING (delegated to helper)
    // =============================================

    async shareWithCircle(noteId: string, circleId: string, userId: string, permission: 'view' | 'edit' = 'view') {
        return this.sharingHelper.shareWithCircle(noteId, circleId, userId, permission);
    }

    async shareWithUser(noteId: string, targetUserId: string, userId: string, permission: 'view' | 'edit' = 'view') {
        return this.sharingHelper.shareWithUser(noteId, targetUserId, userId, permission);
    }

    async unshareWithCircle(noteId: string, circleId: string, userId: string) {
        return this.sharingHelper.unshareWithCircle(noteId, circleId, userId);
    }

    async unshareWithUser(noteId: string, targetUserId: string, userId: string) {
        return this.sharingHelper.unshareWithUser(noteId, targetUserId, userId);
    }

    async getSharedWithMe(userId: string) {
        return this.sharingHelper.getSharedWithMe(userId);
    }

    // =============================================
    // TEMPLATES (delegated to helper)
    // =============================================

    async createTemplate(data: { name: string; content: string; checklist?: any[]; userId: string }) {
        return this.templatesHelper.createTemplate(data);
    }

    async getTemplates(userId: string) {
        return this.templatesHelper.getTemplates(userId);
    }

    async createFromTemplate(templateId: string, userId: string, overrides?: any) {
        return this.templatesHelper.createFromTemplate(templateId, userId, overrides);
    }

    async updateTemplate(templateId: string, attributes: any, userId: string) {
        return this.templatesHelper.updateTemplate(templateId, attributes, userId);
    }

    async deleteTemplate(templateId: string, userId: string) {
        return this.templatesHelper.deleteTemplate(templateId, userId);
    }

    // =============================================
    // NOTE LINKING (delegated to helper)
    // =============================================

    async linkNotes(sourceNoteId: string, targetNoteId: string, userId: string, linkType: string = 'related') {
        return this.linkingHelper.linkNotes(sourceNoteId, targetNoteId, userId, linkType);
    }

    async unlinkNotes(sourceNoteId: string, targetNoteId: string, userId: string) {
        return this.linkingHelper.unlinkNotes(sourceNoteId, targetNoteId, userId);
    }

    async getLinkedNotes(noteId: string) {
        return this.linkingHelper.getLinkedNotes(noteId);
    }

    // =============================================
    // VERSION HISTORY (delegated to helper)
    // =============================================

    async saveVersion(noteId: string, userId: string) {
        return this.versioningHelper.saveVersion(noteId, userId);
    }

    async getVersions(noteId: string, userId: string) {
        return this.versioningHelper.getVersions(noteId, userId);
    }

    async restoreVersion(noteId: string, versionId: string, userId: string) {
        return this.versioningHelper.restoreVersion(noteId, versionId, userId);
    }

    // =============================================
    // EXPORT (delegated to helper)
    // =============================================

    async exportToMarkdown(noteId: string, userId: string): Promise<string> {
        return this.exportHelper.exportToMarkdown(noteId, userId);
    }

    async exportToJSON(noteId: string, userId: string): Promise<object> {
        return this.exportHelper.exportToJSON(noteId, userId);
    }

    // =============================================
    // SEARCH (Enhanced)
    // =============================================

    async searchNotes(userId: string, query: string, options?: {
        inContent?: boolean;
        inTags?: boolean;
        inChecklist?: boolean;
        includeShared?: boolean;
        includeArchived?: boolean;
    }) {
        const { inContent = true, inTags = true, inChecklist = true, includeShared = true, includeArchived = false } = options || {};
        const result = await this.list({ ownerId: userId, isArchived: includeArchived ? undefined : false });
        const queryLower = query.toLowerCase();

        let notes = result.entities.filter(note => {
            if (note.attributes?.isTrashed) return false;
            const attrs = note.attributes || {};
            if ((attrs.title || '').toLowerCase().includes(queryLower)) return true;
            if (inContent && (attrs.content || '').toLowerCase().includes(queryLower)) return true;
            if (inTags && (attrs.tags || []).some((t: string) => t.toLowerCase().includes(queryLower))) return true;
            if (inChecklist && (attrs.checklist || []).some((item: any) => item.text.toLowerCase().includes(queryLower))) return true;
            return false;
        });

        if (includeShared) {
            const sharedNotes = await this.getSharedWithMe(userId);
            const matchingShared = sharedNotes.entities.filter(note => {
                const attrs = note.attributes || {};
                if ((attrs.title || '').toLowerCase().includes(queryLower)) return true;
                if (inContent && (attrs.content || '').toLowerCase().includes(queryLower)) return true;
                return false;
            });
            notes = [...notes, ...matchingShared];
        }

        return { entities: notes, total: notes.length };
    }

    // =============================================
    // ATTACHMENTS
    // =============================================

    async addAttachment(noteId: string, attachment: NoteAttachment) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        const attachments: NoteAttachment[] = note.attributes?.attachments || [];
        attachments.push(attachment);
        return entityService.updateEntity(noteId, { attributes: { ...note.attributes, attachments } });
    }

    async removeAttachment(noteId: string, attachmentId: string, userId?: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (userId && note.ownerId !== userId) throw new Error('Unauthorized: You can only modify your own notes');

        const attachments: NoteAttachment[] = note.attributes?.attachments || [];
        const attachmentIndex = attachments.findIndex(a => a.id === attachmentId);
        if (attachmentIndex === -1) throw new Error('Attachment not found');

        const ownerId = userId || note.ownerId || 'system';
        try {
            await storageService.deleteFile(attachmentId, ownerId);
        } catch (err) {
            console.error('[NotesService] Failed to delete attachment from S3:', attachmentId, err);
        }

        attachments.splice(attachmentIndex, 1);
        return entityService.updateEntity(noteId, { attributes: { ...note.attributes, attachments } });
    }
}

export default new NotesService();
