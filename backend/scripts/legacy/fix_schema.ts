
import { query } from './src/config/database';

async function updateSchema() {
  console.log('Adding password_hash column...');
  try {
    const sql = `
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS password_hash TEXT;
    `;
    await query(sql);
    console.log('Column added successfully.');
  } catch (err) {
    console.error('Schema update failed:', err);
  }
}

updateSchema();
