
import { PrismaClient } from '../prisma/generated/prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    const tables = ['entity_relations', 'unified_entities', 'entity_types', 'entities', 'entity_attributes'];
    console.log('Checking tables...');
    
    for (const table of tables) {
      const result = await prisma.$queryRawUnsafe(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${table}'
        ) as exists
      `);
      console.log(`Table '${table}': ${result[0].exists ? 'EXISTS' : 'MISSING'}`);
    }
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
