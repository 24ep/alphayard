const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
});

async function check() {
    const tables = ['house_types', 'circle_types', 'house_management', 'circle_profiles', 'users', 'user_preferences'];
    for (const table of tables) {
        const res = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)", [table]);
        console.log(`${table}: ${res.rows[0].exists}`);
    }
    await pool.end();
}

check();
