const { prisma } = require('../lib/prisma');
require('dotenv').config({ path: '../../../.env' }); // Adjust path as needed

async function check() {
  try {
    const res = await prisma.$queryRawUnsafe('SELECT datname FROM pg_database');
    console.log('Databases:', res.map(r => r.datname));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
