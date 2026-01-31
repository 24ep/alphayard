const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
});

async function checkMigrations() {
    try {
        const res = await pool.query("SELECT * FROM migrations ORDER BY id");
        console.log('Executed migrations:');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkMigrations();
