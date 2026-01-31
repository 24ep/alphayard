const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

async function checkSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const tables = [
    'pages', 'page_components', 'component_definitions', 'templates',
    'page_versions', 'page_hierarchy', 'publishing_workflows', 'page_audit_log'
  ];

  console.log('--- Tables ---');
  for (const table of tables) {
    const res = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)", [table]);
    console.log(`${table}: ${res.rows[0].exists ? 'EXISTS' : 'MISSING'}`);
  }

  const triggers = [
    'trigger_create_page_version', 'trigger_update_page_hierarchy',
    'trigger_log_page_audit', 'trigger_check_published_url'
  ];

  console.log('\n--- Triggers ---');
  for (const trigger of triggers) {
    const res = await client.query("SELECT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = $1)", [trigger]);
    console.log(`${trigger}: ${res.rows[0].exists ? 'EXISTS' : 'MISSING'}`);
  }

  await client.end();
}

checkSchema().catch(console.error);
