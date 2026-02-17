
const { PrismaClient } = require('./prisma/generated/prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

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
    const rows = await prisma.$queryRawUnsafe(query, email.toLowerCase());
    console.log('Query result:', JSON.stringify(rows, null, 2));
    if (rows.length > 0) {
        console.log('User found! Password hash length:', rows[0].password_hash ? rows[0].password_hash.length : 'null');
    } else {
        console.log('User NOT found or NOT active.');
    }
  } catch (err) {
    console.error('Query Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

debugLoginQuery();
