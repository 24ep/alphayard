const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables (mimic env.ts logic)
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
// fallback
dotenv.config({ path: path.resolve(__dirname, '.env') });

const config = {
    connectionString: process.env.DATABASE_URL
};

if (!config.connectionString) {
    config.host = process.env.DB_HOST || 'localhost';
    config.port = process.env.DB_PORT || 54322;
    config.database = process.env.DB_NAME || 'postgres';
    config.user = process.env.DB_USER || 'postgres';
    config.password = process.env.DB_PASSWORD || 'postgres';
}

const pool = new Pool(config);

async function checkTables() {
    try {
        console.log('Checking for chat tables...');
        const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chat_rooms', 'chat_messages', 'chat_message_reactions', 'chat_message_reads')
    `);

        console.log('Found tables:', result.rows.map(r => r.table_name));

        if (result.rows.length === 4) {
            console.log('All chat tables present.');
        } else {
            console.log(`Missing some tables. Found ${result.rows.length}/4.`);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error checking tables:', err);
        process.exit(1);
    }
}

checkTables();
