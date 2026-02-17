
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });
dotenv.config();

async function main() {
    try {
        console.log('Connecting to DB...');
        // Query auth.users directly
        const res = await prisma.$queryRaw<Array<{
            id: string;
            email: string;
            raw_user_meta_data: any;
            created_at: Date;
            updated_at: Date;
        }>>`
            SELECT id, email, raw_user_meta_data, created_at, updated_at
            FROM auth.users
            ORDER BY updated_at DESC 
            LIMIT 5
        `;

        console.log('\n--- Recent Users OTPs (auth.users) ---');
        if (res.length === 0) {
            console.log('No users found in auth.users.');
        }

        res.forEach(row => {
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
        await prisma.$disconnect();
    }
}

main();
