const { PrismaClient } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runSeed() {
    const seedSqlPath = path.join(__dirname, '../src/database/seed.sql');
    const sql = fs.readFileSync(seedSqlPath, 'utf8');

    console.log('🚀 Running seed.sql...');
    try {
        await prisma.$executeRawUnsafe('BEGIN');
        await prisma.$executeRawUnsafe(sql);
        await prisma.$executeRawUnsafe('COMMIT');
        console.log('✅ seed.sql applied successfully!');
    } catch (err) {
        await prisma.$executeRawUnsafe('ROLLBACK');
        console.error('❌ Failed to apply seed.sql:', err);
    } finally {
        await prisma.$disconnect();
    }
}

runSeed();
