#!/usr/bin/env node

const { PrismaClient } = require('../src/prisma/generated/prisma');
const bcrypt = require('bcryptjs'); // Use bcryptjs to match backend dependencies if bcrypt not found, checking package.json next step
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function main() {
  const prisma = new PrismaClient();

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
    await prisma.$queryRawUnsafe('SELECT 1');

    // Check if user already exists
    const escapedEmail = testUser.email.replace(/'/g, "''");
    const existingRes = await prisma.$queryRawUnsafe(
      `SELECT id, email FROM users WHERE email = '${escapedEmail}'`
    );

    if (existingRes.length > 0) {
      const existingUser = existingRes[0];
      console.log('✅ Test user already exists:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
      console.log(`   User ID: ${existingUser.id}\n`);
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(testUser.password, 10);
    const escapedPasswordHash = password_hash.replace(/'/g, "''");
    const escapedFirstName = testUser.first_name.replace(/'/g, "''");
    const escapedLastName = testUser.last_name.replace(/'/g, "''");

    // Create user
    // Note: Assuming 'users' table schema matches what was in supabase.from('users')
    // We need to handle optional fields if they are constrained
    const insertRes = await prisma.$queryRawUnsafe(
      `INSERT INTO users (email, password_hash, first_name, last_name, is_active, is_email_verified)
       VALUES ('${escapedEmail}', '${escapedPasswordHash}', '${escapedFirstName}', '${escapedLastName}', true, true)
       RETURNING id, email`
    );

    const newUser = insertRes[0];

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
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ Script failed:', e.message || e);
  process.exit(1);
});
