
import { query } from './src/config/database';

async function testQuery() {
  console.log('Testing DB Query on public.users...');
  try {
    const sql = `
      SELECT id, email, password_hash, created_at, is_active
      FROM public.users
      LIMIT 1
    `;
    const res = await query(sql);
    console.log('Query success:', res.rows);
  } catch (err) {
    console.error('Query failed:', err);
  }
}

testQuery();
