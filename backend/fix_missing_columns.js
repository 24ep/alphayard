
const { PrismaClient } = require('./prisma/generated/prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to users table...');
    
    const queries = [
      `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS raw_user_meta_data JSONB DEFAULT '{}'`,
      `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_onboarding_complete BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'circle'`,
      `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(50)`,
      `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'`
    ];

    for (const q of queries) {
      console.log(`Executing: ${q}`);
      await prisma.$executeRawUnsafe(q);
    }

    console.log('✅ Missing columns added successfully.');
  } catch (err) {
    console.error('❌ Error adding columns:', err);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns();
