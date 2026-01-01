import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const pool = new Pool({
    host: 'localhost',
    port: 54322, // Supabase Docker container port
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
});

async function createAdminMobileUser() {
    const client = await pool.connect();

    try {
        console.log('🔧 Creating admin user for mobile login...');

        const testUser = {
            id: crypto.randomUUID(),
            email: 'admin@bondarys.com',
            password: 'admin123',
            firstName: 'Super',
            lastName: 'Admin',
            phone: '+15555555555',
            userType: 'hourse'
        };

        // Hash the password
        const hashedPassword = await bcrypt.hash(testUser.password, 12);

        await client.query('BEGIN');

        // Check if user already exists
        const existing = await client.query(
            'SELECT id FROM auth.users WHERE email = $1',
            [testUser.email]
        );

        if (existing.rows.length > 0) {
            console.log('⚠️ User already exists in auth.users:', testUser.email);

            // Optional: Update password if needed
            await client.query(
                'UPDATE auth.users SET encrypted_password = $1 WHERE email = $2',
                [hashedPassword, testUser.email]
            );
            console.log('   Password updated to: admin123');

            await client.query('COMMIT');
            return;
        }

        // Insert into auth.users with all required Supabase fields
        await client.query(`
      INSERT INTO auth.users (
        instance_id,
        id, 
        aud,
        role,
        email, 
        encrypted_password, 
        email_confirmed_at,
        created_at, 
        updated_at,
        raw_user_meta_data,
        confirmation_token
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        $1,
        'authenticated',
        'authenticated',
        $2, 
        $3,
        NOW(),
        NOW(),
        NOW(),
        $4,
        ''
      )
    `, [
            testUser.id,
            testUser.email,
            hashedPassword,
            JSON.stringify({
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                userType: testUser.userType,
                isOnboardingComplete: true,
                phone: testUser.phone
            })
        ]);

        // Also ensure profile exists
        await client.query(`
           INSERT INTO public.profiles (id, full_name, avatar_url, phone)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO NOTHING
         `, [testUser.id, `${testUser.firstName} ${testUser.lastName}`, '', testUser.phone]);

        await client.query('COMMIT');

        console.log('✅ Admin mobile user created successfully!');
        console.log('   Email:', testUser.email);
        console.log('   Password:', testUser.password);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating user:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createAdminMobileUser();
