const { Client } = require('pg');

async function createSchemas() {
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:EiLTGaCpAAItsFeFGKayThIscerwWSEj@crossover.proxy.rlwy.net:23873/railway";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to database');

    const schemas = ['core', 'admin', 'bondarys'];
    for (const schema of schemas) {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
      console.log(`Schema "${schema}" created or already exists`);
    }
  } catch (err) {
    console.error('Error creating schemas:', err);
  } finally {
    await client.end();
  }
}

createSchemas();
