#!/usr/bin/env node

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };

  console.log('[Setup] Connecting to PostgreSQL...', {
      host: poolConfig.host,
      port: poolConfig.port,
      db: poolConfig.database,
      user: poolConfig.user
  });

  const pool = new Pool(poolConfig);

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    console.log('🌍 Setting up countries table...');

    // Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS countries (
          id SERIAL PRIMARY KEY,
          code VARCHAR(2) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          flag VARCHAR(10) NOT NULL,
          phone_code VARCHAR(10) NOT NULL,
          is_supported BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
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
        await client.query(`
            INSERT INTO countries (code, name, flag, phone_code)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (code) DO UPDATE SET
              name = EXCLUDED.name,
              flag = EXCLUDED.flag,
              phone_code = EXCLUDED.phone_code;
        `, [country.code, country.name, country.flag, country.phone_code]);
    }
    console.log(`   ✅ seeded ${countries.length} countries`);

    client.release();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
