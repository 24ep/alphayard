import { pool } from '../config/database';

const APP_ID = '0c9a083f-b369-4805-8a4f-b04ca57cba5a';

const solidColor = (color: string) => ({ mode: 'solid', solid: color });

const branding = {
    appName: 'Bondarys',
    mobileAppName: 'Bondarys',
    primaryColor: solidColor('#E8B4A1'),
    secondaryColor: solidColor('#D4A574'),
    primaryFont: 'Inter',
    secondaryFont: 'Inter',
    typography: {
        h1: { family: 'Inter', size: 28, weight: '700', lineHeight: 1.3 },
        h2: { family: 'Inter', size: 24, weight: '600', lineHeight: 1.35 },
        body: { family: 'Inter', size: 16, weight: '400', lineHeight: 1.6 },
        caption: { family: 'Inter', size: 12, weight: '400', lineHeight: 1.4 },
    },
    tokens: {
        primaryGradient: { start: '#E8B4A1', end: '#D4A574', angle: 45, enabled: true },
        secondaryGradient: { start: '#FFFFFF', end: '#F5F5F5', angle: 180, enabled: false },
        glassmorphism: { enabled: true, blur: 10, opacity: 0.8 },
        borderRadius: 'medium'
    },
    categories: [
        {
            id: 'buttons',
            name: 'Buttons',
            components: [
                {
                    id: 'primary',
                    name: 'Primary Button',
                    styles: {
                        backgroundColor: solidColor('#E8B4A1'),
                        textColor: solidColor('#FFFFFF'),
                        borderRadius: 12,
                        borderColor: solidColor('transparent'),
                        shadowLevel: 'sm'
                    }
                }
            ]
        },
        {
            id: 'cards',
            name: 'Cards',
            components: [
                {
                    id: 'standard',
                    name: 'Standard Card',
                    styles: {
                        backgroundColor: solidColor('#FFFFFF'),
                        borderRadius: 12,
                        borderColor: solidColor('#EEEEEE'),
                        shadowLevel: 'md'
                    }
                }
            ]
        }
    ]
};

async function seed() {
    try {
        console.log(`Deep Seeding styles for Bondarys app...`);
        
        // 1. Update applications table settings field
        await pool.query(
            "UPDATE applications SET settings = jsonb_set(COALESCE(settings, '{}'), '{branding}', $1), name = 'Bondarys' WHERE id = $2",
            [JSON.stringify(branding), APP_ID]
        );

        // 2. Also update branding field in applications table (if used separately)
        await pool.query(
            "UPDATE applications SET branding = $1 WHERE id = $2",
            [JSON.stringify(branding), APP_ID]
        );

        // 3. Update app_settings table for mobile backend
        await pool.query(
            `INSERT INTO app_settings (key, value) 
             VALUES ('branding', $1)
             ON CONFLICT (key) DO UPDATE SET value = $1`,
            [JSON.stringify(branding)]
        );

        console.log('✅ Mobile styles extracted and seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
