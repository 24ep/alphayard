const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  const client = await pool.connect();
  try {
    // 1. Rename Tables (Skipping - assumed done)
    // console.log('Renaming tables...');
    // await client.query('ALTER TABLE IF EXISTS families RENAME TO circles');
    // await client.query('ALTER TABLE IF EXISTS family_members RENAME TO circle_members');

    // 2. Rename Columns in circle_members (Skipping - assumed done)
    // console.log('Renaming family_id to circle_id in circle_members...');
    // await client.query('ALTER TABLE IF EXISTS circle_members RENAME COLUMN family_id TO circle_id');

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
      await client.query(`ALTER TABLE IF EXISTS ${table} RENAME COLUMN family_id TO circle_id`);
    }

    // 4. Update Indexes (Optional but good practice)
    console.log('Updating indexes...');
    await client.query('ALTER INDEX IF EXISTS idx_family_members_family_id RENAME TO idx_circle_members_circle_id');
    await client.query('ALTER INDEX IF EXISTS idx_tasks_family_id RENAME TO idx_tasks_circle_id');
    await client.query('ALTER INDEX IF EXISTS idx_calendar_events_family_id RENAME TO idx_calendar_events_circle_id');
    await client.query('ALTER INDEX IF EXISTS idx_expenses_family_id RENAME TO idx_expenses_circle_id');
    await client.query('ALTER INDEX IF EXISTS idx_files_family_id RENAME TO idx_files_circle_id');

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
