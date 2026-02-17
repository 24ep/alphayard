import entityService from '../EntityService';

/**
 * Helper class for note linking operations
 */
export class NotesLinkingHelper {
    private updateNote: (id: string, attributes: any) => Promise<any>;

    constructor(updateNote: (id: string, attributes: any) => Promise<any>) {
        this.updateNote = updateNote;
    }

    async linkNotes(sourceNoteId: string, targetNoteId: string, userId: string, linkType: string = 'related') {
        const sourceNote = await entityService.getEntity(sourceNoteId);
        const targetNote = await entityService.getEntity(targetNoteId);
        
        if (!sourceNote || !targetNote) throw new Error('Note not found');
        if (sourceNote.ownerId !== userId) throw new Error('Unauthorized');

        const links = sourceNote.attributes?.links || [];
        const existingLink = links.find((l: any) => l.noteId === targetNoteId);
        
        if (!existingLink) {
            links.push({
                noteId: targetNoteId,
                title: targetNote.attributes?.title || 'Untitled',
                linkType,
                linkedAt: new Date().toISOString()
            });
        }

        // Also add backlink to target note
        const backlinks = targetNote.attributes?.backlinks || [];
        if (!backlinks.find((l: any) => l.noteId === sourceNoteId)) {
            backlinks.push({
                noteId: sourceNoteId,
                title: sourceNote.attributes?.title || 'Untitled',
                linkedAt: new Date().toISOString()
            });
            await this.updateNote(targetNoteId, { backlinks });
        }

        return this.updateNote(sourceNoteId, { links });
    }

    async unlinkNotes(sourceNoteId: string, targetNoteId: string, userId: string) {
        const sourceNote = await entityService.getEntity(sourceNoteId);
        const targetNote = await entityService.getEntity(targetNoteId);
        
        if (!sourceNote) throw new Error('Note not found');
        if (sourceNote.ownerId !== userId) throw new Error('Unauthorized');

        // Remove link from source
        const links = (sourceNote.attributes?.links || []).filter(
            (l: any) => l.noteId !== targetNoteId
        );

        // Remove backlink from target
        if (targetNote) {
            const backlinks = (targetNote.attributes?.backlinks || []).filter(
                (l: any) => l.noteId !== sourceNoteId
            );
            await this.updateNote(targetNoteId, { backlinks });
        }

        return this.updateNote(sourceNoteId, { links });
    }

    async getLinkedNotes(noteId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');

        const links = note.attributes?.links || [];
        const backlinks = note.attributes?.backlinks || [];

        return { links, backlinks };
    }
}
