
import { query } from './src/config/database';

async function updateSchema() {
  console.log('Adding raw_user_meta_data column...');
  try {
    const sql = `
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS raw_user_meta_data JSONB DEFAULT '{}'::jsonb;
    `;
    await query(sql);
    console.log('Column added successfully.');
  } catch (err) {
    console.error('Schema update failed:', err);
  }
}

updateSchema();
