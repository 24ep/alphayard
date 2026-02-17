import { prisma } from '../src/lib/prisma';
async function run() {
    const res = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
        SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'admin_users' ORDER BY ordinal_position
    `;
    console.log('admin_users columns:', res);
    await prisma.$disconnect();
}
run();
