
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function debugLoginQuery() {
  const email = 'admin@bondarys.com';
  const query = `
    SELECT au.*, u.email, u.password_hash, 
           u.first_name, u.last_name,
           ar.name as role_name, ar.permissions
    FROM admin_users au
    JOIN users u ON au.user_id = u.id
    LEFT JOIN admin_roles ar ON au.admin_role_id = ar.id
    WHERE u.email = $1 AND au.is_active = true
  `;
  try {
    const { rows } = await pool.query(query, [email.toLowerCase()]);
    console.log('Query result:', JSON.stringify(rows, null, 2));
    if (rows.length > 0) {
        console.log('User found! Password hash length:', rows[0].password_hash ? rows[0].password_hash.length : 'null');
    } else {
        console.log('User NOT found or NOT active.');
    }
  } catch (err) {
    console.error('Query Error:', err);
  } finally {
    await pool.end();
  }
}

debugLoginQuery();
