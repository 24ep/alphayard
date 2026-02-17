#!/usr/bin/env node

const { PrismaClient, Prisma } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  console.log('[Setup] Connecting to PostgreSQL...');

  try {
    console.log('✅ Connected to database');

    console.log('🌍 Setting up countries table...');

    // Create table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS countries (
          id SERIAL PRIMARY KEY,
          code VARCHAR(2) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          flag VARCHAR(10) NOT NULL,
          phone_code VARCHAR(10) NOT NULL,
          is_supported BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('   ✅ Table created');

    // Insert data
    const countries = [
        { code: 'US', name: 'United States', flag: '🇺🇸', phone_code: '+1' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', phone_code: '+1' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phone_code: '+44' },
      { code: 'AU', name: 'Australia', flag: '🇦🇺', phone_code: '+61' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪', phone_code: '+49' },
      { code: 'FR', name: 'France', flag: '🇫🇷', phone_code: '+33' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵', phone_code: '+81' },
      { code: 'CN', name: 'China', flag: '🇨🇳', phone_code: '+86' },
      { code: 'IN', name: 'India', flag: '🇮🇳', phone_code: '+91' },
      { code: 'BR', name: 'Brazil', flag: '🇧🇷', phone_code: '+55' },
      { code: 'IT', name: 'Italy', flag: '🇮🇹', phone_code: '+39' },
      { code: 'ES', name: 'Spain', flag: '🇪🇸', phone_code: '+34' },
      { code: 'MX', name: 'Mexico', flag: '🇲🇽', phone_code: '+52' },
      { code: 'KR', name: 'South Korea', flag: '🇰🇷', phone_code: '+82' },
      { code: 'RU', name: 'Russia', flag: '🇷🇺', phone_code: '+7' },
      { code: 'ZA', name: 'South Africa', flag: '🇿🇦', phone_code: '+27' },
      { code: 'NG', name: 'Nigeria', flag: '🇳🇬', phone_code: '+234' },
      { code: 'SE', name: 'Sweden', flag: '🇸🇪', phone_code: '+46' },
      { code: 'NO', name: 'Norway', flag: '🇳🇴', phone_code: '+47' },
      { code: 'DK', name: 'Denmark', flag: '🇩🇰', phone_code: '+45' }
    ];

    console.log('   🌱 Seeding data...');
    for (const country of countries) {
        await prisma.$executeRaw(Prisma.sql`
            INSERT INTO countries (code, name, flag, phone_code)
            VALUES (${country.code}, ${country.name}, ${country.flag}, ${country.phone_code})
            ON CONFLICT (code) DO UPDATE SET
              name = EXCLUDED.name,
              flag = EXCLUDED.flag,
              phone_code = EXCLUDED.phone_code
        `);
    }
    console.log(`   ✅ seeded ${countries.length} countries`);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
