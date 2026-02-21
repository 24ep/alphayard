import { prisma } from '../lib/prisma';

export interface Application {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    domain?: string;
    branding?: any;
    isActive: boolean;
    settings: any;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateApplicationData {
    name: string;
    displayName: string;
    description?: string;
    domain?: string;
    isActive?: boolean;
    settings?: any;
}

export interface UpdateApplicationData {
    displayName?: string;
    description?: string;
    domain?: string;
    isActive?: boolean;
    settings?: any;
}

/**
 * Application Model
 * 
 * Handles database operations for applications.
 */
class ApplicationModel {
    async create(data: CreateApplicationData): Promise<Application> {
        const application = await prisma.application.create({
            data: {
                name: data.name,
                slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: data.description,
                isActive: data.isActive !== undefined ? data.isActive : true,
                settings: data.settings || {}
            }
        });

        return this.mapRowToApplication(application);
    }

    async findById(id: string): Promise<Application | null> {
        const application = await prisma.application.findUnique({
            where: { id }
        });

        if (!application) return null;
        return this.mapRowToApplication(application);
    }

    async findByName(name: string): Promise<Application | null> {
        const application = await prisma.application.findFirst({
            where: { name }
        });

        if (!application) return null;
        return this.mapRowToApplication(application);
    }

    async findAll(page: number = 1, limit: number = 20): Promise<{
        applications: Application[];
        total: number;
        page: number;
        limit: number;
    }> {
        const offset = (page - 1) * limit;

        // Get total count and applications in parallel
        const [total, applications] = await Promise.all([
            prisma.application.count(),
            prisma.application.findMany({
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit
            })
        ]);

        return {
            applications: applications.map(this.mapRowToApplication),
            total,
            page,
            limit
        };
    }

    async update(id: string, data: UpdateApplicationData): Promise<Application | null> {
        const updateData: any = {};

        if (data.displayName !== undefined) {
            updateData.displayName = data.displayName;
        }
        if (data.description !== undefined) {
            updateData.description = data.description;
        }
        if (data.domain !== undefined) {
            updateData.domain = data.domain;
        }
        if (data.isActive !== undefined) {
            updateData.isActive = data.isActive;
        }
        if (data.settings !== undefined) {
            updateData.settings = data.settings;
        }

        if (Object.keys(updateData).length === 0) {
            return this.findById(id);
        }

        const application = await prisma.application.update({
            where: { id },
            data: updateData
        });

        return this.mapRowToApplication(application);
    }

    async delete(id: string): Promise<boolean> {
        try {
            await prisma.application.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async getVersions(id: string): Promise<any[]> {
        const result = await prisma.$queryRaw<any[]>`
            SELECT cv.* FROM public.content_versions cv
            JOIN public.content_pages cp ON cv.page_id = cp.id
            WHERE cp.slug = ${id}
            ORDER BY cv.version_number DESC
        `;
        return result;
    }

    async createVersion(id: string, data: any): Promise<any> {
        const result = await prisma.$queryRaw<any[]>`
            INSERT INTO public.content_versions (
                id, page_id, version_number, components, author_id, commit_message, created_at
            )
            VALUES (
                gen_random_uuid()::uuid,
                (SELECT id FROM public.content_pages WHERE slug = ${id}),
                ${data.versionNumber},
                ${JSON.stringify(data.components || [])}::jsonb,
                ${data.authorId || null}::uuid,
                ${data.commitMessage || null},
                NOW()
            )
            RETURNING *
        `;
        return result[0];
    }

    async updateVersion(versionId: string, data: any): Promise<any> {
        const result = await prisma.$queryRaw<any[]>`
            UPDATE public.content_versions
            SET components = ${JSON.stringify(data.components)}::jsonb,
                commit_message = ${data.commitMessage || null}
            WHERE id = ${versionId}::uuid
            RETURNING *
        `;
        return result[0];
    }

    async publishVersion(id: string, versionId: string): Promise<void> {
        const versionRows = await prisma.$queryRaw<any[]>`
            SELECT * FROM public.content_versions WHERE id = ${versionId}::uuid
        `;

        const version = versionRows[0];
        if (version) {
            await prisma.$queryRaw<any[]>`
                UPDATE public.content_pages
                SET status = 'published',
                    version_number = ${version.version_number},
                    components = ${JSON.stringify(version.components || [])}::jsonb,
                    updated_at = NOW()
                WHERE id = ${version.page_id}::uuid
            `;
        }
    }

    private mapRowToApplication(row: any): Application {
        return {
            id: row.id,
            name: row.name,
            displayName: row.displayName,
            description: row.description,
            domain: row.domain,
            branding: row.branding || {},
            isActive: row.isActive,
            settings: row.settings || {},
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        };
    }
}

export default new ApplicationModel();
export { ApplicationModel };
