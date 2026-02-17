import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';
dotenv.config();

async function listTables() {
    try {
        const res = await prisma.$queryRaw<Array<{ table_name: string }>>`
            SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name
        `;
        res.forEach(r => console.log(r.table_name));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

listTables();
