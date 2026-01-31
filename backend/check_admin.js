
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkAdmin() {
  try {
    console.log('--- Checking Admin Users ---');
    const adminRes = await pool.query('SELECT id, email, user_id FROM admin_users');
    console.table(adminRes.rows);

    if (adminRes.rows.length > 0) {
      const userId = adminRes.rows[0].user_id;
      console.log(`--- Checking User with ID: ${userId} ---`);
      const userRes = await pool.query('SELECT id, email, is_active FROM users WHERE id = $1', [userId]);
      console.table(userRes.rows);
    } else {
      console.log('No admin users found in admin_users table.');
    }

    console.log('--- Checking JWT Secret ---');
    console.log('JWT_SECRET starts with:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'MISSING');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkAdmin();
