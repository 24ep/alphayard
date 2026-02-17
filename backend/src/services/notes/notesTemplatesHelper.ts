import entityService from '../EntityService';
import { getBondaryApplicationId } from '../../utils/appHelper';

/**
 * Helper class for note templates operations
 */
export class NotesTemplatesHelper {
    private createNote: (data: any) => Promise<any>;

    constructor(createNote: (data: any) => Promise<any>) {
        this.createNote = createNote;
    }

    async createTemplate(data: { name: string; content: string; checklist?: any[]; userId: string }) {
        const applicationId = await getBondaryApplicationId();
        
        return entityService.createEntity({
            typeName: 'note_template',
            applicationId,
            ownerId: data.userId,
            attributes: {
                name: data.name,
                content: data.content,
                checklist: data.checklist || [],
                isBuiltIn: false
            }
        });
    }

    async getTemplates(userId: string) {
        const applicationId = await getBondaryApplicationId();
        
        // Get user's templates
        const userTemplates = await entityService.queryEntities('note_template', {
            ownerId: userId,
            applicationId
        } as any);

        // Get built-in templates (system templates)
        const builtInTemplates = await entityService.queryEntities('note_template', {
            applicationId,
            filters: { isBuiltIn: true }
        } as any);

        return {
            entities: [...builtInTemplates.entities, ...userTemplates.entities],
            total: builtInTemplates.total + userTemplates.total
        };
    }

    async createFromTemplate(templateId: string, userId: string, overrides?: any) {
        const template = await entityService.getEntity(templateId);
        if (!template) throw new Error('Template not found');

        return this.createNote({
            userId,
            title: overrides?.title || template.attributes?.name || 'Untitled',
            content: template.attributes?.content || '',
            checklist: template.attributes?.checklist || [],
            ...overrides
        });
    }

    async updateTemplate(templateId: string, attributes: any, userId: string) {
        const template = await entityService.getEntity(templateId);
        if (!template) throw new Error('Template not found');
        if (template.ownerId !== userId) throw new Error('Unauthorized');
        if (template.attributes?.isBuiltIn) throw new Error('Cannot modify built-in templates');

        return entityService.updateEntity(templateId, {
            attributes: { ...template.attributes, ...attributes }
        });
    }

    async deleteTemplate(templateId: string, userId: string) {
        const template = await entityService.getEntity(templateId);
        if (!template) throw new Error('Template not found');
        if (template.ownerId !== userId) throw new Error('Unauthorized');
        if (template.attributes?.isBuiltIn) throw new Error('Cannot delete built-in templates');

        return entityService.deleteEntity(templateId);
    }
}
