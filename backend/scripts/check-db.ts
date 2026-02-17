import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        const res = await prisma.$queryRaw<Array<{ count: string }>>`
            SELECT count(*) FROM information_schema.tables WHERE table_name = 'users'
        `;
        console.log('Users table exists:', res[0].count === '1');
        
        const res2 = await prisma.$queryRaw<Array<{ count: string }>>`
            SELECT count(*) FROM information_schema.tables WHERE table_name = 'circles'
        `;
        console.log('Circles table exists:', res2[0].count === '1');

        const res3 = await prisma.$queryRaw<Array<{ count: string }>>`
            SELECT count(*) FROM information_schema.tables WHERE table_name = 'migration_history'
        `;
        console.log('Migration history table exists:', res3[0].count === '1');
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
