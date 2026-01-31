
const { pool } = require('./src/config/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function describeTable() {
  try {
    console.log('--- TABLE SCHEMA: admin_users ---');
    const { rows } = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'admin_users'
      ORDER BY ordinal_position;
    `);
    console.table(rows);

    console.log('--- TABLE SCHEMA: users ---');
     const { rows: usersRows } = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.table(usersRows);

  } catch (err) {
    console.error('FAILED TO DESCRIBE TABLE:', err);
  } finally {
    await pool.end();
  }
}

describeTable();
