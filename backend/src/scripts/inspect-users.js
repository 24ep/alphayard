const { PrismaClient } = require('../prisma/generated/prisma');
const prisma = new PrismaClient();

async function inspectTable() {
    try {
        const schema = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.log('Schema of users:');
        console.log(schema.map(r => `${r.column_name}: ${r.data_type}`).join('\n'));
        
        const res = await prisma.$queryRawUnsafe("SELECT email, is_active FROM users LIMIT 5");
        console.log('\nSample data:');
        console.log(JSON.stringify(res, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

inspectTable();
