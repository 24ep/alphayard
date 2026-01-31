
import { query } from './src/config/database';

async function testQuery() {
  console.log('Testing DB Query...');
  try {
    const sql = `
      SELECT u.id, u.email, u.encrypted_password as password, u.created_at, u.email_confirmed_at,
             p.full_name, p.avatar_url, p.phone,
             (SELECT json_agg(family_id) FROM family_members WHERE user_id = u.id) as family_ids,
             u.raw_user_meta_data as metadata
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.id
      WHERE u.email = $1
    `;
    const res = await query(sql, ['test@example.com']);
    console.log('Query success:', res.rows);
  } catch (err) {
    console.error('Query failed:', err);
  }
}

testQuery();
