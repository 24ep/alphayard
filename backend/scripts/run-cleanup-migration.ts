// Run the cleanup migration
import { PrismaClient } from '../prisma/generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runCleanupMigration() {
    console.log('🗑️  Running cleanup migration to remove unused tables...\n');

    const migrationPath = path.join(__dirname, 'src/migrations/024_remove_unused_tables.sql');
    
    if (!fs.existsSync(migrationPath)) {
        console.error('❌ Migration file not found:', migrationPath);
        process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements and execute
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
        if (statement.toLowerCase().startsWith('drop table')) {
            const tableName = statement.match(/drop table if exists\s+([^\s]+)/i)?.[1] || 'unknown';
            try {
                await prisma.$executeRawUnsafe(statement);
                console.log(`✅ Dropped: ${tableName}`);
                successCount++;
            } catch (error: any) {
                if (error.code === '42P01') {
                    console.log(`⏭️  Skipped (not exists): ${tableName}`);
                    skipCount++;
                } else {
                    console.error(`❌ Failed: ${tableName} - ${error.message}`);
                }
            }
        } else if (statement.toLowerCase().startsWith('comment on')) {
            try {
                await prisma.$executeRawUnsafe(statement);
                console.log(`✅ Updated schema comment`);
            } catch (error: any) {
                console.log(`⚠️  Comment update skipped: ${error.message}`);
            }
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Dropped: ${successCount} tables`);
    console.log(`   ⏭️  Skipped: ${skipCount} tables (didn't exist)`);
    console.log('\n🎉 Cleanup migration completed!');
}

runCleanupMigration()
    .catch(e => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
