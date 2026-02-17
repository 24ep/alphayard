#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { prisma } = require('../lib/prisma');

// Load ONLY the root .env (single source of truth)
const rootEnvPath = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: rootEnvPath });

function parseDotEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const out = {};
    fs.readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^(\w+?)=(.*)$/);
      if (m) out[m[1]] = m[2];
    });
    return out;
  } catch {
    return {};
  }
}

const fileEnv = { ...parseDotEnvFile(rootEnvPath) };
for (const [k, v] of Object.entries(fileEnv)) {
  if (!process.env[k] && v) process.env[k] = v;
}

function getArg(name) {
  const idx = process.argv.findIndex((a) => a === `--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return undefined;
}

function getDbConfig() {
  const databaseUrl = getArg('database-url') || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required. Set it in the repository root .env or pass --database-url');
  }
  return { databaseUrl };
}

class PgMigrationRunner {
  constructor() {
    const { databaseUrl } = getDbConfig();
    this.databaseUrl = databaseUrl;
    this.migrationsPath = path.join(__dirname, '..', 'database', 'migrations');
  }

  async connect() {
    // Prisma connects automatically
  }

  async ensureMigrationsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        checksum VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await prisma.$executeRawUnsafe(sql);
  }

  getMigrationFiles() {
    if (!fs.existsSync(this.migrationsPath)) {
      fs.mkdirSync(this.migrationsPath, { recursive: true });
      return [];
    }
    return fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  parseMigrationFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Support optional "-- UP"/"-- DOWN" markers; otherwise treat whole file as UP
    const hasMarkers = /--\s*UP/i.test(content) || /--\s*DOWN/i.test(content);
    if (hasMarkers) {
      const upPart = content.split(/--\s*DOWN/i)[0] || '';
      const up = upPart.replace(/--\s*UP/i, '').trim();
      const down = (content.split(/--\s*DOWN/i)[1] || '').trim();
      return { up, down };
    }
    return { up: content, down: '' };
  }

  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async getExecutedMigrations() {
    const res = await prisma.$queryRawUnsafe('SELECT * FROM migrations ORDER BY id');
    const map = new Map();
    res.forEach(row => map.set(row.id, row));
    return map;
  }

  async executeSQL(sql) {
    await prisma.$executeRawUnsafe(sql);
  }

  async migrate() {
    console.log('🚀 Starting Postgres database migration...');
    await this.connect();
    await this.ensureMigrationsTable();

    const migrationFiles = this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();
    const executedIds = [];
    const failedMigrations = [];

    for (const file of migrationFiles) {
      const migrationId = file.replace('.sql', '');
      if (executedMigrations.has(migrationId)) continue;
      try {
        const filePath = path.join(this.migrationsPath, file);
        const { up } = this.parseMigrationFile(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        const checksum = this.calculateChecksum(content);

        console.log(`🔄 Running migration: ${migrationId}`);
        await this.executeSQL(up);
        await prisma.$executeRawUnsafe(
          `INSERT INTO migrations (id, name, checksum, executed_at) VALUES ('${migrationId}', '${file}', '${checksum}', NOW())`
        );
        executedIds.push(migrationId);
        console.log(`✅ Migration completed: ${migrationId}`);
      } catch (error) {
        const msg = error?.message || String(error);
        console.error(`❌ Migration failed: ${migrationId}`, msg);
        failedMigrations.push({ id: migrationId, error: msg });
      }
    }

    await prisma.$disconnect();

    const result = { success: failedMigrations.length === 0, message: `Executed ${executedIds.length} migrations, ${failedMigrations.length} failed`, executedMigrations: executedIds, failedMigrations };
    if (!result.success) {
      console.error('📋 Failed migrations:', JSON.stringify(result.failedMigrations, null, 2));
    }
    return result;
  }
}

async function main() {
  const command = process.argv[2];
  try {
    const runner = new PgMigrationRunner();
    switch (command) {
      case 'migrate': {
        const result = await runner.migrate();
        if (!result.success) process.exit(1);
        break;
      }
      default:
        console.log('Usage: node run-migrations.js migrate [--database-url <postgres connection string>]');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error?.message || error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PgMigrationRunner;
