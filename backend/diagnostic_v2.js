
const { PrismaClient } = require('./prisma/generated/prisma/client');
const prisma = new PrismaClient();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function diagnose() {
  try {
    console.log('--- ADMIN USERS ---');
    const admins = await prisma.$queryRawUnsafe('SELECT id, email, user_id, first_name FROM admin_users');
    console.table(admins);

    for (const admin of admins) {
      if (admin.user_id) {
        console.log(`--- Checking user_id ${admin.user_id} for ${admin.email} ---`);
        const users = await prisma.$queryRawUnsafe('SELECT id, email, is_active FROM users WHERE id = $1', admin.user_id);
        console.table(users);
      } else {
        console.log(`!!! Admin ${admin.email} has NULL user_id !!!`);
      }
    }
    
    console.log('--- JWT SECRET CHECK ---');
    console.log('process.env.JWT_SECRET:', process.env.JWT_SECRET ? 'Exists' : 'MISSING');

  } catch (err) {
    console.error('DIAGNOSTIC FAILED:', err);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
