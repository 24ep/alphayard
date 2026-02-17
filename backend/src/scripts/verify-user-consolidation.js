const { PrismaClient } = require('../prisma/generated/prisma');
const prisma = new PrismaClient();

async function verify() {
    try {
        const res = await prisma.$queryRawUnsafe("SELECT email, raw_user_meta_data FROM users WHERE raw_user_meta_data->'preferences' IS NOT NULL LIMIT 5");
        console.log('Users with consolidated preferences:');
        console.log(JSON.stringify(res, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
