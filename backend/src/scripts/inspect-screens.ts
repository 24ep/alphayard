// @ts-nocheck
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function inspectScreens() {
    try {
        const rows = await prisma.$queryRawUnsafe<any[]>(
            "SELECT name, branding FROM core.applications WHERE is_active = true LIMIT 1"
        );
        
        if (rows.length > 0) {
            const app = rows[0];
            let branding = app.branding || {};
            if (typeof branding === 'string') branding = JSON.parse(branding);
            
            console.log(`App: ${app.name}`);
            console.log('Screens:', JSON.stringify(branding.screens, null, 2));
        } else {
            console.log('No active app found.');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

inspectScreens();
