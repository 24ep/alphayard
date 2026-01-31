
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function createTable() {
  try {
    console.log('Creating public.app_settings table...');
    
    await pool.query(`
        CREATE TABLE IF NOT EXISTS public.app_settings (
            key TEXT PRIMARY KEY,
            value JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_by UUID
        );
    `);
    
    console.log('Table created successfully.');
    
    // Grant permissions if needed (usually public has access in dev)
    await pool.query('GRANT ALL ON public.app_settings TO postgres');
    await pool.query('GRANT ALL ON public.app_settings TO public'); // For supabase anon/service if needed role-based

  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await pool.end();
  }
}

createTable();
