
const { PrismaClient } = require('./prisma/generated/prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetPassword() {
  const email = 'admin@bondarys.com';
  const newPassword = 'password';
  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await prisma.$queryRawUnsafe(
        "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id",
        passwordHash, email.toLowerCase()
    );
    if (result.length > 0) {
        console.log(`✅ Password reset successfully for ${email}`);
        console.log(`New Password: ${newPassword}`);
    } else {
        console.log(`❌ User ${email} not found.`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
