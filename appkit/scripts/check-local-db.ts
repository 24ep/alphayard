import { PrismaClient } from '@prisma/client';

async function check() {
  const url = 'postgresql://postgres:postgres@localhost:5432/postgres';
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });
  
  try {
    const r: any = await prisma.$queryRawUnsafe('SELECT version()');
    console.log('LOCAL_DB_VERSION:' + r[0].version);
    
    const schemas: any = await prisma.$queryRawUnsafe("SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('public', 'admin', 'core', 'bondarys')");
    console.log('LOCAL_SCHEMAS:' + schemas.map((s: any) => s.schema_name).join(','));
  } catch (e: any) {
    console.log('LOCAL_DB_ERROR:' + e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
