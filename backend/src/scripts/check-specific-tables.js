const { PrismaClient } = require('../prisma/generated/prisma');
const prisma = new PrismaClient();

async function check() {
    const tables = ['house_types', 'circle_types', 'house_management', 'circle_profiles', 'users', 'user_preferences'];
    for (const table of tables) {
        // Escape table name properly for SQL string literal
        const escapedTable = table.replace(/'/g, "''");
        const res = await prisma.$queryRawUnsafe(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${escapedTable}') as exists`);
        console.log(`${table}: ${res[0].exists}`);
    }
    await prisma.$disconnect();
}

check();
