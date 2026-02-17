const dotenv = require('dotenv');
const path = require('path');

// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const { PrismaClient, Prisma } = require('../prisma/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create PostgreSQL adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
    try {
        await prisma.$executeRawUnsafe('BEGIN');

        console.log('🚀 Seeding Bondarys App (Unified Version)...');

        // 1. Create Bondary App
        const branding = JSON.stringify({
            primaryColor: '#0d7eff',
            secondaryColor: '#0066e6',
            logo: 'https://cdn-icons-png.flaticon.com/512/3665/3665922.png',
            welcomeBackgroundImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop',
            loginBackgroundImage: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2029&auto=format&fit=crop',
            signupBackgroundImage: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2029&auto=format&fit=crop',
            homeBackgroundImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2029&auto=format&fit=crop',
            primaryFont: 'Inter',
            secondaryFont: 'Inter',
            screens: [
                {
                    id: 'welcome',
                    name: 'Welcome',
                    background: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop',
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'login',
                    name: 'Login / Sign Up',
                    background: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2029&auto=format&fit=crop',
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'signup',
                    name: 'Signup Flow',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FA7272', position: 0 },
                            { id: '2', color: '#FFBBB4', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.7
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'step1-username-screen',
                    name: 'Step 1: Username',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FA7272', position: 0 },
                            { id: '2', color: '#FFBBB4', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.7
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'step2-password-screen',
                    name: 'Step 2: Password',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FA7272', position: 0 },
                            { id: '2', color: '#FFBBB4', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.7
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'step3-circle-screen',
                    name: 'Step 3: Circle Selection',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FA7272', position: 0 },
                            { id: '2', color: '#FFBBB4', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.7
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'step3-create-circle-screen',
                    name: 'Step 3: Create Circle',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FA7272', position: 0 },
                            { id: '2', color: '#FFBBB4', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.7
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'step3-join-circle-screen',
                    name: 'Step 3: Join Circle',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FA7272', position: 0 },
                            { id: '2', color: '#FFBBB4', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.7
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'step4-invite-circle-screen',
                    name: 'Step 4: Invite Circle',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FA7272', position: 0 },
                            { id: '2', color: '#FFBBB4', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.7
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'step4-name-screen',
                    name: 'Step 4: Name',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FA7272', position: 0 },
                            { id: '2', color: '#FFBBB4', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.7
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'step5-personal-info-screen',
                    name: 'Step 5: Personal Info',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FA7272', position: 0 },
                            { id: '2', color: '#FFBBB4', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.7
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'step6-survey-screen',
                    name: 'Step 6: Survey',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FA7272', position: 0 },
                            { id: '2', color: '#FFBBB4', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.7
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'home',
                    name: 'Home (You)',
                    background: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2029&auto=format&fit=crop',
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'circle',
                    name: 'Circle',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#E0E7FF', position: 0 },
                            { id: '2', color: '#F3F4F6', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.5
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'social',
                    name: 'Social',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FEF3C7', position: 0 },
                            { id: '2', color: '#FFFFFF', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.6
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'apps',
                    name: 'Workspace (Apps)',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#DBEAFE', position: 0 },
                            { id: '2', color: '#F9FAFB', position: 100 }
                        ],
                        gradientDirection: 'to bottom right',
                        overlayOpacity: 0.5
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'profile',
                    name: 'Profile',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#F3E8FF', position: 0 },
                            { id: '2', color: '#FFFFFF', position: 100 }
                        ],
                        gradientDirection: 'to bottom',
                        overlayOpacity: 0.4
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'settings',
                    name: 'Settings',
                    background: {
                        type: 'solid',
                        value: '#F9FAFB',
                        overlayOpacity: 0
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'notifications',
                    name: 'Notifications',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#FEF3C7', position: 0 },
                            { id: '2', color: '#FFFFFF', position: 100 }
                        ],
                        gradientDirection: 'to bottom',
                        overlayOpacity: 0.3
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'chat-room',
                    name: 'Chat Room',
                    background: {
                        type: 'solid',
                        value: '#FFFFFF',
                        overlayOpacity: 0
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                },
                {
                    id: 'circle-detail',
                    name: 'Circle Detail',
                    background: {
                        type: 'gradient',
                        gradientStops: [
                            { id: '1', color: '#E0E7FF', position: 0 },
                            { id: '2', color: '#F9FAFB', position: 100 }
                        ],
                        gradientDirection: 'to bottom',
                        overlayOpacity: 0.4
                    },
                    resizeMode: 'cover',
                    type: 'screen'
                }
            ],
            flows: {
                login: {
                    requireEmailVerification: false,
                    allowSocialLogin: true,
                    termsAcceptedOn: 'login',
                    passwordPolicy: 'standard'
                },
                signup: {
                    requireEmailVerification: true,
                    allowSocialLogin: true,
                    termsAcceptedOn: 'signup',
                    passwordPolicy: 'standard'
                },
                onboarding: {
                    enabled: true,
                    slides: [],
                    isSkippable: true
                },
                survey: {
                    enabled: true,
                    trigger: 'after_onboarding',
                    slides: []
                }
            }
        });
        const settings = JSON.stringify({
            allowRegistration: true,
            requireEmailVerification: false,
            componentStyles: {
                categories: [
                    { id: 'buttons', name: 'Buttons', icon: 'buttons', components: [
                        { id: 'primary', name: 'Primary Button', styles: { backgroundColor: { mode: 'solid', solid: '#0d7eff' }, textColor: { mode: 'solid', solid: '#FFFFFF' }, borderRadius: 12, shadowLevel: 'sm' } }
                    ]},
                    { id: 'cards', name: 'Cards', icon: 'cards', components: [
                        { id: 'default', name: 'Default Card', styles: { backgroundColor: { mode: 'solid', solid: 'rgba(255, 255, 255, 0.9)' }, textColor: { mode: 'solid', solid: '#1f2937' }, borderRadius: 16, shadowLevel: 'md' } }
                    ]}
                ]
            }
        });
        
        const appRes = await prisma.$queryRaw(Prisma.sql`
            INSERT INTO core.applications (name, slug, description, branding, settings, is_active)
            VALUES (${'Bondary'}, ${'bondary'}, ${'Main Bondary mobile and web application'}, ${branding}::jsonb, ${settings}::jsonb, ${true})
            ON CONFLICT (slug) DO UPDATE SET 
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                branding = EXCLUDED.branding,
                updated_at = NOW()
            RETURNING id
        `);

        const appId = appRes[0].id;
        console.log(`✅ Bondarys App seeded with ID: ${appId}`);

        // 2. Create a test user
        const userId = 'f739edde-45f8-4aa9-82c8-c1876f434683'; // Fixed ID for testing
        await prisma.$executeRaw(Prisma.sql`
            INSERT INTO core.users (id, email, first_name, last_name, is_active)
            VALUES (${userId}::uuid, ${'test@example.com'}, ${'Test'}, ${'User'}, true)
            ON CONFLICT (id) DO UPDATE SET 
                email = EXCLUDED.email,
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name
        `);
        console.log(`✅ Test user created.`);

        // 3. Create a default circle
        const circleRes = await prisma.$queryRaw(Prisma.sql`
            INSERT INTO bondarys.circles (owner_id, name, description, is_active)
            VALUES (${userId}::uuid, ${'Bondarys Home'}, ${'Our family home circle'}, true)
            RETURNING id
        `);

        const circleId = circleRes[0].id;
        console.log(`✅ Default circle created with ID: ${circleId}`);

        // 4. Create circle membership (owner is automatically a member)
        await prisma.$executeRaw(Prisma.sql`
            INSERT INTO bondarys.circle_members (circle_id, user_id, role)
            VALUES (${circleId}::uuid, ${userId}::uuid, ${'owner'})
            ON CONFLICT (circle_id, user_id) DO NOTHING
        `);
        console.log(`✅ Circle membership created.`);

        // 5. Create app_settings for global branding (used by AppConfigController)
        const brandingSettings = JSON.stringify({
            appName: 'Bondarys',
            primaryColor: '#FA7272',
            secondaryColor: '#FFD700',
            logoUrl: '/assets/logo.png',
            logoWhiteUrl: '/assets/logo-white.png',
            loginBackground: {
                type: 'image',
                value: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2029&auto=format&fit=crop',
                overlayOpacity: 0.4
            },
            signupBackground: {
                type: 'gradient',
                gradientStops: [
                    { id: '1', color: '#FA7272', position: 0 },
                    { id: '2', color: '#FFBBB4', position: 100 }
                ],
                gradientDirection: 'to bottom right',
                overlayOpacity: 0.7
            },
            flows: {
                login: {
                    requireEmailVerification: false,
                    allowSocialLogin: true,
                    termsAcceptedOn: 'login',
                    passwordPolicy: 'standard'
                },
                signup: {
                    requireEmailVerification: true,
                    allowSocialLogin: true,
                    termsAcceptedOn: 'signup',
                    passwordPolicy: 'standard'
                }
            }
        });
        await prisma.$executeRaw(Prisma.sql`
            INSERT INTO core.app_settings (application_id, key, value, description)
            VALUES (${appId}::uuid, ${'branding'}, ${brandingSettings}::jsonb, ${'Global application branding settings'})
            ON CONFLICT (application_id, key) DO UPDATE SET 
                value = EXCLUDED.value,
                updated_at = NOW()
        `);
        console.log(`✅ Global app_settings branding created.`);

        await prisma.$executeRawUnsafe('COMMIT');
        console.log('🎉 Seeding completed successfully!');
    } catch (err) {
        await prisma.$executeRawUnsafe('ROLLBACK');
        console.error('❌ Seeding failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
