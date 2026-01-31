
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Fallback
if (!process.env.DB_HOST) {
    require('dotenv').config({ path: path.resolve(__dirname, '.env') });
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function describeTable() {
  try {
    const tables = ['admin_users', 'users', 'admin_roles'];
    const result = {};
    
    for (const table of tables) {
        const { rows } = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [table]);
        result[table] = rows;
    }
    fs.writeFileSync('schema_output.json', JSON.stringify(result, null, 2), 'utf8');
    console.log('Schema written to schema_output.json');

  } catch (err) {
    console.error('FAILED TO DESCRIBE TABLE:', err);
  } finally {
    await pool.end();
  }
}

describeTable();
