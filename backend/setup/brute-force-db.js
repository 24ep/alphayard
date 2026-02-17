const { PrismaClient } = require('../src/prisma/generated/prisma');

const passwords = [
    'postgres',
    'supabase',
    'password',
    'admin',
    'root',
    'your-super-secret-and-long-postgres-password',
    'bondarys'
];

async function main() {
    console.log('🔍 Testing passwords on 127.0.0.1:54322...');

    for (const pass of passwords) {
        const connectionString = `postgresql://postgres:${pass}@127.0.0.1:54322/postgres`;
        // Temporarily override DATABASE_URL for this connection attempt
        const originalUrl = process.env.DATABASE_URL;
        process.env.DATABASE_URL = connectionString;
        const prisma = new PrismaClient();

        try {
            await prisma.$connect();
            console.log(`✅ SUCCESS! Password is: "${pass}"`);
            await prisma.$disconnect();
            // Restore original URL before exiting
            if (originalUrl) process.env.DATABASE_URL = originalUrl;
            process.exit(0);
        } catch (err) {
            console.log(`❌ Failed: "${pass}" - ${err.message}`);
            await prisma.$disconnect().catch(() => {});
        } finally {
            // Restore original URL
            if (originalUrl) process.env.DATABASE_URL = originalUrl;
        }
    }

    console.log('🔴 All passwords failed.');
    process.exit(1);
}

main();
