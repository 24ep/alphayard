const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

async function inspect() {
    const client = await pool.connect();
    try {
        console.log('--- Columns in circles ---');
        const cols = await client.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'circles'
            ORDER BY ordinal_position;
        `);
        console.table(cols.rows);

        console.log('\n--- Constraints on circles ---');
        const cons = await client.query(`
            SELECT conname, pg_get_constraintdef(oid)
            FROM pg_constraint
            WHERE conrelid = 'circles'::regclass;
        `);
        console.table(cons.rows);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

inspect();
