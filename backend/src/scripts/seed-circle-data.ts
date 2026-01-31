
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function seedCircleData() {
  console.log('🌱 Seeding Circle Types and Jaroonwit Circle...');

  try {
    // 1. Seed Circle Types (renamed from House Types)
    
    // Migration: Ensure 'circle' and 'team' exist with correct codes
    await pool.query("UPDATE circle_types SET code = 'circle', name = 'Circle', description = 'Private circle' WHERE code = 'circle'");
    await pool.query("UPDATE circle_types SET code = 'team', name = 'Team', description = 'Work or project team' WHERE code = 'workplace'");

    const circleTypes = [
      { name: 'Home', code: 'home', sort_order: 1, icon: 'home-heart', description: 'Your main family or home circle' },
      { name: 'Sharehouse', code: 'sharehouse', sort_order: 2, icon: 'home-group', description: 'Shared living space' },
      { name: 'Team', code: 'team', sort_order: 3, icon: 'briefcase-outline', description: 'Work or project team' },
      { name: 'Friendship', code: 'friend', sort_order: 4, icon: 'account-multiple-outline', description: 'Friend group' },
      { name: 'Club', code: 'club', sort_order: 5, icon: 'cards-club', description: 'Interest group or club' },
      { name: 'Other', code: 'other', sort_order: 6, icon: 'dots-horizontal', description: 'Other circle type' }
    ];

    for (const type of circleTypes) {
      const res = await pool.query('SELECT * FROM circle_types WHERE code = $1', [type.code]);
      if (res.rows.length === 0) {
        console.log(`Creating circle type: ${type.name}`);
        await pool.query(
          `INSERT INTO circle_types (name, code, sort_order, icon, description) VALUES ($1, $2, $3, $4, $5)`,
          [type.name, type.code, type.sort_order, type.icon, type.description]
        );
      } else {
        console.log(`Circle type ${type.name} already exists. Updating...`);
        await pool.query(
          `UPDATE circle_types SET name = $1, sort_order = $2, icon = $3, description = $4 WHERE code = $5`,
          [type.name, type.sort_order, type.icon, type.description, type.code]
        );
      }
    }

    // 2. Ensure User Jaroonwit Exists
    const email = 'jaroonwit.pool@gmail.com';
    let userId;
    let userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userRes.rows.length === 0) {
      console.log('Creating user Jaroonwit...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      userRes = await pool.query(`
        INSERT INTO users (
            id, email, password_hash, first_name, last_name, 
            user_type, is_active, is_email_verified, is_onboarding_complete
        ) VALUES ($1, $2, $3, 'Jaroonwit', 'Pool', 'circle', true, true, true)
        RETURNING id
      `, [uuidv4(), email, hashedPassword]);
      userId = userRes.rows[0].id;
    } else {
      console.log('User Jaroonwit already exists.');
      userId = userRes.rows[0].id;
    }

    // 3. Create 'Jaroonwit Circle'
    const circleName = 'Jaroonwit Circle';
    let circleId;
    let circleRes = await pool.query('SELECT * FROM circles WHERE name = $1', [circleName]);

    if (circleRes.rows.length === 0) {
        console.log('Creating Jaroonwit Circle...');
        const inviteCode = Math.random().toString(36).substring(7).toUpperCase();
        
        try {
             const fId = uuidv4();
             await pool.query(
                `INSERT INTO circles (id, name, type, description, owner_id, invite_code) 
                 VALUES ($1, $2, $3, 'Circle for Jaroonwit', $4, $5)`,
                [fId, circleName, 'circle', userId, inviteCode]
             );
             circleId = fId;
        } catch (e: any) {
             console.log('Complex insert failed, trying simple insert...', e.message);
             const fId = uuidv4();
             await pool.query(
                `INSERT INTO circles (id, name, type) VALUES ($1, $2, $3)`,
                [fId, circleName, 'circle']
             );
             circleId = fId;
        }
    } else {
        console.log('Jaroonwit Circle already exists.');
        circleId = circleRes.rows[0].id;
    }

    // 4. Link User to circle
    await pool.query(
        `INSERT INTO circle_members (circle_id, user_id, role, joined_at) 
         VALUES ($1, $2, 'owner', NOW()) 
         ON CONFLICT DO NOTHING`,
        [circleId, userId]
    );
    console.log('Linked Jaroonwit to Circle.');

    console.log('✅ Seeding Complete.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedCircleData();
