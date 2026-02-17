const { PrismaClient } = require('../prisma/generated/prisma');
const prisma = new PrismaClient();

async function listTables() {
    try {
        const res = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
        console.log('Tables in public schema:');
        console.log(res.map(r => r.table_name).join('\n'));
    } catch (err) {
        console.error('Error listing tables:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

listTables();
