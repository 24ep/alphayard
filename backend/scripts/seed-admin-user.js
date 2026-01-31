
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

async function seedAdmin() {
  try {
    const email = 'admin@bondarys.com';
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    console.log(`Hashing password for ${email}...`);

    const client = await pool.connect();
    
    // Check if user exists
    const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (res.rows.length > 0) {
      console.log('Admin user already exists. Updating password and role...');
      await client.query(`
        UPDATE users 
        SET password_hash = $1, 
            raw_user_meta_data = '{"role": "admin"}'::jsonb,
            is_active = true
        WHERE email = $2
      `, [passwordHash, email]);
    } else {
      console.log('Creating new admin user...');
      await client.query(`
        INSERT INTO users (
            email, 
            password_hash, 
            first_name, 
            last_name, 
            is_active, 
            raw_user_meta_data
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        email, 
        passwordHash, 
        'Admin', 
        'User', 
        true, 
        '{"role": "admin"}'
      ]);
    }

    console.log('✅ Admin user seeded successfully.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin user:', err);
    process.exit(1);
  }
}

seedAdmin();
