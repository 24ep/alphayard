import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
    host: 'localhost',
    port: 54322, // Supabase Docker container port
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
});

async function createTestUser() {
    const client = await pool.connect();

    try {
        console.log('🔧 Creating test user for login...');

        const testUser = {
            id: crypto.randomUUID(),
            email: 'test@example.com',
            password: 'Password123',
            firstName: 'Test',
            lastName: 'User',
            phone: '+1234567890',
            userType: 'circle'
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
            console.log('✅ Test user already exists:', testUser.email);
            console.log('   You can login with:');
            console.log('   Email:', testUser.email);
            console.log('   Password:', testUser.password);
            await client.query('ROLLBACK');
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

        await client.query('COMMIT');

        console.log('✅ Test user created successfully!');
        console.log('   Email:', testUser.email);
        console.log('   Password:', testUser.password);
        console.log('   User ID:', testUser.id);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating test user:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run if executed directly
if (require.main === module) {
    createTestUser()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

export default createTestUser;

