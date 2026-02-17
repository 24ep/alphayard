const { PrismaClient } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  try {
    console.log('🚀 Starting Family to Circle Migration Patch...');
    await prisma.$executeRawUnsafe('BEGIN');

    // 1. Rename Tables
    console.log('Renaming family_invitations to circle_invitations...');
    await prisma.$executeRawUnsafe('ALTER TABLE IF EXISTS family_invitations RENAME TO circle_invitations');

    // 2. Rename Columns
    const tablesToUpdate = [
      { name: 'circle_invitations', col: 'family_id', newCol: 'circle_id' },
      { name: 'shopping_items', col: 'family_id', newCol: 'circle_id' },
      { name: 'messages', col: 'family_id', newCol: 'circle_id' }
    ];

    for (const table of tablesToUpdate) {
      console.log(`Renaming ${table.col} to ${table.newCol} in ${table.name}...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE IF EXISTS ${table.name} RENAME COLUMN ${table.col} TO ${table.newCol}`);
    }

    await prisma.$executeRawUnsafe('COMMIT');
    console.log('✅ Migration patch completed successfully!');
  } catch (err) {
    await prisma.$executeRawUnsafe('ROLLBACK');
    console.error('❌ Migration patch failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
