import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const urls = [
  'postgresql://postgres:EiLTGaCpAAItsFeFGKayThIscerwWSEj@crossover.proxy.rlwy.net:23873/railway',
  'postgresql://postgres:postgres@localhost:5432/postgres'
];

async function fixAll() {
  for (const url of urls) {
    console.log(`\n--- Fixing DB: ${url.split('@')[1]} ---`);
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      console.log('Ensuring schemas exist...');
      await prisma.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS "core"');
      await prisma.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS "admin"');
      await prisma.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS "bondarys"');
      
      console.log('Running prisma db push...');
      // Set DATABASE_URL and run push
      execSync(`npx prisma db push`, { 
        env: { ...process.env, DATABASE_URL: url },
        stdio: 'inherit'
      });
      
      console.log('Checking for admin user...');
      const count = await prisma.adminUser.count();
      if (count === 0) {
        console.log('Creating default admin user...');
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash('admin123', 10);
        await prisma.adminUser.create({
          data: {
            email: 'admin@boundary.com',
            passwordHash: hash,
            name: 'Default Admin',
            isSuperAdmin: true,
            isActive: true
          }
        });
        console.log('Admin user created.');
      } else {
        console.log(`Found ${count} admin users.`);
      }
    } catch (e: any) {
      console.log('ERROR:' + e.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

fixAll();
