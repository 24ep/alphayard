import { pool } from '../config/database';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/user-service.log' })
  ]
});

export interface IUserData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  notificationSettings?: any;
  preferences?: any;
  avatarUrl?: string;
  isOnboardingComplete?: boolean;
}

class UserService {
  /**
   * Create a new user
   */
  async createUser(userData: IUserData) {
    try {
      // Note: mapping to 'phone' based on UserModel.ts
      const { rows } = await pool.query(
        `INSERT INTO users (
          email, first_name, last_name, phone, date_of_birth, 
          notification_settings, preferences, is_onboarding_complete
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          userData.email,
          userData.firstName,
          userData.lastName,
          userData.phoneNumber,
          userData.dateOfBirth,
          userData.notificationSettings || {},
          userData.preferences || {},
          false
        ]
      );

      const data = rows[0];
      logger.info('User created successfully', { userId: data.id, email: data.email });
      return data;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Failed to get user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Failed to get user by email:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updateData: Partial<IUserData>) {
    try {
      // Build dynamic update
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      const mapping: any = {
        firstName: 'first_name',
        lastName: 'last_name',
        phoneNumber: 'phone', // Changed to phone to match UserModel
        dateOfBirth: 'date_of_birth',
        avatarUrl: 'avatar_url',
        notificationSettings: 'notification_settings',
        preferences: 'preferences',
        isOnboardingComplete: 'is_onboarding_complete'
      };

      for (const [key, field] of Object.entries(mapping)) {
        if ((updateData as any)[key] !== undefined) {
          updates.push(`${field} = $${paramIndex++}`);
          params.push((updateData as any)[key]);
        }
      }

      if (updates.length === 0) return this.getUserById(userId);

      updates.push(`updated_at = NOW()`);
      params.push(userId);
      
      const { rows } = await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        params
      );

      logger.info('User updated successfully', { userId });
      return rows[0];
    } catch (error: any) {
      logger.error('Failed to update user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string) {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      logger.info('User deleted successfully', { userId });
      return true;
    } catch (error) {
      logger.error('Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * Get users by circle ID
   */
  async getUsersByCircle(circleId: string) {
    try {
      const { rows } = await pool.query(
        `SELECT 
          cm.user_id,
          cm.role,
          cm.joined_at,
          json_build_object(
            'id', u.id,
            'email', u.email,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'avatar_url', u.avatar_url,
            'phone', u.phone,
            'created_at', u.created_at
          ) as users
        FROM circle_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.circle_id = $1`,
        [circleId]
      );
      return rows;
    } catch (error) {
      logger.error('Failed to get users by circle:', error);
      throw error;
    }
  }

  /**
   * Update user location
   */
  async updateUserLocation(userId: string, locationData: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update current location
      await client.query(
        `INSERT INTO user_locations (user_id, latitude, longitude, accuracy, address, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           accuracy = EXCLUDED.accuracy,
           address = EXCLUDED.address,
           updated_at = NOW()`,
        [userId, locationData.latitude, locationData.longitude, locationData.accuracy, locationData.address]
      );

      // Add to location history
      await client.query(
        `INSERT INTO location_history (user_id, latitude, longitude, accuracy, address)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, locationData.latitude, locationData.longitude, locationData.accuracy, locationData.address]
      );

      await client.query('COMMIT');
      logger.info('User location updated successfully', { userId });
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to update user location:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user location
   */
  async getUserLocation(userId: string) {
    try {
      const { rows } = await pool.query('SELECT * FROM user_locations WHERE user_id = $1', [userId]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Failed to get user location:', error);
      throw error;
    }
  }

  /**
   * Get user location history
   */
  async getUserLocationHistory(userId: string, limit = 100) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM location_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
        [userId, limit]
      );
      return rows;
    } catch (error) {
      logger.error('Failed to get user location history:', error);
      throw error;
    }
  }

  /**
   * Search users
   */
  async searchUsers(searchTerm: string, limit = 20) {
    try {
      const { rows } = await pool.query(
        `SELECT id, email, first_name, last_name, avatar_url 
         FROM users 
         WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
         LIMIT $2`,
        [`%${searchTerm}%`, limit]
      );
      return rows;
    } catch (error) {
      logger.error('Failed to search users:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    try {
      const stats: any = {};

      const circleResult = await pool.query('SELECT COUNT(*) FROM circle_members WHERE user_id = $1', [userId]);
      stats.circleCount = parseInt(circleResult.rows[0].count);

      const messageResult = await pool.query('SELECT COUNT(*) FROM chat_messages WHERE user_id = $1', [userId]);
      stats.messageCount = parseInt(messageResult.rows[0].count);

      const locationResult = await pool.query('SELECT COUNT(*) FROM location_history WHERE user_id = $1', [userId]);
      stats.locationHistoryCount = parseInt(locationResult.rows[0].count);

      return stats;
    } catch (error) {
      logger.error('Failed to get user stats:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;
