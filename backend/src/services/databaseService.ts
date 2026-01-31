import { pool } from '../config/database';

class DatabaseService {
  async connect() {
    try {
      // Test the pool connection
      const client = await pool.connect();
      console.log('✅ PostgreSQL connected successfully');
      client.release();
    } catch (error) {
      console.error('❌ PostgreSQL connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    await pool.end();
    console.log('PostgreSQL disconnected');
  }
}

export const databaseService = new DatabaseService();
export default databaseService;
