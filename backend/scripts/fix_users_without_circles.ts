import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function fixUsersWithoutCircles() {
  console.log('Starting fix for users without circles...');

  try {
    // 1. Find users who are NOT in circle_members
    const { rows: users } = await pool.query(`
      SELECT u.id, u.email, u.first_name 
      FROM users u
      LEFT JOIN circle_members cm ON u.id = cm.user_id
      WHERE cm.circle_id IS NULL
    `);

    console.log(`Found ${users.length} users with no circle membership.`);

    for (const user of users) {
      console.log(`Fixing user: ${user.email} (${user.id})...`);

      try {
        await pool.query('BEGIN');

        // Create Default Circle
        const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const { rows: circles } = await pool.query(
          `INSERT INTO circles (name, description, created_by, owner_id, invite_code, type, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           RETURNING id`,
          ['My Circle', 'My personal circle', user.id, user.id, inviteCode, 'circle']
        );

        const circleId = circles[0].id;

        // Add user as owner
        await pool.query(
          `INSERT INTO circle_members (circle_id, user_id, role, joined_at)
           VALUES ($1, $2, $3, NOW())`,
          [circleId, user.id, 'owner']
        );

        await pool.query('COMMIT');
        console.log(`  -> Created "My Circle" for ${user.email}`);

      } catch (err) {
        await pool.query('ROLLBACK');
        console.error(`  -> Failed to fix user ${user.email}:`, err);
      }
    }

    console.log('Fix complete.');

  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await pool.end();
  }
}

fixUsersWithoutCircles();
