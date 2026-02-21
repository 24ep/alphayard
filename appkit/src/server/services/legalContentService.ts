import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface LegalDocument {
    id: string;
    title: string;
    content: string;
    type: 'privacy-policy' | 'terms-of-service';
    version: string;
    lastUpdated: Date;
    isActive: boolean;
}

/**
 * Legal Content Service
 * 
 * Manages legal documents like privacy policy and terms of service.
 * For simplicity, this implementation uses file-based storage.
 */
class LegalContentService {
    private documentsPath: string;

    constructor() {
        this.documentsPath = join(__dirname, '../../../legal');
    }

    async getDocument(type: 'privacy-policy' | 'terms-of-service'): Promise<LegalDocument | null> {
        try {
            const filePath = join(this.documentsPath, `${type}.md`);
            const content = readFileSync(filePath, 'utf-8');
            
            // Extract metadata from content
            const lines = content.split('\n');
            const title = lines.find(line => line.startsWith('# '))?.replace('# ', '') || type;
            
            return {
                id: type,
                title,
                content,
                type,
                version: '1.0',
                lastUpdated: new Date(),
                isActive: true
            };
        } catch (error) {
            console.error(`Failed to load ${type}:`, error);
            return null;
        }
    }

    async getAllDocuments(): Promise<LegalDocument[]> {
        const documents: LegalDocument[] = [];
        
        const privacyPolicy = await this.getDocument('privacy-policy');
        if (privacyPolicy) documents.push(privacyPolicy);
        
        const termsOfService = await this.getDocument('terms-of-service');
        if (termsOfService) documents.push(termsOfService);
        
        return documents;
    }

    async updateDocument(idOrType: string, content: string, adminId?: string): Promise<LegalDocument | null> {
        const type = idOrType as 'privacy-policy' | 'terms-of-service';
        try {
            const filePath = join(this.documentsPath, `${type}.md`);
            writeFileSync(filePath, content, 'utf-8');
            
            return this.getDocument(type);
        } catch (error) {
            console.error(`Failed to update ${type}:`, error);
            return null;
        }
    }

    async getDocumentById(id: string): Promise<LegalDocument | null> {
        if (id === 'privacy-policy' || id === 'terms-of-service') {
            return this.getDocument(id);
        }
        return null;
    }

    async getDocumentBySlug(slug: string): Promise<LegalDocument | null> {
        // For now, treat slug as type
        return this.getDocument(slug as 'privacy-policy' | 'terms-of-service');
    }

    async createDocument(data: any, adminId?: string): Promise<LegalDocument | null> {
        // For simplicity, just update existing document
        const type = data.type as 'privacy-policy' | 'terms-of-service';
        return this.updateDocument(type, data.content);
    }

    async getDeveloperDocBySlug(slug: string): Promise<LegalDocument | null> {
        // For now, treat developer docs the same as legal docs
        return this.getDocumentBySlug(slug);
    }

    async getAllDeveloperDocs(): Promise<LegalDocument[]> {
        // For now, return the same documents
        return this.getAllDocuments();
    }

    async createDeveloperDoc(data: any, adminId?: string): Promise<LegalDocument | null> {
        // For now, treat developer docs the same as legal docs
        return this.createDocument(data, adminId);
    }

    async deleteDocument(id: string): Promise<boolean> {
        try {
            const filePath = join(this.documentsPath, `${id}.md`);
            // Write an empty placeholder to indicate deletion without removing the file
            writeFileSync(filePath, `# ${id}\n\n*This document has been removed.*\n`, 'utf-8');
            return true;
        } catch (error) {
            console.error(`Failed to delete document ${id}:`, error);
            return false;
        }
    }

    async publishDocument(id: string): Promise<LegalDocument | null> {
        // For file-based storage, publishing means the document is already live
        return this.getDocumentById(id);
    }

    async archiveDocument(id: string): Promise<LegalDocument | null> {
        // For file-based storage, prepend an archived notice to the content
        const doc = await this.getDocumentById(id);
        if (doc) {
            const archivedContent = `> **ARCHIVED** - This document has been archived.\n\n${doc.content}`;
            await this.updateDocument(id, archivedContent);
        }
        return this.getDocumentById(id);
    }

    async deleteDeveloperDoc(id: string): Promise<boolean> {
        // For now, treat developer docs the same as legal docs
        return this.deleteDocument(id);
    }

    async updateDeveloperDoc(id: string, data: any, adminId?: string): Promise<LegalDocument | null> {
        // For now, treat developer docs the same as legal docs
        return this.updateDocument(id, data.content, adminId);
    }
}

export default new LegalContentService();
