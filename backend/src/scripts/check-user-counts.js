const { PrismaClient } = require('../prisma/generated/prisma');
const prisma = new PrismaClient();

async function check() {
    try {
        const upCount = await prisma.$queryRawUnsafe("SELECT count(*) FROM user_preferences");
        console.log('user_preferences count:', upCount[0].count);
        
        const usersCount = await prisma.$queryRawUnsafe("SELECT count(*) FROM users");
        console.log('users count:', usersCount[0].count);
        
        const prefInMeta = await prisma.$queryRawUnsafe("SELECT count(*) FROM users WHERE raw_user_meta_data->'preferences' IS NOT NULL");
        console.log('users with preferences in meta:', prefInMeta[0].count);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
