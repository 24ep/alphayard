
const { PrismaClient } = require('./prisma/generated/prisma/client');
const prisma = new PrismaClient();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function checkAdmin() {
  try {
    console.log('--- Checking Admin Users ---');
    const adminRes = await prisma.$queryRawUnsafe('SELECT id, email, user_id FROM admin_users');
    console.table(adminRes);

    if (adminRes.length > 0) {
      const userId = adminRes[0].user_id;
      console.log(`--- Checking User with ID: ${userId} ---`);
      const userRes = await prisma.$queryRawUnsafe('SELECT id, email, is_active FROM users WHERE id = $1', userId);
      console.table(userRes);
    } else {
      console.log('No admin users found in admin_users table.');
    }

    console.log('--- Checking JWT Secret ---');
    console.log('JWT_SECRET starts with:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'MISSING');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
