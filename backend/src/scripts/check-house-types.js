const { Client } = require('pg');
require('dotenv').config({ path: '../../../.env' });

async function check() {
  const customConnectionString = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL.replace(/\/[^/]+$/, '/boundary') 
  : 'postgresql://postgres:postgres@localhost:5432/boundary';

  const client = new Client({ connectionString: customConnectionString });

  try {
    await client.connect();
    const res = await client.query("SELECT * FROM information_schema.tables WHERE table_name = 'house_types'");
    if (res.rows.length > 0) {
      console.log('Table house_types exists.');
      const rows = await client.query('SELECT * FROM house_types');
      console.log('Row count:', rows.rows.length);
    } else {
      console.log('Table house_types does NOT exist.');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
}

check();
