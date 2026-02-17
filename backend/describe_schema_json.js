
const { PrismaClient } = require('./prisma/generated/prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Fallback
if (!process.env.DB_HOST) {
    require('dotenv').config({ path: path.resolve(__dirname, '.env') });
}

async function describeTable() {
  try {
    const tables = ['admin_users', 'users', 'admin_roles'];
    const result = {};
    
    for (const table of tables) {
        const rows = await prisma.$queryRawUnsafe(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, table);
        result[table] = rows;
    }
    fs.writeFileSync('schema_output.json', JSON.stringify(result, null, 2), 'utf8');
    console.log('Schema written to schema_output.json');

  } catch (err) {
    console.error('FAILED TO DESCRIBE TABLE:', err);
  } finally {
    await prisma.$disconnect();
  }
}

describeTable();
