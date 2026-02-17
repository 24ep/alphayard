// @ts-nocheck
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

/**
 * Extract screen names from navigation files
 */
async function extractScreensFromNavigation(): Promise<Set<string>> {
    const screens = new Set<string>();
    const navigationDir = path.resolve(__dirname, '../../../mobile/src/navigation');
    
    if (!fs.existsSync(navigationDir)) {
        console.warn('Navigation directory not found:', navigationDir);
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
            if (!['App', 'Auth', 'Loading', 'MainTab', 'Root'].includes(screenName)) {
                screens.add(screenName);
            }
        }
    }

    return screens;
}

/**
 * Extract screen names from actual screen files
 */
async function extractScreensFromFiles(): Promise<Map<string, string>> {
    const screens = new Map<string, string>(); // id -> display name
    const screensDir = path.resolve(__dirname, '../../../mobile/src/screens');
    
    if (!fs.existsSync(screensDir)) {
        console.warn('Screens directory not found:', screensDir);
        return screens;
    }

    function scanDirectory(dir: string, basePath: string = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
            
            if (entry.isDirectory()) {
                // Skip test directories
                if (entry.name !== '__tests__' && entry.name !== '__mocks__') {
                    scanDirectory(fullPath, relativePath);
                }
            } else if (entry.isFile() && entry.name.endsWith('Screen.tsx')) {
                // Extract screen name from filename
                const screenId = entry.name.replace('Screen.tsx', '');
                // Convert PascalCase to readable name
                const displayName = screenId
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/[-_]/g, ' ')
                    .trim()
                    .replace(/^\w/, c => c.toUpperCase());
                
                // Create a unique ID based on path
                const pathParts = relativePath.split('/').filter(p => p);
                const category = pathParts.length > 1 ? pathParts[0] : '';
                const screenKey = category ? `${category}-${screenId}` : screenId;
                
                screens.set(screenKey.toLowerCase(), displayName);
            }
        }
    }

    scanDirectory(screensDir);
    return screens;
}

/**
 * Get comprehensive list of all mobile screens
 */
async function getAllMobileScreens(): Promise<Map<string, { id: string; name: string; type: string }>> {
    const allScreens = new Map<string, { id: string; name: string; type: string }>();
    
    // Extract from navigation files
    const navScreens = await extractScreensFromNavigation();
    navScreens.forEach(screenId => {
        const name = screenId
            .replace(/([A-Z])/g, ' $1')
            .replace(/[-_]/g, ' ')
            .trim()
            .replace(/^\w/, c => c.toUpperCase());
        
        allScreens.set(screenId.toLowerCase(), {
            id: screenId,
            name: name,
            type: 'screen'
        });
    });
    
    // Extract from screen files
    const fileScreens = await extractScreensFromFiles();
    fileScreens.forEach((displayName, screenKey) => {
        // Use the key as ID, but prefer navigation names if they exist
        if (!allScreens.has(screenKey)) {
            // Try to match by removing category prefix
            const baseId = screenKey.includes('-') 
                ? screenKey.split('-').slice(1).join('-')
                : screenKey;
            
            // Check if we have a navigation match
            const navMatch = Array.from(navScreens).find(n => 
                n.toLowerCase() === baseId || n.toLowerCase() === screenKey
            );
            
            allScreens.set(screenKey, {
                id: navMatch || screenKey,
                name: displayName,
                type: 'screen'
            });
        }
    });
    
    return allScreens;
}

async function seed() {
    try {
        console.log('🚀 Phase 1: Extracting screens from mobile application...');
        
        const allScreens = await getAllMobileScreens();
        console.log(`✅ Extracted ${allScreens.size} screens:`);
        Array.from(allScreens.values()).slice(0, 20).forEach(s => {
            console.log(`   - ${s.id}: ${s.name}`);
        });
        if (allScreens.size > 20) {
            console.log(`   ... and ${allScreens.size - 20} more`);
        }

        if (allScreens.size === 0) {
            console.warn('⚠️ No screens found. Aborting seed.');
            return;
        }

        console.log('\n🚀 Phase 2: Updating application inventory in admin...');
        const apps = await prisma.$queryRawUnsafe<any[]>(
            "SELECT id, name, branding FROM core.applications WHERE is_active = true"
        );

        console.log(`Found ${apps.length} active application(s).`);

        let totalAdded = 0;
        let totalUpdated = 0;

        for (const app of apps) {
            console.log(`\nProcessing app: ${app.name} (${app.id})...`);
            
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
            allScreens.forEach((screenData, screenKey) => {
                const idLower = screenData.id.toLowerCase();
                if (!existingIdsLower.has(idLower)) {
                    uniqueExisting.set(idLower, {
                        id: screenData.id,
                        name: screenData.name,
                        background: '',
                        resizeMode: 'cover',
                        type: screenData.type || 'screen',
                        icon: 'document'
                    });
                    existingIdsLower.add(idLower);
                    addedCount++;
                }
            });

            if (addedCount > 0 || uniqueExisting.size !== screens.length) {
                branding.screens = Array.from(uniqueExisting.values());
                await prisma.$executeRawUnsafe(
                    "UPDATE core.applications SET branding = $1, updated_at = NOW() WHERE id = $2",
                    JSON.stringify(branding), app.id
                );
                console.log(`   ✅ Added ${addedCount} new screens. Total screens: ${uniqueExisting.size}`);
                totalAdded += addedCount;
                totalUpdated++;
            } else {
                console.log(`   ✨ Screen inventory already up to date (${uniqueExisting.size} screens).`);
            }
        }
        
        console.log('\n✅ Seeding complete!');
        console.log(`   - Applications updated: ${totalUpdated}`);
        console.log(`   - Total screens added: ${totalAdded}`);
        process.exit(0);

    } catch (err) {
        console.error('❌ Error during seeding:', err);
        process.exit(1);
    }
}

seed();
