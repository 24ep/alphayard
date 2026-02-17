
import { prisma } from '../lib/prisma';

async function verifyColumns() {
  try {
    const res = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'users'
    `;
    const columns = res.map(r => r.column_name);
    console.log('Columns:', columns.join(', '));
    
    const check = ['user_type', 'subscription_tier', 'circle_ids'];
    check.forEach(c => {
        console.log(`${c}: ${columns.includes(c) ? 'EXISTS' : 'MISSING'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

verifyColumns();
