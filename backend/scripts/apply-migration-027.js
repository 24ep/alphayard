const { PrismaClient } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, '../src/database/migrations/027_refine_entity_types.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Applying migration 027...');
    await prisma.$executeRawUnsafe(sql);
    console.log('✅ Migration 027 applied successfully!');

    // Verification
    const rows = await prisma.$queryRawUnsafe('SELECT name, title, api_endpoint, response_key FROM entity_types WHERE name IN (\'note\', \'todo\', \'circles\', \'users\')');
    console.log('\n📊 Seeding Verification:');
    rows.forEach(r => {
      console.log(`   - [${r.name}] Title: ${r.title}, API: ${r.api_endpoint}, Key: ${r.response_key}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
