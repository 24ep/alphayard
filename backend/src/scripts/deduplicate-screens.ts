// @ts-nocheck
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function deduplicateScreens() {
    try {
        console.log('🚀 Deduplicating Screens...');
        
        const apps = await prisma.$queryRawUnsafe<any[]>(
            "SELECT id, name, branding FROM core.applications WHERE is_active = true"
        );

        for (const app of apps) {
            let branding = app.branding || {};
            if (typeof branding === 'string') branding = JSON.parse(branding);
            

            const screens = branding.screens || [];
            
            // JUNK IDs to remove
            const JUNK_IDS = new Set([
                'home-heart', 
                'account', 
                'account-multiple', 
                'chat-processing', 
                'PinSetup', // Duplicate of SetupPin
                'apps'      // likely icon name
            ]);

            const uniqueScreens = [];
            const seenIds = new Set();
            
            let duplicatesCount = 0;

            for (const screen of screens) {
                // Skip junk
                if (JUNK_IDS.has(screen.id)) {
                    console.log(`🗑️ Removing junk ID: ${screen.id}`);
                    duplicatesCount++;
                    continue;
                }

                // Deduplicate by ID
                if (!seenIds.has(screen.id)) {
                    seenIds.add(screen.id);
                    uniqueScreens.push(screen);
                } else {
                    console.log(`🗑️ Removing duplicate ID: ${screen.id}`);
                    duplicatesCount++;
                }
            }

            if (duplicatesCount > 0) {
                branding.screens = uniqueScreens;
                await prisma.$executeRawUnsafe(
                    "UPDATE core.applications SET branding = $1, updated_at = NOW() WHERE id = $2",
                    JSON.stringify(branding), app.id
                );
                console.log(`✅ Removed ${duplicatesCount} duplicates for ${app.name}`);
            } else {
                console.log(`👍 No duplicates found for ${app.name}`);
            }
        }

        console.log('\n✨ Deduplication complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

deduplicateScreens();
