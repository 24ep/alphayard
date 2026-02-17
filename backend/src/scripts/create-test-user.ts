import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function createTestUser() {
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

        await prisma.$transaction(async (tx) => {
            // Check if user already exists
            const existing = await tx.$queryRaw<Array<{ id: string }>>`
                SELECT id FROM auth.users WHERE email = ${testUser.email}
            `;

            if (existing.length > 0) {
                console.log('✅ Test user already exists:', testUser.email);
                console.log('   You can login with:');
                console.log('   Email:', testUser.email);
                console.log('   Password:', testUser.password);
                return;
            }

            // Insert into auth.users with all required Supabase fields
            await tx.$executeRaw`
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
                    ${testUser.id}::uuid,
                    'authenticated',
                    'authenticated',
                    ${testUser.email}, 
                    ${hashedPassword},
                    NOW(),
                    NOW(),
                    NOW(),
                    ${JSON.stringify({
                        firstName: testUser.firstName,
                        lastName: testUser.lastName,
                        userType: testUser.userType,
                        isOnboardingComplete: true,
                        phone: testUser.phone
                    })}::jsonb,
                    ''
                )
            `;
        });

        console.log('✅ Test user created successfully!');
        console.log('   Email:', testUser.email);
        console.log('   Password:', testUser.password);
        console.log('   User ID:', testUser.id);

    } catch (error) {
        console.error('❌ Error creating test user:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
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

