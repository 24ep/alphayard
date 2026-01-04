#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load root .env
try {
    require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
} catch (_) { }

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ DATABASE_URL is not set in .env file');
        process.exit(1);
    }

    console.log('🔗 Connecting to database...');
    const client = new Client({ connectionString });
    await client.connect();

    const migrationPath = path.join(__dirname, '..', 'src', 'migrations', '021_create_events_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration: 021_create_events_table.sql');
    console.log('   Creating table: events');

    try {
        await client.query(sql);
        console.log('✅ Migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration error:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
