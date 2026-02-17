const { prisma } = require('../lib/prisma');
require('dotenv').config({ path: '../../../.env' });

async function check() {
  try {
    const res = await prisma.$queryRawUnsafe("SELECT * FROM information_schema.tables WHERE table_name = 'house_types'");
    if (res.length > 0) {
      console.log('Table house_types exists.');
      const rows = await prisma.$queryRawUnsafe('SELECT * FROM house_types');
      console.log('Row count:', rows.length);
    } else {
      console.log('Table house_types does NOT exist.');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
