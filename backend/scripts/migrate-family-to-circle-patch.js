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
    console.log('🚀 Starting Family to Circle Migration Patch...');
    await client.query('BEGIN');

    // 1. Rename Tables
    console.log('Renaming family_invitations to circle_invitations...');
    await client.query('ALTER TABLE IF EXISTS family_invitations RENAME TO circle_invitations');

    // 2. Rename Columns
    const tablesToUpdate = [
      { name: 'circle_invitations', col: 'family_id', newCol: 'circle_id' },
      { name: 'shopping_items', col: 'family_id', newCol: 'circle_id' },
      { name: 'messages', col: 'family_id', newCol: 'circle_id' }
    ];

    for (const table of tablesToUpdate) {
      console.log(`Renaming ${table.col} to ${table.newCol} in ${table.name}...`);
      await client.query(`ALTER TABLE IF EXISTS ${table.name} RENAME COLUMN ${table.col} TO ${table.newCol}`);
    }

    await client.query('COMMIT');
    console.log('✅ Migration patch completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration patch failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
