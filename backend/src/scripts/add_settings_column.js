const { prisma } = require('../lib/prisma');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function addSettingsColumn() {
  try {
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

    await prisma.$executeRawUnsafe(sql);
    console.log('Successfully added settings column to families table');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await prisma.$disconnect();
  }
}

addSettingsColumn();

