const { PrismaClient } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  try {
    // 1. Rename Tables (Skipping - assumed done)
    // console.log('Renaming tables...');
    // await prisma.$executeRawUnsafe('ALTER TABLE IF EXISTS families RENAME TO circles');
    // await prisma.$executeRawUnsafe('ALTER TABLE IF EXISTS family_members RENAME TO circle_members');

    // 2. Rename Columns in circle_members (Skipping - assumed done)
    // console.log('Renaming family_id to circle_id in circle_members...');
    // await prisma.$executeRawUnsafe('ALTER TABLE IF EXISTS circle_members RENAME COLUMN family_id TO circle_id');

    // 3. Rename Columns in other tables
    const tablesToUpdate = [
      'tasks',
      'calendar_events',
      'expenses',
      'files',
      'social_posts',
      'location_history',
      'safety_alerts',
      'chat_rooms',
      'notes',
      'notifications'
    ];

    for (const table of tablesToUpdate) {
      console.log(`Renaming family_id to circle_id in ${table}...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE IF EXISTS ${table} RENAME COLUMN family_id TO circle_id`);
    }

    // 4. Update Indexes (Optional but good practice)
    console.log('Updating indexes...');
    await prisma.$executeRawUnsafe('ALTER INDEX IF EXISTS idx_family_members_family_id RENAME TO idx_circle_members_circle_id');
    await prisma.$executeRawUnsafe('ALTER INDEX IF EXISTS idx_tasks_family_id RENAME TO idx_tasks_circle_id');
    await prisma.$executeRawUnsafe('ALTER INDEX IF EXISTS idx_calendar_events_family_id RENAME TO idx_calendar_events_circle_id');
    await prisma.$executeRawUnsafe('ALTER INDEX IF EXISTS idx_expenses_family_id RENAME TO idx_expenses_circle_id');
    await prisma.$executeRawUnsafe('ALTER INDEX IF EXISTS idx_files_family_id RENAME TO idx_files_circle_id');

    await prisma.$executeRawUnsafe('COMMIT');
    console.log('✅ Migration completed successfully!');
  } catch (err) {
    await prisma.$executeRawUnsafe('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
