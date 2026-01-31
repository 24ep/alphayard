const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

async function runSeed() {
    const seedSqlPath = path.join(__dirname, '../src/database/seed.sql');
    const sql = fs.readFileSync(seedSqlPath, 'utf8');

    console.log('🚀 Running seed.sql...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log('✅ seed.sql applied successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Failed to apply seed.sql:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runSeed();
