
const { PrismaClient, Prisma } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    try {
        await prisma.$executeRawUnsafe('BEGIN');
        console.log('🚀 Starting migration for Application Versioning...');

        // Create application_versions table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS public.application_versions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
                version_number INTEGER NOT NULL,
                branding JSONB DEFAULT '{}'::jsonb,
                settings JSONB DEFAULT '{}'::jsonb,
                status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
                created_by UUID, -- Optional: ID of user who created this version
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                published_at TIMESTAMP WITH TIME ZONE,
                unique(application_id, version_number)
            )
        `);
        
        console.log('✅ Created table: application_versions');

        // Initial Data Migration: accessible "current" state as version 1 (Published)
        // Check if there are existing apps and if they have versions
        const apps = await prisma.$queryRawUnsafe('SELECT * FROM public.applications');
        
        for (const app of apps) {
            const versions = await prisma.$queryRaw(Prisma.sql`SELECT * FROM public.application_versions WHERE application_id = ${app.id}::uuid`);
            
            if (versions.length === 0) {
                console.log(`Creating initial version for app: ${app.name}`);
                await prisma.$executeRaw(Prisma.sql`
                    INSERT INTO public.application_versions (application_id, version_number, branding, settings, status, published_at)
                    VALUES (${app.id}::uuid, ${1}, ${JSON.stringify(app.branding)}::jsonb, ${JSON.stringify(app.settings)}::jsonb, ${'published'}, NOW())
                `);
                
                // Also create a draft version 2 that is a copy of version 1, for immediate editing
                await prisma.$executeRaw(Prisma.sql`
                    INSERT INTO public.application_versions (application_id, version_number, branding, settings, status)
                    VALUES (${app.id}::uuid, ${2}, ${JSON.stringify(app.branding)}::jsonb, ${JSON.stringify(app.settings)}::jsonb, ${'draft'})
                `);
            }
        }

        await prisma.$executeRawUnsafe('COMMIT');
        console.log('🎉 Migration completed successfully!');
    } catch (err) {
        await prisma.$executeRawUnsafe('ROLLBACK');
        console.error('❌ Migration failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
