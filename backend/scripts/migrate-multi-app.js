const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating applications table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.applications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                branding JSONB DEFAULT '{}'::jsonb,
                settings JSONB DEFAULT '{}'::jsonb,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        console.log('Adding application_id to families...');
        await client.query(`
            ALTER TABLE public.families 
            ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.applications(id);
        `);

        console.log('Creating default application...');
        const res = await client.query(`
            INSERT INTO public.applications (name, slug, description)
            VALUES ('Default App', 'default-app', 'The initial default application')
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
        `);
        
        const defaultAppId = res.rows[0].id;
        console.log(`Default App ID: ${defaultAppId}`);

        console.log('Mapping existing families to default application...');
        await client.query(`
            UPDATE public.families SET application_id = $1 WHERE application_id IS NULL;
        `, [defaultAppId]);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
