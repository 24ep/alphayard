const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
});

async function inspectTable() {
    try {
        const schema = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.log('Schema of users:');
        console.log(schema.rows.map(r => `${r.column_name}: ${r.data_type}`).join('\n'));
        
        const res = await pool.query("SELECT email, is_active FROM users LIMIT 5");
        console.log('\nSample data:');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

inspectTable();
