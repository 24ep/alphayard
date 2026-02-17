import entityService from '../EntityService';
import { getBondaryApplicationId } from '../../utils/appHelper';

/**
 * Helper class for note sharing operations
 */
export class NotesSharingHelper {
    private updateNote: (id: string, attributes: any) => Promise<any>;

    constructor(updateNote: (id: string, attributes: any) => Promise<any>) {
        this.updateNote = updateNote;
    }

    async shareWithCircle(noteId: string, circleId: string, userId: string, permission: 'view' | 'edit' = 'view') {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');

        const sharedWith = note.attributes?.sharedWith || [];
        const existingShare = sharedWith.find((s: any) => s.circleId === circleId);
        
        if (existingShare) {
            existingShare.permission = permission;
            existingShare.updatedAt = new Date().toISOString();
        } else {
            sharedWith.push({
                circleId,
                permission,
                sharedAt: new Date().toISOString(),
                sharedBy: userId
            });
        }

        return this.updateNote(noteId, { sharedWith });
    }

    async shareWithUser(noteId: string, targetUserId: string, userId: string, permission: 'view' | 'edit' = 'view') {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');

        const sharedWithUsers = note.attributes?.sharedWithUsers || [];
        const existingShare = sharedWithUsers.find((s: any) => s.userId === targetUserId);
        
        if (existingShare) {
            existingShare.permission = permission;
            existingShare.updatedAt = new Date().toISOString();
        } else {
            sharedWithUsers.push({
                userId: targetUserId,
                permission,
                sharedAt: new Date().toISOString(),
                sharedBy: userId
            });
        }

        return this.updateNote(noteId, { sharedWithUsers });
    }

    async unshareWithCircle(noteId: string, circleId: string, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');

        const sharedWith = (note.attributes?.sharedWith || []).filter(
            (s: any) => s.circleId !== circleId
        );

        return this.updateNote(noteId, { sharedWith });
    }

    async unshareWithUser(noteId: string, targetUserId: string, userId: string) {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        if (note.ownerId !== userId) throw new Error('Unauthorized');

        const sharedWithUsers = (note.attributes?.sharedWithUsers || []).filter(
            (s: any) => s.userId !== targetUserId
        );

        return this.updateNote(noteId, { sharedWithUsers });
    }

    async getSharedWithMe(userId: string) {
        const applicationId = await getBondaryApplicationId();
        const result = await entityService.queryEntities('note', { applicationId } as any);
        
        const sharedNotes = result.entities.filter(note => {
            const sharedWithUsers = note.attributes?.sharedWithUsers || [];
            return sharedWithUsers.some((s: any) => s.userId === userId);
        });

        return { entities: sharedNotes, total: sharedNotes.length };
    }
}
