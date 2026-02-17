const { PrismaClient } = require('../prisma/generated/prisma');
const prisma = new PrismaClient();

async function inspectTable() {
    try {
        const res = await prisma.$queryRawUnsafe("SELECT * FROM house_management LIMIT 5");
        console.log('Data in house_management:');
        console.log(JSON.stringify(res, null, 2));
        
        const schema = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'house_management'");
        console.log('\nSchema of house_management:');
        console.log(schema.map(r => `${r.column_name}: ${r.data_type}`).join('\n'));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

inspectTable();
