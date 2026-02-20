import { PrismaClient } from '@prisma/client';

async function check() {
  const prisma = new PrismaClient();
  try {
    console.log('--- START DIAG ---');
    const tables: any = await prisma.$queryRawUnsafe("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'admin_users'");
    tables.forEach((t: any) => {
      console.log(`FOUND_TABLE:${t.table_schema}.${t.table_name}`);
    });

    const schemas: any = await prisma.$queryRawUnsafe("SELECT schema_name FROM information_schema.schemata");
    console.log('SCHEMAS:' + schemas.map((s: any) => s.schema_name).join(','));
    console.log('--- END DIAG ---');
  } catch (e: any) {
    console.log('DIAG_ERROR:' + e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
