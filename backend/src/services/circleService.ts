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
    new winston.transports.File({ filename: 'logs/circle-service.log' })
  ]
});

export interface ICircle {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  settings: any;
  created_at: Date;
  updated_at: Date;
}

export interface ICircleData {
  name: string;
  description?: string;
  createdBy: string;
  settings?: any;
}

class CircleService {
  /**
   * Create a new circle
   */
  async createCircle(circleData: ICircleData): Promise<ICircle> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO circles (name, description, created_by, settings)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [circleData.name, circleData.description, circleData.createdBy, circleData.settings || {}]
      );

      const circle = rows[0];

      // Add creator as admin member
      await client.query(
        `INSERT INTO circle_members (circle_id, user_id, role)
         VALUES ($1, $2, $3)`,
        [circle.id, circleData.createdBy, 'admin']
      );

      await client.query('COMMIT');
      logger.info('Circle created successfully', { circleId: circle.id, name: circle.name });
      return circle;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create circle:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get circle by ID
   */
  async getCircleById(circleId: string): Promise<any> {
    try {
      // Get circle and its members in one structure using a complex query or multiple queries
      const { rows: circleRows } = await pool.query('SELECT * FROM circles WHERE id = $1', [circleId]);
      if (circleRows.length === 0) return null;

      const circle = circleRows[0];

      const { rows: memberRows } = await pool.query(
        `SELECT 
          cm.user_id,
          cm.role,
          cm.joined_at,
          json_build_object(
            'id', u.id,
            'email', u.email,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'avatar_url', u.avatar_url
          ) as users
        FROM circle_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.circle_id = $1`,
        [circleId]
      );

      circle.circle_members = memberRows;
      return circle;
    } catch (error) {
      logger.error('Failed to get circle by ID:', error);
      throw error;
    }
  }

  /**
   * Update circle
   */
  async updateCircle(circleId: string, updateData: Partial<ICircleData>): Promise<ICircle> {
    try {
      const { rows } = await pool.query(
        `UPDATE circles SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          settings = COALESCE($3, settings),
          updated_at = NOW()
         WHERE id = $4 RETURNING *`,
        [updateData.name, updateData.description, updateData.settings, circleId]
      );

      logger.info('Circle updated successfully', { circleId });
      return rows[0];
    } catch (error) {
      logger.error('Failed to update circle:', error);
      throw error;
    }
  }

  /**
   * Delete circle
   */
  async deleteCircle(circleId: string): Promise<boolean> {
    try {
      await pool.query('DELETE FROM circles WHERE id = $1', [circleId]);
      logger.info('Circle deleted successfully', { circleId });
      return true;
    } catch (error) {
      logger.error('Failed to delete circle:', error);
      throw error;
    }
  }

  /**
   * Add member to circle
   */
  async addCircleMember(circleId: string, userId: string, role = 'member'): Promise<any> {
    try {
      const { rows } = await pool.query(
        `INSERT INTO circle_members (circle_id, user_id, role)
         VALUES ($1, $2, $3) RETURNING *`,
        [circleId, userId, role]
      );

      logger.info('Circle member added successfully', { circleId, userId, role });
      return rows[0];
    } catch (error) {
      logger.error('Failed to add circle member:', error);
      throw error;
    }
  }

  /**
   * Remove member from circle
   */
  async removeCircleMember(circleId: string, userId: string): Promise<boolean> {
    try {
      await pool.query('DELETE FROM circle_members WHERE circle_id = $1 AND user_id = $2', [circleId, userId]);
      logger.info('Circle member removed successfully', { circleId, userId });
      return true;
    } catch (error) {
      logger.error('Failed to remove circle member:', error);
      throw error;
    }
  }

  /**
   * Update circle member role
   */
  async updateCircleMemberRole(circleId: string, userId: string, newRole: string): Promise<any> {
    try {
      const { rows } = await pool.query(
        'UPDATE circle_members SET role = $1 WHERE circle_id = $2 AND user_id = $3 RETURNING *',
        [newRole, circleId, userId]
      );

      logger.info('Circle member role updated successfully', { circleId, userId, newRole });
      return rows[0];
    } catch (error) {
      logger.error('Failed to update circle member role:', error);
      throw error;
    }
  }

  /**
   * Get circles for user
   */
  async getCirclesForUser(userId: string): Promise<any[]> {
    try {
      const { rows } = await pool.query(
        `SELECT 
          cm.role,
          cm.joined_at,
          json_build_object(
            'id', c.id,
            'name', c.name,
            'description', c.description,
            'settings', c.settings,
            'created_at', c.created_at,
            'updated_at', c.updated_at
          ) as circles
        FROM circle_members cm
        JOIN circles c ON cm.circle_id = c.id
        WHERE cm.user_id = $1`,
        [userId]
      );
      return rows;
    } catch (error) {
      logger.error('Failed to get circles for user:', error);
      throw error;
    }
  }

  /**
   * Check if user is circle member
   */
  async isCircleMember(circleId: string, userId: string): Promise<string | null> {
    try {
      const { rows } = await pool.query(
        'SELECT role FROM circle_members WHERE circle_id = $1 AND user_id = $2',
        [circleId, userId]
      );
      return rows.length > 0 ? rows[0].role : null;
    } catch (error) {
      logger.error('Failed to check circle membership:', error);
      throw error;
    }
  }

  /**
   * Get circle members
   */
  async getCircleMembers(circleId: string): Promise<any[]> {
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
            'phone_number', u.phone
          ) as users
        FROM circle_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.circle_id = $1
        ORDER BY cm.joined_at ASC`,
        [circleId]
      );
      return rows;
    } catch (error) {
      logger.error('Failed to get circle members:', error);
      throw error;
    }
  }

  /**
   * Create circle invitation
   */
  async createCircleInvitation(circleId: string, email: string, role = 'member'): Promise<any> {
    try {
      const { rows } = await pool.query(
        `INSERT INTO circle_invitations (circle_id, email, role, status)
         VALUES ($1, $2, $3, 'pending') RETURNING *`,
        [circleId, email.toLowerCase(), role]
      );

      logger.info('Circle invitation created successfully', { circleId, email, role });
      return rows[0];
    } catch (error) {
      logger.error('Failed to create circle invitation:', error);
      throw error;
    }
  }

  /**
   * Get circle invitations
   */
  async getCircleInvitations(circleId: string): Promise<any[]> {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM circle_invitations WHERE circle_id = $1 ORDER BY created_at DESC',
        [circleId]
      );
      return rows;
    } catch (error) {
      logger.error('Failed to get circle invitations:', error);
      throw error;
    }
  }

  /**
   * Update invitation status
   */
  async updateCircleInvitationStatus(invitationId: string, status: string): Promise<any> {
    try {
      const { rows } = await pool.query(
        'UPDATE circle_invitations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, invitationId]
      );

      logger.info('Invitation status updated successfully', { invitationId, status });
      return rows[0];
    } catch (error) {
      logger.error('Failed to update invitation status:', error);
      throw error;
    }
  }

  /**
   * Get circle statistics
   */
  async getCircleStats(circleId: string): Promise<any> {
    try {
      const stats: any = {};

      const memberResult = await pool.query('SELECT COUNT(*) FROM circle_members WHERE circle_id = $1', [circleId]);
      stats.memberCount = parseInt(memberResult.rows[0].count);

      // Message count across all rooms in this circle
      const messageResult = await pool.query(
        `SELECT COUNT(*) FROM chat_messages m
         JOIN chat_rooms r ON m.room_id = r.id
         WHERE r.circle_id = $1`,
        [circleId]
      );
      stats.messageCount = parseInt(messageResult.rows[0].count);

      // Note: events table might need checking, but keeping original logic
      try {
        const eventResult = await pool.query('SELECT COUNT(*) FROM events WHERE circle_id = $1', [circleId]);
        stats.eventCount = parseInt(eventResult.rows[0].count);
      } catch (e) {
        stats.eventCount = 0;
      }

      return stats;
    } catch (error) {
      logger.error('Failed to get circle stats:', error);
      throw error;
    }
  }
}

export const circleService = new CircleService();
export default circleService;
