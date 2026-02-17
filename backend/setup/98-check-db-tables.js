const { PrismaClient } = require('../src/prisma/generated/prisma');
const path = require('path');
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
require('dotenv').config({ path: envPath });

const prisma = new PrismaClient();

async function checkTables() {
  try {
    const res = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('=== Database Tables ===');
    res.forEach(row => console.log(row.table_name));
    
    // Check specifically for admin_users columns
    // Check specifically for admin_users columns
    try {
        const adminRes = await prisma.$queryRawUnsafe(`
            SELECT u.id, u.email, au.id as admin_id, au.admin_role_id
            FROM users u
            LEFT JOIN admin_users au ON u.id = au.user_id
            WHERE u.email = 'admin@bondarys.com';
        `);
        console.log('\n=== Admin User Check ===');
        if (adminRes.length > 0) {
            console.log('User found:', adminRes[0]);
        } else {
            console.log('User admin@bondarys.com NOT FOUND in users table');
        }
    } catch (e) {
        console.error('\n❌ Admin user check failed:', e);
    }

    try {
        const usersRes = await prisma.$queryRawUnsafe(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('\n=== Full users Table Schema ===');
        usersRes.forEach(r => console.log(` - ${r.column_name} (${r.data_type}) | Nullable: ${r.is_nullable}`));
    } catch (e) {
        console.error('\n❌ users table schema query failed:', e);
    }

  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
