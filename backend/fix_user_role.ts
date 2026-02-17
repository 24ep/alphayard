
import { prisma } from './src/lib/prisma';

async function main() {
  const userId = '95937de0-404d-41a2-ad76-8de35d1f048e';
  
  try {
    // 1. Fetch current user to get existing metadata
    const res = await prisma.$queryRawUnsafe<any[]>(`SELECT raw_user_meta_data FROM users WHERE id = $1`, userId);
    if (res.length === 0) {
      console.log('User not found');
      process.exit(1);
    }
    
    const currentMeta = res[0].raw_user_meta_data || {};
    console.log('Current metadata:', currentMeta);

    // 2. Update metadata with role: admin
    const newMeta = { ...currentMeta, role: 'admin' };
    
    await prisma.$executeRawUnsafe(
      `UPDATE users SET raw_user_meta_data = $1 WHERE id = $2`,
      JSON.stringify(newMeta), userId
    );

    console.log('Successfully updated user role to admin.');
    
    // 3. Verify
    const verifyRes = await prisma.$queryRawUnsafe<any[]>(`SELECT raw_user_meta_data FROM users WHERE id = $1`, userId);
    console.log('New metadata:', verifyRes[0].raw_user_meta_data);

  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await prisma.$disconnect();
  }
  process.exit();
}

main();
