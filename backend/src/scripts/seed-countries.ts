import { prisma } from '../lib/prisma';
import { Prisma } from '../../prisma/generated/prisma/client';

async function seedCountries() {
    const countries = [
        { code: 'TH', name: 'Thailand', flag: '🇹🇭', phone_code: '+66', is_supported: true },
        { code: 'US', name: 'United States', flag: '🇺🇸', phone_code: '+1', is_supported: true },
        { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phone_code: '+44', is_supported: true },
        { code: 'JP', name: 'Japan', flag: '🇯🇵', phone_code: '+81', is_supported: true },
        { code: 'SG', name: 'Singapore', flag: '🇸🇬', phone_code: '+65', is_supported: true },
        { code: 'VN', name: 'Vietnam', flag: '🇻🇳', phone_code: '+84', is_supported: true },
        { code: 'FR', name: 'France', flag: '🇫🇷', phone_code: '+33', is_supported: true },
        { code: 'DE', name: 'Germany', flag: '🇩🇪', phone_code: '+49', is_supported: true },
        { code: 'CN', name: 'China', flag: '🇨🇳', phone_code: '+86', is_supported: true },
        { code: 'KR', name: 'South Korea', flag: '🇰🇷', phone_code: '+82', is_supported: true },
        { code: 'IN', name: 'India', flag: '🇮🇳', phone_code: '+91', is_supported: true },
        { code: 'AU', name: 'Australia', flag: '🇦🇺', phone_code: '+61', is_supported: true },
    ];

    try {
        console.log('Seeding countries...');

        // Check if table exists
        const tableCheck = await prisma.$queryRaw<Array<{ exists: boolean }>>(Prisma.sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'core' 
        AND table_name = 'countries'
      ) as exists;
    `);

        if (!tableCheck[0]?.exists) {
            console.log('Creating countries table...');
            await prisma.$executeRaw(Prisma.sql`
            CREATE TABLE IF NOT EXISTS core.countries (
                id SERIAL PRIMARY KEY,
                code VARCHAR(2) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                flag VARCHAR(10),
                phone_code VARCHAR(10),
                is_supported BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        }

        for (const country of countries) {
            await prisma.$executeRaw(Prisma.sql`
                INSERT INTO core.countries (code, name, flag, phone_code, is_supported)
         VALUES (${country.code}, ${country.name}, ${country.flag}, ${country.phone_code}, ${country.is_supported})
         ON CONFLICT (code) DO UPDATE 
         SET name = EXCLUDED.name, 
             flag = EXCLUDED.flag, 
             phone_code = EXCLUDED.phone_code, 
             is_supported = EXCLUDED.is_supported,
             updated_at = CURRENT_TIMESTAMP
            `);
        }

        console.log('Countries seeded successfully!');
    } catch (error) {
        console.error('Error seeding countries:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedCountries();
