
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'bondarys',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
};

if (process.env.DATABASE_URL) {
    poolConfig.connectionString = process.env.DATABASE_URL;
}

const pool = new Pool(poolConfig);

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('🚀 Starting migration for Application Versioning...');

        // Create application_versions table
        await client.query(`
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
            );
        `);
        
        console.log('✅ Created table: application_versions');

        // Initial Data Migration: accessible "current" state as version 1 (Published)
        // Check if there are existing apps and if they have versions
        const { rows: apps } = await client.query('SELECT * FROM public.applications');
        
        for (const app of apps) {
            const { rows: versions } = await client.query('SELECT * FROM public.application_versions WHERE application_id = $1', [app.id]);
            
            if (versions.length === 0) {
                console.log(`Creating initial version for app: ${app.name}`);
                await client.query(`
                    INSERT INTO public.application_versions (application_id, version_number, branding, settings, status, published_at)
                    VALUES ($1, 1, $2, $3, 'published', NOW())
                `, [app.id, app.branding, app.settings]);
                
                // Also create a draft version 2 that is a copy of version 1, for immediate editing
                await client.query(`
                    INSERT INTO public.application_versions (application_id, version_number, branding, settings, status)
                    VALUES ($1, 2, $2, $3, 'draft')
                `, [app.id, app.branding, app.settings]);
            }
        }

        await client.query('COMMIT');
        console.log('🎉 Migration completed successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
