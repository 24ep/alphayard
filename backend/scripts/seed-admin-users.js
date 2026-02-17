const { PrismaClient, Prisma } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedAdminUsers() {
    try {
        await prisma.$executeRawUnsafe('BEGIN');

        console.log('🚀 Seeding Admin Users and Roles...');

        // 1. Create/Update roles
        console.log('📋 Creating admin roles...');
        
        const roles = [
            {
                name: 'super_admin',
                description: 'Full system access - can manage everything including other admins',
                permissions: JSON.stringify(['*'])
            },
            {
                name: 'admin',
                description: 'Can manage applications, users, and content',
                permissions: JSON.stringify([
                    'applications:read', 'applications:write',
                    'users:read', 'users:write',
                    'content:read', 'content:write', 'content:delete',
                    'pages:read', 'pages:write', 'pages:delete', 'pages:publish',
                    'assets:read', 'assets:write', 'assets:delete',
                    'settings:read', 'settings:write'
                ])
            },
            {
                name: 'editor',
                description: 'Can manage pages, content and assets',
                permissions: JSON.stringify([
                    'content:read', 'content:write',
                    'pages:read', 'pages:write', 'pages:publish',
                    'assets:read', 'assets:write'
                ])
            },
            {
                name: 'viewer',
                description: 'Read-only access to content and analytics',
                permissions: JSON.stringify([
                    'content:read',
                    'pages:read',
                    'assets:read',
                    'analytics:read'
                ])
            }
        ];

        for (const role of roles) {
            await prisma.$executeRaw(Prisma.sql`
                INSERT INTO admin_roles (name, description, permissions)
                VALUES (${role.name}, ${role.description}, ${role.permissions}::jsonb)
                ON CONFLICT (name) DO UPDATE SET
                    description = EXCLUDED.description,
                    permissions = EXCLUDED.permissions,
                    updated_at = NOW()
            `);
        }
        console.log('✅ Admin roles created/updated');

        // 2. Create default super admin user
        console.log('👤 Creating default super admin user...');
        
        const superAdminEmail = 'admin@bondary.com';
        const superAdminPassword = 'admin123'; // Common password as requested
        const passwordHash = await bcrypt.hash(superAdminPassword, 10);

        // Get super_admin role id
        const roleRes = await prisma.$queryRawUnsafe(`SELECT id FROM admin_roles WHERE name = 'super_admin'`);
        const superAdminRoleId = roleRes[0]?.id;

        if (superAdminRoleId) {
            await prisma.$executeRaw(Prisma.sql`
                INSERT INTO admin_users (email, password_hash, first_name, last_name, role_id, is_active)
                VALUES (${superAdminEmail}, ${passwordHash}, ${'Super'}, ${'Admin'}, ${superAdminRoleId}::uuid, ${true})
                ON CONFLICT (email) DO UPDATE SET
                    password_hash = EXCLUDED.password_hash,
                    role_id = EXCLUDED.role_id,
                    updated_at = NOW()
            `);
            
            console.log(`✅ Super admin created: ${superAdminEmail} / ${superAdminPassword}`);
        }

        // 3. Create demo editor user
        const editorRoleRes = await prisma.$queryRawUnsafe(`SELECT id FROM admin_roles WHERE name = 'editor'`);
        const editorRoleId = editorRoleRes[0]?.id;

        if (editorRoleId) {
            const editorHash = await bcrypt.hash('editor123', 10);
            await prisma.$executeRaw(Prisma.sql`
                INSERT INTO admin_users (email, password_hash, first_name, last_name, role_id, is_active)
                VALUES (${'editor@bondary.com'}, ${editorHash}, ${'Content'}, ${'Editor'}, ${editorRoleId}::uuid, ${true})
                ON CONFLICT (email) DO NOTHING
            `);
            
            console.log('✅ Demo editor created: editor@bondary.com / editor123');
        }

        await prisma.$executeRawUnsafe('COMMIT');
        console.log('🎉 Admin users seeding completed successfully!');
        
        console.log('\n📝 Login Credentials:');
        console.log('   Super Admin: admin@bondary.com / admin123');
        console.log('   Editor:      editor@bondary.com / editor123');

    } catch (err) {
        await prisma.$executeRawUnsafe('ROLLBACK');
        console.error('❌ Seeding failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdminUsers();
