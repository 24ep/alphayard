
import { query } from './src/config/database';

async function updateSchema() {
  console.log('Updating schema with all missing columns...');
  try {
    // raw_user_meta_data
    try {
        await query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS raw_user_meta_data JSONB DEFAULT '{}'::jsonb;`);
        console.log('raw_user_meta_data added.');
    } catch (e) { console.error('raw_user_meta_data error:', e); }

    // is_active
    try {
        await query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`);
        console.log('is_active added.');
    } catch (e) { console.error('is_active error:', e); }

    // password_hash failure check
    try {
        await query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;`);
        console.log('password_hash added.');
    } catch (e) { console.error('password_hash error:', e); }

  } catch (err) {
    console.error('Schema update failed:', err);
  }
}

updateSchema();
