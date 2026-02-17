#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../src/prisma/generated/prisma');
const prisma = new PrismaClient();

// Load root .env
try {
    require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
} catch (_) { }

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set in .env file');
        process.exit(1);
    }

    console.log('🔗 Connecting to database...');

    const migrationPath = path.join(__dirname, '..', 'src', 'migrations', '021_create_events_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration: 021_create_events_table.sql');
    console.log('   Creating table: events');

    try {
        await prisma.$executeRawUnsafe(sql);
        console.log('✅ Migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration error:', err.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
