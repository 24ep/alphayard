const { PrismaClient } = require('../prisma/generated/prisma');
const winston = require('winston');

const prisma = new PrismaClient();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

async function getDatabaseStats() {
  try {
    console.log('📊 Gathering database statistics...\n');

    const tableNames = [
      'users',
      'families', 
      'circle_members',
      'circle_invitations',
      'user_locations',
      'location_history',
      'geofences',
      'location_shares',
      'location_requests',
      'chat_rooms',
      'chat_messages',
      'chat_message_reactions',
      'chat_message_reads',
      'notifications',
      'scheduled_notifications',
      'emergency_alerts',
      'emergency_contacts',
      'safety_checks',
      'safety_check_responses',
      'events',
      'tasks',
      'expenses',
      'shopping_list',
      'photos',
      'documents'
    ];

    console.log('📈 Table Statistics:');
    console.log('┌─────────────────────────┬─────────┬─────────────┐');
    console.log('│ Table Name              │ Records │ Status      │');
    console.log('├─────────────────────────┼─────────┼─────────────┤');

    let totalRecords = 0;
    let errorCount = 0;

    for (const tableName of tableNames) {
      let recordCount = 'N/A';
      let status = '❌ Error';

      try {
        // Quote table name as PostgreSQL identifier to prevent SQL injection
        const quotedTableName = `"${tableName.replace(/"/g, '""')}"`;
        const rows = await prisma.$queryRawUnsafe(`SELECT count(*) as count FROM ${quotedTableName}`);
        recordCount = rows[0].count || 0;
        status = '✅ OK';
        totalRecords += parseInt(recordCount);
      } catch (error) {
        status = '❌ Error';
        errorCount++;
      }

      const paddedTableName = tableName.padEnd(23);
      const paddedCount = recordCount.toString().padStart(7);
      const paddedStatus = status.padEnd(11);

      console.log(`│ ${paddedTableName} │ ${paddedCount} │ ${paddedStatus} │`);
    }

    console.log('└─────────────────────────┴─────────┴─────────────┘');
    console.log(`\n📊 Summary:`);
    console.log(`   Total Records: ${totalRecords.toLocaleString()}`);
    console.log(`   Tables with Errors: ${errorCount}`);
    console.log(`   Tables OK: ${tableNames.length - errorCount}`);

    // Performance metrics
    const start = Date.now();
    await prisma.$queryRawUnsafe('SELECT 1');
    const responseTime = Date.now() - start;
    
    console.log(`\n🏥 Health Status:`);
    console.log(`   Response Time: ${responseTime}ms`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);

    console.log(`\n⚡ Performance:`);
    if (responseTime < 100) {
      console.log('   Response Time: 🟢 Excellent (< 100ms)');
    } else if (responseTime < 500) {
      console.log('   Response Time: 🟡 Good (< 500ms)');
    } else {
      console.log('   Response Time: 🔴 Slow (> 500ms)');
    }

    console.log('\n✅ Database statistics gathered successfully!');
    await prisma.$disconnect();

  } catch (error) {
    console.error('\n❌ Failed to gather database statistics:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run stats if called directly
if (require.main === module) {
  getDatabaseStats();
}

module.exports = getDatabaseStats;
