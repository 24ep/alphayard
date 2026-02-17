import { prisma } from '../src/lib/prisma';
async function run() {
    await prisma.$executeRaw`
        INSERT INTO migration_history (name) VALUES ('003_add_communication_tables.sql') ON CONFLICT DO NOTHING
    `;
    console.log('Done');
    await prisma.$disconnect();
}
run();
