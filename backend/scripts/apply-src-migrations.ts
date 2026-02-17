// Migration runner for src/migrations folder
import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Prisma } from '../../prisma/generated/prisma/client';

dotenv.config();

async function applySrcMigrations() {
    const migrationsDir = path.join(__dirname, '../src/migrations');
    
    if (!fs.existsSync(migrationsDir)) {
        console.error(`Migrations directory not found: ${migrationsDir}`);
        return;
    }

    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort((a, b) => {
            const numA = parseInt(a.split('_')[0]);
            const numB = parseInt(b.split('_')[0]);
            if (isNaN(numA) || isNaN(numB)) return a.localeCompare(b);
            return numA - numB;
        });

    console.log(`Found ${files.length} migrations in src/migrations.`);

    try {
        // Use a different history table for src migrations if needed, 
        // or just rely on the same one but ensure no collisions.
        // Let's use src_migration_history to be safe.
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS src_migration_history (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;

        for (const file of files) {
            const rows = await prisma.$queryRaw<Array<{ name: string }>>`
                SELECT name FROM src_migration_history WHERE name = ${file}
            `;
            
            if (rows.length > 0) {
                console.log(`Skipping ${file} (already applied)`);
                continue;
            }

            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            console.log(`Starting transaction for ${file}...`);
            try {
                await prisma.$transaction(async (tx) => {
                    await tx.$executeRaw(Prisma.sql([sql]));
                    await tx.$executeRaw`INSERT INTO src_migration_history (name) VALUES (${file})`;
                });
                console.log(`✅ ${file} applied successfully.`);
            } catch (err: any) {
                console.error(`❌ Failed to apply ${file}: ${err.message}`);
                if (err.detail) console.error(`   Detail: ${err.detail}`);
                throw err;
            }
        }
        console.log('All src migrations processed.');
    } finally {
        await prisma.$disconnect();
    }
}

applySrcMigrations().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
