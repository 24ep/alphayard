
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function check() {
  const targetId = '132bb02d-212b-43dc-b74c-79a42f4dbffa';
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  console.log('--- Raw DB Diagnostic ---');
  console.log('Connecting to database...');

  try {
    await client.connect();
    console.log('Connected successfully.');

    // 1. Check schemas/search_path
    const searchPath = await client.query('SHOW search_path');
    console.log('Current search_path:', searchPath.rows[0].search_path);

    // 2. Check Application
    const appRes = await client.query('SELECT id, name FROM applications WHERE id = $1', [targetId]);
    if (appRes.rows.length > 0) {
      console.log('FOUND Application:', appRes.rows[0]);
    } else {
      console.log('Application with ID not found.');
    }

    // 3. Check OAuth Clients (using search path, or trying public/admin)
    try {
      const clientRes = await client.query('SELECT id, client_id, name, application_id FROM oauth_clients');
      console.log(`\nFound ${clientRes.rows.length} total OAuth Clients:`);
      clientRes.rows.forEach(r => {
        console.log(` - [${r.id}] (clientId: ${r.client_id}) ${r.name} (appId: ${r.application_id}) ${r.id === targetId || r.client_id === targetId ? '<< TARGET' : ''}`);
      });
    } catch (e) {
      console.error('Error querying oauth_clients:', e.message);
    }

    // 4. Try looking up the specific ID in oauth_clients specifically
    const specificClientRes = await client.query('SELECT * FROM oauth_clients WHERE id = $1 OR client_id = $2', [targetId, targetId]);
    if (specificClientRes.rows.length > 0) {
      console.log('\nFOUND Specific OAuth Client:', specificClientRes.rows[0]);
    } else {
      console.log('\nSpecific OAuth Client NOT FOUND in oauth_clients table.');
    }

  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
  }
}

check();
