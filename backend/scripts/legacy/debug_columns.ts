
import { query } from './src/config/database';

async function testQuery() {
  console.log('Listing columns for public.users...');
  try {
    const sql = `
      SELECT column_name, data_type 
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `;
    const res = await query(sql);
    console.log('Columns:', res.rows);
  } catch (err) {
    console.error('Query failed:', err);
  }
}

testQuery();
