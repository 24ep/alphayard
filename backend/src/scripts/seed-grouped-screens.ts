// @ts-nocheck
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const GROUPS = [
    { id: 'auth', name: 'Authentication', icon: 'lock', patterns: ['login', 'register', 'auth', 'welcome', 'otp', 'forgot', 'pin', 'onboarding'] },
    { id: 'main', name: 'Core Experience', icon: 'home', patterns: ['main', 'home', 'feed', 'circle', 'social', 'chat', 'apps', 'gallery', 'calendar', 'notes'] },
    { id: 'settings', name: 'Profile & Settings', icon: 'cog', patterns: ['profile', 'settings', 'account', 'notifications', 'privacy'] }
];

async function seedGroupedScreens() {
    try {
        console.log('🚀 Extracting and Grouping Screens...');
        
        const apps = await prisma.$queryRawUnsafe<any[]>(
            "SELECT id, name, branding FROM core.applications WHERE is_active = true"
        );

        for (const app of apps) {
            let branding = app.branding || {};
            if (typeof branding === 'string') branding = JSON.parse(branding);
            
            // 1. Initialize Groups
            branding.screenGroups = GROUPS.map(g => ({ id: g.id, name: g.name, icon: g.icon }));
            
            // 2. Assign screens to groups based on ID patterns
            const screens = branding.screens || [];
            branding.screens = screens.map(screen => {
                const id = screen.id.toLowerCase();
                let groupId = 'other';
                
                for (const group of GROUPS) {
                    if (group.patterns.some(p => id.includes(p))) {
                        groupId = group.id;
                        break;
                    }
                }
                
                return { ...screen, groupId };
            });

            // Add 'Other' group if needed
            if (!branding.screenGroups.some(g => g.id === 'other')) {
                branding.screenGroups.push({ id: 'other', name: 'Uncategorized', icon: 'folder' });
            }

            await prisma.$executeRawUnsafe(
                "UPDATE core.applications SET branding = $1, updated_at = NOW() WHERE id = $2",
                JSON.stringify(branding), app.id
            );
            console.log(`✅ Grouped screens for ${app.name}`);
        }

        console.log('\n✨ Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

seedGroupedScreens();
