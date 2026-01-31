
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function resetPassword() {
  const email = 'admin@bondarys.com';
  const newPassword = 'password';
  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
        "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id",
        [passwordHash, email.toLowerCase()]
    );
    if (result.rows.length > 0) {
        console.log(`✅ Password reset successfully for ${email}`);
        console.log(`New Password: ${newPassword}`);
    } else {
        console.log(`❌ User ${email} not found.`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

resetPassword();
