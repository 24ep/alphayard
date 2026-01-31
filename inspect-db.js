const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function inspect() {
  try {
    const { rows } = await pool.query("SELECT value FROM app_settings WHERE key = 'branding' LIMIT 1");
    if (rows.length > 0) {
      console.log('--- TARGET SCREEN: welcome ---');
      const branding = rows[0].value;
      const welcome = branding.screens?.find(s => s.id === 'welcome');
      console.log(JSON.stringify(welcome, null, 2));
    } else {
      console.log('No branding found in app_settings');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

inspect();
