
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Fallback
if (!process.env.DB_HOST) {
    require('dotenv').config({ path: path.resolve(__dirname, '.env') });
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createAdmin() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('--- Creating Admin User ---');

    const email = 'admin@bondarys.com';
    const password = 'password';

    // 1. Ensure Super Admin Role exists
    console.log('Checking roles...');
    let roleId;
    const roleRes = await client.query("SELECT id FROM admin_roles WHERE name = 'Super Admin'");
    if (roleRes.rows.length > 0) {
        roleId = roleRes.rows[0].id;
        console.log('Found Super Admin role:', roleId);
    } else {
        console.log('Creating Super Admin role...');
        const permissions = ['*']; 
        const newRole = await client.query(
            "INSERT INTO admin_roles (id, name, description, permissions, is_system_role, is_active) VALUES (gen_random_uuid(), $1, $2, $3, true, true) RETURNING id",
            ['Super Admin', 'Full access to everything', JSON.stringify(permissions)]
        );
        roleId = newRole.rows[0].id;
        console.log('Created Super Admin role:', roleId);
    }

    // 2. Create User in public.users table (target explicit schema to be safe)
    console.log('Checking/Creating user in public.users...');
    let userId;
    const userRes = await client.query("SELECT id FROM public.users WHERE email = $1", [email]);
    
    const passwordHash = await bcrypt.hash(password, 10);

    if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
        console.log('User already exists, updating password...');
        await client.query("UPDATE public.users SET password_hash = $1 WHERE id = $2", [passwordHash, userId]);
    } else {
        console.log('Creating new user...');
        const newUser = await client.query(`
            INSERT INTO public.users (id, email, password_hash, first_name, last_name, is_active)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, true)
            RETURNING id
        `, [email, passwordHash, 'Super', 'Admin']);
        userId = newUser.rows[0].id;
    }

    // 3. Create/Update Admin User
    console.log('Checking/Creating admin_user entry...');
    const adminRes = await client.query("SELECT id FROM public.admin_users WHERE user_id = $1", [userId]);
    
    if (adminRes.rows.length > 0) {
        console.log('Admin user entry already exists.');
        await client.query("UPDATE public.admin_users SET admin_role_id = $1, is_active = true WHERE user_id = $2", [roleId, userId]);
    } else {
        await client.query("INSERT INTO public.admin_users (id, user_id, admin_role_id, is_active) VALUES (gen_random_uuid(), $1, $2, true)", [userId, roleId]);
        console.log('Created admin_user entry.');
    }

    await client.query('COMMIT');
    console.log('✅ Admin user setup complete.');
    console.log(`Login with: ${email} / ${password}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdmin();
