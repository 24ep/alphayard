
// @ts-nocheck
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

async function check() {
    try {
        await client.connect();
        console.log('Connected to database');

        const rooms = await client.query('SELECT count(*) FROM chat_rooms');
        const msgs = await client.query('SELECT count(*) FROM chat_messages');
        console.log('Chat Rooms:', rooms.rows[0].count);
        console.log('Chat Messages:', msgs.rows[0].count);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

check();
