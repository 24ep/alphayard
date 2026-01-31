const { pool } = require('./src/config/database');
async function listTables() {
  try {
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in public schema:');
    rows.forEach(r => console.log('- ' + r.table_name));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
listTables();
