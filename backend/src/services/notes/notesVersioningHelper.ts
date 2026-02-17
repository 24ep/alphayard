import entityService from '../EntityService';

/**
 * Helper class for note version history operations
 */
export class NotesVersioningHelper {
    private updateNote: (id: string, attributes: any) => Promise<any>;

    constructor(updateNote: (id: string, attributes: any) => Promise<any>) {
        this.updateNote = updateNote;
    }

    async saveVersion(noteId: string, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');

        const versions = note.attributes?.versions || [];
        const newVersion = {
            id: `v_${Date.now()}`,
            title: note.attributes?.title,
            content: note.attributes?.content,
            checklist: note.attributes?.checklist,
            savedAt: new Date().toISOString(),
            savedBy: userId
        };

        // Keep last 50 versions
        versions.unshift(newVersion);
        if (versions.length > 50) {
            versions.pop();
        }

        return this.updateNote(noteId, { versions });
    }

    async getVersions(noteId: string, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');

        return note.attributes?.versions || [];
    }

    async restoreVersion(noteId: string, versionId: string, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');

        const versions = note.attributes?.versions || [];
        const version = versions.find((v: any) => v.id === versionId);
        
        if (!version) throw new Error('Version not found');

        // Save current state as a version before restoring
        await this.saveVersion(noteId, userId);

        // Restore the selected version
        return this.updateNote(noteId, {
            title: version.title,
            content: version.content,
            checklist: version.checklist,
            restoredFrom: versionId,
            restoredAt: new Date().toISOString()
        });
    }
}
