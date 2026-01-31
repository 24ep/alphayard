const { Client } = require('pg');
require('dotenv').config({ path: '../../../.env' }); // Adjust path as needed

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\/[^/]+$/, '/postgres') : 'postgresql://postgres:postgres@localhost:5432/postgres' });
  try {
    await client.connect();
    const res = await client.query('SELECT datname FROM pg_database');
    console.log('Databases:', res.rows.map(r => r.datname));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
}

check();
