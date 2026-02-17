import entityService from '../EntityService';

/**
 * Helper class for note export operations
 */
export class NotesExportHelper {
    async exportToMarkdown(noteId: string, userId: string): Promise<string> {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        
        // Check access
        const hasAccess = note.ownerId === userId || 
            (note.attributes?.sharedWithUsers || []).some((s: any) => s.userId === userId);
        if (!hasAccess) throw new Error('Unauthorized');

        const attrs = note.attributes || {};
        let markdown = '';

        // Title
        markdown += `# ${attrs.title || 'Untitled'}\n\n`;

        // Metadata
        if (attrs.tags?.length) {
            markdown += `**Tags:** ${attrs.tags.join(', ')}\n\n`;
        }

        // Content
        if (attrs.content) {
            markdown += `${attrs.content}\n\n`;
        }

        // Checklist
        if (attrs.checklist?.length) {
            markdown += `## Checklist\n\n`;
            for (const item of attrs.checklist) {
                markdown += `- [${item.completed ? 'x' : ' '}] ${item.text}\n`;
            }
            markdown += '\n';
        }

        // Attachments
        if (attrs.attachments?.length) {
            markdown += `## Attachments\n\n`;
            for (const att of attrs.attachments) {
                if (att.type === 'image') {
                    markdown += `![${att.fileName}](${att.url})\n`;
                } else {
                    markdown += `- [${att.fileName}](${att.url})\n`;
                }
            }
        }

        return markdown;
    }

    async exportToJSON(noteId: string, userId: string): Promise<object> {
        const note = await entityService.getEntity(noteId);
        if (!note) throw new Error('Note not found');
        
        const hasAccess = note.ownerId === userId || 
            (note.attributes?.sharedWithUsers || []).some((s: any) => s.userId === userId);
        if (!hasAccess) throw new Error('Unauthorized');

        return {
            id: note.id,
            title: note.attributes?.title,
            content: note.attributes?.content,
            tags: note.attributes?.tags,
            checklist: note.attributes?.checklist,
            attachments: note.attributes?.attachments,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            exportedAt: new Date().toISOString()
        };
    }
}
