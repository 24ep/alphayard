#!/usr/bin/env node

const { PrismaClient } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {

  try {
    console.log('✅ Connected to database');

    console.log('🛡️ Setting up social reports...');

    // Create social_reports table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS social_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
          reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          reason VARCHAR(50) NOT NULL,
          description TEXT,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
          reviewed_by UUID REFERENCES users(id),
          reviewed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('   ✅ Table social_reports created/verified');

    // Add columns to social_posts if they don't exist
    // is_reported
    await prisma.$executeRawUnsafe(`
      ALTER TABLE social_posts 
      ADD COLUMN IF NOT EXISTS is_reported BOOLEAN DEFAULT FALSE
    `);
    
    // report_count
    await prisma.$executeRawUnsafe(`
      ALTER TABLE social_posts 
      ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0
    `);

    // last_reported_at
    await prisma.$executeRawUnsafe(`
      ALTER TABLE social_posts 
      ADD COLUMN IF NOT EXISTS last_reported_at TIMESTAMP WITH TIME ZONE
    `);
    
    console.log('   ✅ social_posts columns verified');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
