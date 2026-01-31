const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
});

async function check() {
    try {
        const upCount = await pool.query("SELECT count(*) FROM user_preferences");
        console.log('user_preferences count:', upCount.rows[0].count);
        
        const usersCount = await pool.query("SELECT count(*) FROM users");
        console.log('users count:', usersCount.rows[0].count);
        
        const prefInMeta = await pool.query("SELECT count(*) FROM users WHERE raw_user_meta_data->'preferences' IS NOT NULL");
        console.log('users with preferences in meta:', prefInMeta.rows[0].count);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
