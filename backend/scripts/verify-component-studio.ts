import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';
dotenv.config();

async function verify() {
    try {
        const catRes = await prisma.$queryRaw<Array<{ count: string }>>`SELECT count(*) FROM component_categories`;
        const styleRes = await prisma.$queryRaw<Array<{ count: string }>>`SELECT count(*) FROM component_styles`;
        console.log(`Categories: ${catRes[0].count}`);
        console.log(`Styles: ${styleRes[0].count}`);
        
        const sample = await prisma.$queryRaw<Array<{ name: string; category_id: string }>>`
            SELECT name, category_id FROM component_styles LIMIT 5
        `;
        console.log('Sample styles:', sample);
    } catch (err: any) {
        console.error('Verification failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
