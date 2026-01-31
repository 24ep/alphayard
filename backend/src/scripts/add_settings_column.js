const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function addSettingsColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sql = `
      ALTER TABLE families
      ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
        "locationSharing": true,
        "circleChat": true,
        "emergencyAlerts": true,
        "circleCalendar": true,
        "circleExpenses": false,
        "circleShopping": true,
        "circleHealth": false,
        "circleEntertainment": true
      }'::jsonb;
    `;

    await client.query(sql);
    console.log('Successfully added settings column to families table');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await client.end();
  }
}

addSettingsColumn();

