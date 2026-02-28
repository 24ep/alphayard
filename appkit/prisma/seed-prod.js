// Production seed script - runs with plain Node.js (no tsx/ts-node needed)
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  const prisma = new PrismaClient()
  try {
    const hash = await bcrypt.hash('admin123', 12)
    const user = await prisma.user.upsert({
      where: { email: 'admin@appkit.com' },
      update: { passwordHash: hash, isActive: true, isVerified: true, userType: 'admin' },
      create: {
        email: 'admin@appkit.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: hash,
        isActive: true,
        isVerified: true,
        userType: 'admin',
      },
    })
    console.log(`[seed] Admin user ready: ${user.email} (id: ${user.id})`)
  } catch (error) {
    console.error('[seed] Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
