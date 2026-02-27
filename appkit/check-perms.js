require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.adminUser.findMany({
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });
  
  console.log('--- ADMIN USERS ---');
  console.log(JSON.stringify(users.map(u => ({
    email: u.email,
    isSuperAdmin: u.isSuperAdmin,
    role: u.role?.name || null,
    permissions: u.role?.permissions.map(rp => `${rp.permission.module}:${rp.permission.action}`) || []
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
