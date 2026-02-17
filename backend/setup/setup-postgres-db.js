const { PrismaClient } = require('../src/prisma/generated/prisma');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔌 Connected to database');

        // Enable UUID extension
        await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

        // Create Users Table
        console.log('🔨 Creating users table...');
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        user_type VARCHAR(50) DEFAULT 'hourse',
        subscription_tier VARCHAR(50) DEFAULT 'free',
        is_email_verified BOOLEAN DEFAULT false,
        email_verification_code VARCHAR(10),
        refresh_tokens TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        // Note: Used 'password' instead of 'password_hash' to match some conventions, or stick to 'password' as it's cleaner. 
        // Mongoose schema used 'password'.
        // Mongoose schema: familyIds, userType, etc.
        // I should map snake_case columns to camelCase in application or keep consistent.
        // I'll stick to snake_case in DB, map in Model.

        // Check for test user
        const email = 'dev@bondarys.com';
        const escapedEmail = email.replace(/'/g, "''");
        const res = await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${escapedEmail}'`);

        if (res.length > 0) {
            console.log('✅ Test user already exists');
        } else {
            console.log('👤 Creating test user...');
            const passwordHash = await bcrypt.hash('password123', 10);
            const escapedPasswordHash = passwordHash.replace(/'/g, "''");
            await prisma.$executeRawUnsafe(`
        INSERT INTO users (email, password, first_name, last_name, is_email_verified, user_type)
        VALUES ('${escapedEmail}', '${escapedPasswordHash}', 'Dev', 'User', true, 'hourse')
      `);
            console.log('✅ Test user created: dev@bondarys.com / password123');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
