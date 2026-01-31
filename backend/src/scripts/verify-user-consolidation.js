const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
});

async function verify() {
    try {
        const res = await pool.query("SELECT email, raw_user_meta_data FROM users WHERE raw_user_meta_data->'preferences' IS NOT NULL LIMIT 5");
        console.log('Users with consolidated preferences:');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

verify();
