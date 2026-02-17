const { PrismaClient } = require('../prisma/generated/prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function runMigration() {
  try {
    console.log('Running safety incidents admin migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../src/database/migrations/010_safety_incidents_admin.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await prisma.$executeRawUnsafe(migrationSQL);
    
    console.log('✅ Safety incidents admin migration completed successfully!');
    
    // Verify the migration
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'safety_alerts' 
      AND column_name IN ('acknowledged_by', 'acknowledged_at', 'resolved_by', 'resolved_at', 'device_info', 'app_version', 'battery_level', 'network_type')
      ORDER BY column_name
    `);
    
    console.log('✅ Verified new columns in safety_alerts table:');
    result.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check if emergency_contacts table exists
    const contactsTable = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'emergency_contacts'
      )
    `);
    
    if (contactsTable[0].exists) {
      console.log('✅ emergency_contacts table created successfully');
    }
    
    // Check if safety_incident_contacts table exists
    const incidentContactsTable = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'safety_incident_contacts'
      )
    `);
    
    if (incidentContactsTable[0].exists) {
      console.log('✅ safety_incident_contacts table created successfully');
    }
    
    // Check if safety_incident_family_members table exists
    const incidentMembersTable = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'safety_incident_family_members'
      )
    `);
    
    if (incidentMembersTable[0].exists) {
      console.log('✅ safety_incident_family_members table created successfully');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration().catch(console.error);
