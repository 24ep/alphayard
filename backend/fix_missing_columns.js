
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function addMissingColumns() {
  const client = await pool.connect();
  try {
    console.log('Adding missing columns to users table...');
    
    const queries = [
      `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS raw_user_meta_data JSONB DEFAULT '{}'`,
      `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_onboarding_complete BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'circle'`,
      `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(50)`,
      `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'`
    ];

    for (const q of queries) {
      console.log(`Executing: ${q}`);
      await client.query(q);
    }

    console.log('✅ Missing columns added successfully.');
  } catch (err) {
    console.error('❌ Error adding columns:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

addMissingColumns();
