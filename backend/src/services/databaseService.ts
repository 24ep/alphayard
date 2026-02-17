import { prisma } from '../lib/prisma';

class DatabaseService {
  async connect() {
    try {
      // Test the Prisma connection
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ PostgreSQL connected successfully');
    } catch (error) {
      console.error('❌ PostgreSQL connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    await prisma.$disconnect();
    console.log('PostgreSQL disconnected');
  }
}

export const databaseService = new DatabaseService();
export default databaseService;
