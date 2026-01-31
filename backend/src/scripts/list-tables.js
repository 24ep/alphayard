const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
});

async function listTables() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
        console.log('Tables in public schema:');
        console.log(res.rows.map(r => r.table_name).join('\n'));
    } catch (err) {
        console.error('Error listing tables:', err.message);
    } finally {
        await pool.end();
    }
}

listTables();
