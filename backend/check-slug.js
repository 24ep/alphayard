const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const apps = await prisma.application.findMany();
    console.log('Applications in DB:', JSON.stringify(apps.map(a => ({ name: a.name, slug: a.slug })), null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
