const { PrismaClient } = require('../../prisma/generated/prisma/client');
require('dotenv').config({ path: '../../../.env' });

async function createDb() {
  // Connect to default 'postgres' database to create new db
  const connectionString = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL.replace(/\/[^/]+$/, '/postgres') 
    : 'postgresql://postgres:postgres@localhost:5432/postgres';

  // For database creation, we need a direct connection to postgres database
  // Prisma doesn't support CREATE DATABASE directly, so we'll use a temporary client
  const { Client } = require('pg');
  const client = new Client({ connectionString });

  try {
    await client.connect();
    
    // Drop database if exists to ensure clean state
    console.log('Dropping database boundary if it exists...');
    // We need to terminate connections first usually, but for local dev this might work or require more logic
    // FORCE drop by terminating other connections
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'boundary'
        AND pid <> pg_backend_pid();
    `);
    await client.query('DROP DATABASE IF EXISTS boundary');

    console.log('Creating database boundary...');
    await client.query('CREATE DATABASE boundary');
    console.log('Database boundary created!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
}

createDb();
