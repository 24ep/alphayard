const { PrismaClient } = require('../prisma/generated/prisma');
const prisma = new PrismaClient();

async function checkMigrations() {
    try {
        const res = await prisma.$queryRawUnsafe("SELECT * FROM migrations ORDER BY id");
        console.log('Executed migrations:');
        console.log(JSON.stringify(res, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkMigrations();
