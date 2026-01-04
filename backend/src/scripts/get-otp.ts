
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '54322'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function main() {
    try {
        console.log('Connecting to DB...');
        // Query auth.users directly
        const res = await pool.query(`
            SELECT id, email, raw_user_meta_data, created_at, updated_at
            FROM auth.users
            ORDER BY updated_at DESC 
            LIMIT 5
        `);

        console.log('\n--- Recent Users OTPs (auth.users) ---');
        if (res.rows.length === 0) {
            console.log('No users found in auth.users.');
        }

        res.rows.forEach(row => {
            const metadata = row.raw_user_meta_data || {};
            console.log(`User: ${row.email}`);
            console.log(`Updated: ${row.updated_at}`);
            console.log(`OTP: ${metadata.loginOtp || 'None'}`);
            console.log(`Expiry: ${metadata.loginOtpExpiry || 'None'}`);
            console.log('-------------------------');
        });

    } catch (err: any) {
        console.error('Error fetching OTP:', err.message);
    } finally {
        await pool.end();
    }
}

main();
