// @ts-nocheck
import { pool } from '../config/database';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function extractScreens(): Promise<Set<string>> {
    const screens = new Set<string>();
    const navigationDir = path.resolve(__dirname, '../../../mobile/src/navigation');
    
    if (!fs.existsSync(navigationDir)) {
        console.error('Navigation directory not found:', navigationDir);
        return screens;
    }

    const files = fs.readdirSync(navigationDir).filter(f => f.endsWith('.tsx'));
    const screenRegex = /name\s*=\s*["']([A-Za-z0-9_\-]+)["']/g;

    for (const file of files) {
        const content = fs.readFileSync(path.join(navigationDir, file), 'utf8');
        let match;
        while ((match = screenRegex.exec(content)) !== null) {
            const screenName = match[1];
            // Skip system/composite routes
            if (!['App', 'Auth', 'Loading', 'MainTab'].includes(screenName)) {
                screens.add(screenName);
            }
        }
    }

    // Also look for tab names in Tab.Screen
    return screens;
}

async function seed() {
    try {
        console.log('🚀 Phase 1: Extracting screens from mobile application...');
        const extracted = await extractScreens();
        console.log(`✅ Extracted ${extracted.size} screens:`, Array.from(extracted).join(', '));

        if (extracted.size === 0) {
            console.warn('⚠️ No screens found. Aborting seed.');
            return;
        }

        console.log('\n🚀 Phase 2: Updating application inventory...');
        const { rows: apps } = await pool.query(
            "SELECT id, name, branding FROM applications WHERE is_active = true"
        );

        console.log(`Found ${apps.length} active applications.`);

        for (const app of apps) {
            console.log(`Processing app: ${app.name} (${app.id})...`);
            
            let branding = app.branding || {};
            if (typeof branding === 'string') branding = JSON.parse(branding);
            
            // Initialize or sanitize screens array
            let screens = branding.screens || [];
            
            // 1. Remove any existing duplicates in the database first
            const uniqueExisting = new Map();
            screens.forEach((s: any) => {
                if (s && s.id && !uniqueExisting.has(s.id.toLowerCase())) {
                    uniqueExisting.set(s.id.toLowerCase(), s);
                }
            });
            
            let addedCount = 0;
            const existingIdsLower = new Set(uniqueExisting.keys());

            // 2. Add only unique new screens (case-insensitive check)
            for (const screenId of extracted) {
                const idLower = screenId.toLowerCase();
                if (!existingIdsLower.has(idLower)) {
                    // Generate a human readable name
                    const name = screenId
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/[-_]/g, ' ')
                        .trim()
                        .replace(/^\w/, c => c.toUpperCase());

                    uniqueExisting.set(idLower, {
                        id: screenId,
                        name: name,
                        background: '',
                        resizeMode: 'cover',
                        type: 'screen',
                        icon: 'document'
                    });
                    existingIdsLower.add(idLower);
                    addedCount++;
                }
            }

            if (addedCount > 0 || uniqueExisting.size !== screens.length) {
                branding.screens = Array.from(uniqueExisting.values());
                await pool.query(
                    "UPDATE applications SET branding = $1, updated_at = NOW() WHERE id = $2",
                    [JSON.stringify(branding), app.id]
                );
                console.log(`   ✅ Processed screens (Added: ${addedCount}, Total: ${uniqueExisting.size}).`);
            } else {
                console.log(`   ✨ Screen inventory already matches mobile application.`);
            }
        }
        
        console.log('\n✅ Extraction and seeding complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error during extraction and seeding:', err);
        process.exit(1);
    }
}

seed();
