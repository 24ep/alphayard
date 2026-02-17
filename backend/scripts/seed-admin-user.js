
const { PrismaClient, Prisma } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedAdmin() {
  try {
    const email = 'admin@bondarys.com';
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    console.log(`Hashing password for ${email}...`);
    
    // Check if user exists
    const res = await prisma.$queryRaw(Prisma.sql`SELECT * FROM users WHERE email = ${email}`);
    
    if (res.length > 0) {
      console.log('Admin user already exists. Updating password and role...');
      await prisma.$executeRaw(Prisma.sql`
        UPDATE users 
        SET password_hash = ${passwordHash}, 
            raw_user_meta_data = '{"role": "admin"}'::jsonb,
            is_active = true
        WHERE email = ${email}
      `);
    } else {
      console.log('Creating new admin user...');
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO users (
            email, 
            password_hash, 
            first_name, 
            last_name, 
            is_active, 
            raw_user_meta_data
        ) VALUES (${email}, ${passwordHash}, ${'Admin'}, ${'User'}, ${true}, ${'{"role": "admin"}'}::jsonb)
      `);
    }

    console.log('✅ Admin user seeded successfully.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin user:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedAdmin();
