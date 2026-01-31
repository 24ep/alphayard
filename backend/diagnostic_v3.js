
const { pool } = require('./src/config/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function diagnose() {
  try {
    console.log('--- ADMIN USERS (v009 Schema) ---');
    const { rows: admins } = await pool.query(`
      SELECT au.id as admin_id, au.user_id, u.email, u.first_name, u.last_name
      FROM admin_users au
      LEFT JOIN users u ON au.user_id = u.id
    `);
    console.table(admins);

    console.log('--- ALL USERS ---');
    const { rows: users } = await pool.query('SELECT id, email, is_active FROM users LIMIT 10');
    console.table(users);

    console.log('--- JWT SECRET CHECK ---');
    console.log('process.env.JWT_SECRET:', process.env.JWT_SECRET ? 'Exists' : 'MISSING');

  } catch (err) {
    console.error('DIAGNOSTIC FAILED:', err);
  } finally {
    await pool.end();
  }
}

diagnose();
