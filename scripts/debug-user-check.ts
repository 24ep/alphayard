
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '54322'),
});

async function checkUser() {
    const email = 'jaroonwitpool@gmail.com';
    console.log('Checking for user:', email);
    console.log('DB Config:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        db: process.env.DB_NAME
    });

    try {
        const res = await pool.query('SELECT * FROM auth.users WHERE email = $1', [email]);
        console.log('Found in auth.users:', res.rows.length);
        if (res.rows.length > 0) {
            console.log('User ID:', res.rows[0].id);
            console.log('User Email:', res.rows[0].email);
        } else {
            console.log('Query returned NO rows.');
            // Debug: list all users
            const all = await pool.query('SELECT email FROM auth.users LIMIT 5');
            console.log('Sample users in DB:', all.rows.map(r => r.email));
        }
    } catch (err) {
        console.error('Database Error:', err);
    } finally {
        await pool.end();
    }
}

checkUser();
