// ============================================================================
// PRISMA CLIENT
// ============================================================================
// 
// Singleton Prisma client for database access
// Usage: import { prisma } from '@/lib/prisma'
//
// ============================================================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
