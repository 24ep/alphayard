#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcryptjs'); // Use bcryptjs to match backend dependencies if bcrypt not found, checking package.json next step
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function main() {
  // Use DB vars
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };

  const pool = new Pool(dbConfig);

  console.log('🔧 Creating test user...\n');

  // Test user credentials
  const testUser = {
    email: 'test@bondarys.com',
    password: 'Test123!',
    first_name: 'Test',
    last_name: 'User'
  };

  try {
    // Check connection
    await pool.query('SELECT 1');

    // Check if user already exists
    const existingRes = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [testUser.email]
    );

    if (existingRes.rows.length > 0) {
      const existingUser = existingRes.rows[0];
      console.log('✅ Test user already exists:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
      console.log(`   User ID: ${existingUser.id}\n`);
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(testUser.password, 10);

    // Create user
    // Note: Assuming 'users' table schema matches what was in supabase.from('users')
    // We need to handle optional fields if they are constrained
    const insertRes = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, is_active, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email`,
      [testUser.email, password_hash, testUser.first_name, testUser.last_name, true, true]
    );

    const newUser = insertRes.rows[0];

    console.log('✅ Test user created successfully!\n');
    console.log('📧 Login Credentials:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testUser.password}`);
    console.log(`   User ID: ${newUser.id}\n`);
    console.log('💡 You can now use these credentials to log in to the mobile app.\n');

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
      
    if (error.code === '42P01') { // Undefined table
      console.log('\n⚠️  The users table does not exist yet.');
      console.log('   Please run the database migrations first.');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('❌ Script failed:', e.message || e);
  process.exit(1);
});
