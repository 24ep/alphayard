import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface IApplication {
    id: string;
    name: string;
    slug: string;
    description?: string;
    branding: any;
    settings: any;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class ApplicationModel {
    private data: IApplication;

    constructor(data: IApplication) {
        this.data = data;
    }

    get id() { return this.data.id; }
    get name() { return this.data.name; }
    get slug() { return this.data.slug; }
    get branding() { return this.data.branding; }
    get settings() { return this.data.settings; }

    static async findAll(): Promise<IApplication[]> {
        const res = await query('SELECT * FROM public.applications WHERE is_active = true ORDER BY name ASC');
        return res.rows.map(row => this.mapRow(row));
    }

    static async findById(id: string): Promise<IApplication | null> {
        const res = await query('SELECT * FROM public.applications WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        return this.mapRow(res.rows[0]);
    }

    static async findBySlug(slug: string): Promise<IApplication | null> {
        const res = await query('SELECT * FROM public.applications WHERE slug = $1', [slug]);
        if (res.rows.length === 0) return null;
        return this.mapRow(res.rows[0]);
    }

    static async create(data: Partial<IApplication>): Promise<IApplication> {
        const id = data.id || uuidv4();
        const res = await query(`
            INSERT INTO public.applications (id, name, slug, description, branding, settings)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            id,
            data.name,
            data.slug,
            data.description || '',
            JSON.stringify(data.branding || {}),
            JSON.stringify(data.settings || {})
        ]);
        return this.mapRow(res.rows[0]);
    }

    static async update(id: string, data: Partial<IApplication>): Promise<IApplication | null> {
        const sets: string[] = [];
        const params: any[] = [id];
        let idx = 2;

        if (data.name) { sets.push(`name = $${idx++}`); params.push(data.name); }
        if (data.slug) { sets.push(`slug = $${idx++}`); params.push(data.slug); }
        if (data.description !== undefined) { sets.push(`description = $${idx++}`); params.push(data.description); }
        if (data.branding) { sets.push(`branding = $${idx++}`); params.push(JSON.stringify(data.branding)); }
        if (data.settings) { sets.push(`settings = $${idx++}`); params.push(JSON.stringify(data.settings)); }
        if (data.isActive !== undefined) { sets.push(`is_active = $${idx++}`); params.push(data.isActive); }

        if (sets.length === 0) return this.findById(id);

        sets.push(`updated_at = NOW()`);
        
        const res = await query(`
            UPDATE public.applications SET ${sets.join(', ')} WHERE id = $1 RETURNING *
        `, params);

        if (res.rows.length === 0) return null;
        return this.mapRow(res.rows[0]);
    }

    // Versioning Support
    static async getVersions(applicationId: string): Promise<any[]> {
        const res = await query(
            'SELECT * FROM public.application_versions WHERE application_id = $1 ORDER BY version_number DESC',
            [applicationId]
        );
        return res.rows;
    }

    static async getVersion(applicationId: string, versionId: string): Promise<any | null> {
        const res = await query(
            'SELECT * FROM public.application_versions WHERE application_id = $1 AND id = $2',
            [applicationId, versionId]
        );
        return res.rows[0] || null;
    }

    static async getLatestDraft(applicationId: string): Promise<any | null> {
        const res = await query(
            "SELECT * FROM public.application_versions WHERE application_id = $1 AND status = 'draft' ORDER BY version_number DESC LIMIT 1",
            [applicationId]
        );
        return res.rows[0] || null;
    }

    static async createVersion(applicationId: string, data: { branding: any, settings: any, status: 'draft' | 'published' }): Promise<any> {
        // Get next version number
        const maxRes = await query('SELECT MAX(version_number) as max_ver FROM application_versions WHERE application_id = $1', [applicationId]);
        const nextVer = (maxRes.rows[0].max_ver || 0) + 1;

        const res = await query(`
            INSERT INTO public.application_versions (application_id, version_number, branding, settings, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            applicationId,
            nextVer,
            JSON.stringify(data.branding || {}),
            JSON.stringify(data.settings || {}),
            data.status
        ]);
        return res.rows[0];
    }

    static async updateVersion(versionId: string, data: Partial<{ branding: any, settings: any, status: string }>): Promise<any> {
        const sets: string[] = [];
        const params: any[] = [versionId];
        let idx = 2;

        if (data.branding) { sets.push(`branding = $${idx++}`); params.push(JSON.stringify(data.branding)); }
        if (data.settings) { sets.push(`settings = $${idx++}`); params.push(JSON.stringify(data.settings)); }
        if (data.status) { sets.push(`status = $${idx++}`); params.push(data.status); }

        if (sets.length === 0) return null;

        const res = await query(`
            UPDATE public.application_versions SET ${sets.join(', ')} WHERE id = $1 RETURNING *
        `, params);
        
        return res.rows[0];
    }

    static async publishVersion(applicationId: string, versionId: string): Promise<void> {
        // 1. Get the version data
        const verRes = await query('SELECT * FROM application_versions WHERE id = $1', [versionId]);
        if (verRes.rows.length === 0) throw new Error('Version not found');
        const version = verRes.rows[0];

        // 2. Update main application table (Live State)
        await this.update(applicationId, {
            branding: version.branding,
            settings: version.settings
        });

        // 3. Update version status to published
        await query(
            "UPDATE public.application_versions SET status = 'published', published_at = NOW() WHERE id = $1",
            [versionId]
        );

        // 4. Archive older published versions (optional, but good practice)
        await query(
            "UPDATE public.application_versions SET status = 'archived' WHERE application_id = $1 AND status = 'published' AND id != $2",
            [applicationId, versionId]
        );
    }

    private static mapRow(row: any): IApplication {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            branding: row.branding,
            settings: row.settings,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
