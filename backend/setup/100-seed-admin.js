const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const dbUrl = process.env.DATABASE_URL ||
    (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST && process.env.DB_PORT && process.env.DB_NAME
        ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
        : undefined);

if (!dbUrl) {
    console.error('DATABASE_URL is missing/incomplete in .env');
    process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });

async function seedAdmin() {
    try {
        console.log('--- Seeding Admin User ---');

        // 1. Ensure Super Admin role exists
        const roleRes = await pool.query("SELECT id FROM admin_roles WHERE name = 'super_admin' OR name = 'Super Admin' LIMIT 1");
        let roleId;
        if (roleRes.rows.length === 0) {
            console.log('Creating super_admin role...');
            const newRole = await pool.query(`
                INSERT INTO admin_roles (name, description, permissions)
                VALUES ('Super Admin', 'Full system access', '{"all": true}')
                RETURNING id
            `);
            roleId = newRole.rows[0].id;
        } else {
            roleId = roleRes.rows[0].id;
            console.log('Super Admin role found:', roleId);
        }

        // 2. Ensure User exists in users table
        const email = 'admin@bondarys.com';
        const password = 'admin123';
        const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        let userId;
        
        if (userRes.rows.length === 0) {
            console.log(`Creating user ${email}...`);
            const passwordHash = await bcrypt.hash(password, 10);
            
            // We use both password and password_hash to be safe against schema variations
            const newUser = await pool.query(`
                INSERT INTO users (email, password_hash, password, first_name, last_name, is_active)
                VALUES ($1, $2, $3, 'Super', 'Admin', true)
                RETURNING id
            `, [email, passwordHash, passwordHash]);
            userId = newUser.rows[0].id;
        } else {
            userId = userRes.rows[0].id;
            console.log('User record found:', userId);
        }

        // 3. Ensure Admin link exists
        const adminRes = await pool.query("SELECT id FROM admin_users WHERE user_id = $1", [userId]);
        if (adminRes.rows.length === 0) {
            console.log('Linking user to admin_users...');
            await pool.query(`
                INSERT INTO admin_users (user_id, admin_role_id, is_active, is_super_admin)
                VALUES ($1, $2, true, true)
            `, [userId, roleId]);
            console.log('✅ Admin user seeded successfully!');
        } else {
            console.log('✅ Admin link already exists.');
        }

        console.log(`\nCredentials:\nEmail: ${email}\nPassword: ${password}\n`);

    } catch (err) {
        console.error('Error seeding admin:', err);
    } finally {
        await pool.end();
    }
}

seedAdmin();
