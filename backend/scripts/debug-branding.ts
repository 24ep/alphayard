import fs from 'fs';
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';


async function debugBranding() {
  const output: string[] = [];
  const log = (msg: string) => output.push(msg);

  try {
    log('--- Checking public.app_settings ---');
    const settingsRaw = await prisma.$queryRawUnsafe(`SELECT value FROM public.app_settings WHERE key = 'branding'`);
    // @ts-ignore
    if (settingsRaw.length > 0) {
        // @ts-ignore
        const val = settingsRaw[0].value;
        const branding = typeof val === 'string' ? JSON.parse(val) : val;
        log(`public.app_settings branding found.`);
        if (branding.screens) {
            log(`Screens count: ${branding.screens.length}`);
            branding.screens.forEach((s: any) => {
                log(`SCREEN_ID: ${s.id}`);
            });
        } else {
            log('No screens array in public.app_settings!');
        }
    } else {
        log('No branding key in public.app_settings');
    }

    log('\n--- Checking core.applications ---');
    const apps: any[] = await prisma.$queryRawUnsafe(`SELECT id, name, branding FROM core.applications WHERE is_active = true`);
    if (apps.length > 0) {
        const app = apps[0];
        log(`Active App: ${app.name} (${app.id})`);
        let branding = app.branding;
        if (typeof branding === 'string') branding = JSON.parse(branding);
        
        if (branding?.screens) {
             log(`Screens count: ${branding.screens.length}`);
             branding.screens.forEach((s: any) => {
                log(`SCREEN_ID: ${s.id}`);
            });
        } else {
            log('No screens in core.applications branding');
        }
    } else {
        log('No active core.applications found');
    }

  } catch (error) {
    log(`Error: ${error}`);
  } finally {
    fs.writeFileSync('debug_output.txt', output.join('\n'));
    await prisma.$disconnect();
  }
}

debugBranding();
