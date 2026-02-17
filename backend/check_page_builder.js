const { PrismaClient, Prisma } = require('./prisma/generated/prisma/client');
require('dotenv').config({ path: '../.env' });

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    const tables = [
      'pages', 'page_components', 'component_definitions', 'templates',
      'page_versions', 'page_hierarchy', 'publishing_workflows', 'page_audit_log'
    ];

    console.log('--- Tables ---');
    for (const table of tables) {
      const res = await prisma.$queryRaw(
        Prisma.sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = ${table})`
      ) as Array<{ exists: boolean }>;
      console.log(`${table}: ${res[0].exists ? 'EXISTS' : 'MISSING'}`);
    }

    const triggers = [
      'trigger_create_page_version', 'trigger_update_page_hierarchy',
      'trigger_log_page_audit', 'trigger_check_published_url'
    ];

    console.log('\n--- Triggers ---');
    for (const trigger of triggers) {
      const res = await prisma.$queryRaw(
        Prisma.sql`SELECT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = ${trigger})`
      ) as Array<{ exists: boolean }>;
      console.log(`${trigger}: ${res[0].exists ? 'EXISTS' : 'MISSING'}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema().catch(console.error);
