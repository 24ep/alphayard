// @ts-nocheck
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const SUGGESTED_SCREENS = [
    // Auth Flow
    { id: 'getstart', name: 'Get Started', type: 'screen' },
    { id: 'marketing', name: 'Marketing', type: 'screen' },
    { id: 'market-menu', name: 'Market Menu', type: 'screen' },
    { id: 'login', name: 'Login', type: 'screen' },
    { id: 'register', name: 'Register', type: 'screen' },
    { id: 'forgot-password', name: 'Forgot Password', type: 'screen' },
    { id: 'twofactor-method', name: '2FA Method Select', type: 'screen' },
    { id: 'twofactor-verify', name: '2FA Code Confirm', type: 'screen' },
    { id: 'welcome', name: 'Welcome', type: 'screen' },
    { id: 'workplace-info', name: 'Workplace Info', type: 'screen' },
    
    // Setup & Security
    { id: 'pin-setup', name: 'PIN Setup', type: 'screen' },
    { id: 'pin-unlock', name: 'PIN Unlock', type: 'screen' },
    { id: 'language-selection', name: 'Language Selection', type: 'screen' },
    { id: 'onboarding', name: 'Onboarding', type: 'screen' },

    // Main Tabs
    { id: 'personal', name: 'Personal (Main)', type: 'screen' },
    { id: 'circle-main', name: 'Circle (Main)', type: 'screen' },
    { id: 'social-main', name: 'Social (Main)', type: 'screen' },
    { id: 'chat-list-main', name: 'Chat List', type: 'screen' },
    { id: 'apps-main', name: 'Apps (Main)', type: 'screen' },

    // Core Screens
    { id: 'profile', name: 'Profile', type: 'screen' },
    { id: 'settings', name: 'Settings', type: 'screen' },
    { id: 'notifications', name: 'Notifications', type: 'screen' },
    { id: 'circle-settings', name: 'Circle Settings', type: 'screen' },

    // Circle Feature
    { id: 'circle-detail', name: 'Circle Detail', type: 'screen' },
    { id: 'circle-list', name: 'Circle List', type: 'screen' },

    // Social Feature
    { id: 'news', name: 'News', type: 'screen' },
    { id: 'news-detail', name: 'News Detail', type: 'screen' },

    // Chat Feature
    { id: 'chat-room', name: 'Individual Chat', type: 'screen' },
    { id: 'new-chat', name: 'New Chat', type: 'screen' },

    // Apps & Tools
    { id: 'gallery', name: 'Gallery', type: 'modal' },
    { id: 'calendar', name: 'Calendar', type: 'screen' },
    { id: 'notes', name: 'Notes', type: 'screen' },
    { id: 'second-hand-shop', name: 'Second Hand Shop', type: 'screen' },
    { id: 'storage', name: 'Storage', type: 'screen' },
    
    // Mood & Emotion
    { id: 'emotion-check-in', name: 'Emotion Check-In', type: 'card' },
    { id: 'mood-analysis', name: 'Mood Analysis', type: 'screen' },
    
    // Misc
    { id: 'support', name: 'Support Help', type: 'screen' },
    { id: 'terms', name: 'Terms & Conditions', type: 'modal' },
];

async function seed() {
    try {
        console.log('Connected to database');

        console.log('Fetching active applications...');
        const apps = await prisma.$queryRawUnsafe<any[]>(
            "SELECT id, name, branding FROM core.applications WHERE is_active = true"
        );

        console.log(`Found ${apps.length} active applications.`);

        for (const app of apps) {
            console.log(`Seeding screens for app: ${app.name} (${app.id})...`);
            
            let branding = app.branding || {};
            // Parse if it's a string (though pg usually handles json columns automatically)
            if (typeof branding === 'string') branding = JSON.parse(branding);
            
            if (!branding.screens) branding.screens = [];

            const existingIds = new Set(branding.screens.map((s: any) => s.id));
            let addedCount = 0;

            SUGGESTED_SCREENS.forEach(suggested => {
                if (!existingIds.has(suggested.id)) {
                    branding.screens.push({
                        id: suggested.id,
                        name: suggested.name,
                        background: '',
                        resizeMode: 'cover',
                        type: suggested.type,
                        icon: 'document'
                    });
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                await prisma.$executeRaw`
                    UPDATE core.applications SET branding = ${JSON.stringify(branding)}::jsonb, updated_at = NOW() WHERE id = ${app.id}::uuid
                `;
                console.log(`   ✅ Added ${addedCount} screens.`);
            } else {
                console.log(`   ✨ Inventory already up to date.`);
            }
        }
        
        console.log('✅ Seeding complete for all applications.');

    } catch (err) {
        console.error('Error seeding screens:', err);
    } finally {
        await prisma.$disconnect();
    }
}


seed();
