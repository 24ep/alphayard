const { Client } = require('pg');
require('dotenv').config({ path: './.env' }); // Adjust path if needed

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Add parent_id to social_comments
        await client.query(`
      ALTER TABLE social_comments 
      ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES social_comments(id) ON DELETE CASCADE;
    `);
        console.log('Added parent_id column');

        await client.end();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
