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
        const res = await pool.query("SELECT * FROM house_management LIMIT 5");
        console.log('Data in house_management:');
        console.log(JSON.stringify(res.rows, null, 2));
        
        const schema = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'house_management'");
        console.log('\nSchema of house_management:');
        console.log(schema.rows.map(r => `${r.column_name}: ${r.data_type}`).join('\n'));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

inspectTable();
