#!/usr/bin/env node

const { PrismaClient } = require('../src/prisma/generated/prisma');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL missing in root .env');
    process.exit(1);
  }
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;

    GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
  `);
  await prisma.$disconnect();
  console.log('✅ exec_sql function ready');
}

main().catch((e) => { console.error(e.message); process.exit(1); });


