import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function createAdminMobileUser() {
    try {
        console.log('🔧 Creating admin user for mobile login...');

        const testUser = {
            id: crypto.randomUUID(),
            email: 'admin@bondarys.com',
            password: 'admin123',
            firstName: 'Super',
            lastName: 'Admin',
            phone: '+15555555555',
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
                console.log('⚠️ User already exists in auth.users:', testUser.email);

                // Optional: Update password if needed
                await tx.$executeRaw`
                    UPDATE auth.users SET encrypted_password = ${hashedPassword} WHERE email = ${testUser.email}
                `;
                console.log('   Password updated to: admin123');

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

            // Also ensure profile exists
            await tx.$executeRaw`
                INSERT INTO public.profiles (id, full_name, avatar_url, phone)
                VALUES (${testUser.id}::uuid, ${`${testUser.firstName} ${testUser.lastName}`}, '', ${testUser.phone})
                ON CONFLICT (id) DO NOTHING
            `;
        });

        console.log('✅ Admin mobile user created successfully!');
        console.log('   Email:', testUser.email);
        console.log('   Password:', testUser.password);

    } catch (error) {
        console.error('❌ Error creating user:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createAdminMobileUser();
