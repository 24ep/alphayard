const { PrismaClient } = require('../prisma/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
    try {
        console.log('--- Seeding Admin User ---');

        // 1. Ensure Super Admin role exists
        const roleRes = await prisma.$queryRawUnsafe("SELECT id FROM admin.admin_roles WHERE name = 'super_admin' OR name = 'Super Admin' LIMIT 1");
        let roleId;
        if (roleRes.length === 0) {
            console.log('Creating super_admin role...');
            const newRole = await prisma.$queryRawUnsafe(`
                INSERT INTO admin.admin_roles (name, display_name, description)
                VALUES ('super_admin', 'Super Admin', 'Full system access')
                RETURNING id
            `);
            roleId = newRole[0].id;
        } else {
            roleId = roleRes[0].id;
            console.log('Super Admin role found:', roleId);
        }

        // 2. Ensure User exists in users table
        const email = 'admin@bondarys.com';
        const password = 'admin123';
        const escapedEmail = email.replace(/'/g, "''");
        const userRes = await prisma.$queryRawUnsafe(`SELECT id FROM core.users WHERE email = '${escapedEmail}'`);
        let userId;
        
        if (userRes.length === 0) {
            console.log(`Creating user ${email}...`);
            const passwordHash = await bcrypt.hash(password, 10);
            const escapedPasswordHash = passwordHash.replace(/'/g, "''");
            
            // Insert user with password_hash
            const newUser = await prisma.$queryRawUnsafe(`
                INSERT INTO core.users (email, password_hash, first_name, last_name, is_active)
                VALUES ('${escapedEmail}', '${escapedPasswordHash}', 'Super', 'Admin', true)
                RETURNING id
            `);
            userId = newUser[0].id;
        } else {
            userId = userRes[0].id;
            console.log('User record found:', userId);
        }

        // 3. Ensure Admin entry exists
        const adminRes = await prisma.$queryRawUnsafe(`SELECT id FROM admin.admin_users WHERE email = '${escapedEmail}'`);
        if (adminRes.length === 0) {
            console.log('Creating admin user...');
            const passwordHash = await bcrypt.hash(password, 10);
            const escapedPasswordHash = passwordHash.replace(/'/g, "''");
            await prisma.$executeRawUnsafe(`
                INSERT INTO admin.admin_users (email, password_hash, name, role_id, is_active, is_super_admin)
                VALUES ('${escapedEmail}', '${escapedPasswordHash}', 'Super Admin', '${roleId}', true, true)
            `);
            console.log('✅ Admin user seeded successfully!');
        } else {
            console.log('✅ Admin user already exists.');
        }

        console.log(`\nCredentials:\nEmail: ${email}\nPassword: ${password}\n`);

    } catch (err) {
        console.error('Error seeding admin:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
