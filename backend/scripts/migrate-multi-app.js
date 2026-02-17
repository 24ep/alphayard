const { PrismaClient, Prisma } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    try {
        await prisma.$executeRawUnsafe('BEGIN');

        console.log('Creating applications table...');
        await prisma.$executeRawUnsafe(`
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
            )
        `);

        console.log('Adding application_id to families...');
        await prisma.$executeRawUnsafe(`
            ALTER TABLE public.families 
            ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.applications(id)
        `);

        console.log('Creating default application...');
        const res = await prisma.$queryRaw(Prisma.sql`
            INSERT INTO public.applications (name, slug, description)
            VALUES (${'Default App'}, ${'default-app'}, ${'The initial default application'})
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        `);
        
        const defaultAppId = res[0].id;
        console.log(`Default App ID: ${defaultAppId}`);

        console.log('Mapping existing families to default application...');
        await prisma.$executeRaw(Prisma.sql`
            UPDATE public.families SET application_id = ${defaultAppId}::uuid WHERE application_id IS NULL
        `);

        await prisma.$executeRawUnsafe('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await prisma.$executeRawUnsafe('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
