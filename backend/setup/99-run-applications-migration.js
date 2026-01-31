#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load root .env (if present)
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
} catch (_) {}

function readSqlFile(filePath) {
  let sql = fs.readFileSync(filePath, 'utf8');
  // Remove common psql meta-commands which are not understood by Postgres protocol
  sql = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('\\'))
    .join('\n');
  return sql;
}

async function applySql(client, filePath) {
  const sql = readSqlFile(filePath);
  process.stdout.write(`\n📄 Running: ${path.basename(filePath)}\n`);
  process.stdout.write(`   📊 File size: ${sql.length} characters\n`);
  await client.query(sql);
  process.stdout.write('   ✅ Migration applied\n');
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  const migrationsDir = path.join(__dirname, '..', 'src', 'database', 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.startsWith('030_')) // Only run 030
    .sort();

  console.log('📋 Running specific migrations:');
  files.forEach((f) => console.log(` - ${f}`));

  if (files.length === 0) {
      console.log('❌ No migration files found with prefix 030_');
  }

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    try {
      await applySql(client, filePath);
    } catch (err) {
      console.error(`   ❌ Error in ${file}: ${err.message}`);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log('\n✅ Specific migrations completed.');
}

main().catch((e) => { console.error(e); process.exit(1); });
