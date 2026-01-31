import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

const log = (msg: string) => {
    console.log(msg);
    fs.appendFileSync('verify_output.txt', msg + '\n');
};

async function check() {
  try {
    log('Checking database...');
    
    // Check User by ID (Mock Token User ID)
    const userId = 'f739edde-45f8-4aa9-82c8-c1876f434683';
    const email = 'jaroonwitpool@gmail.com';
    
    let userRes = await pool.query("SELECT * FROM public.users WHERE id = $1", [userId]);
    log(`User (${userId}): ${userRes.rows.length ? 'Found' : 'Not Found'}`);
    
    if (userRes.rows.length === 0) {
        log('Creating test user...');
        try {
            await pool.query(`
                INSERT INTO public.users (id, email, password, password_hash, first_name, last_name, is_active, created_at, updated_at)
                VALUES ($1, $2, 'dummy_pass', 'dummy_hash', 'Test', 'User', true, NOW(), NOW())
            `, [userId, email]);
            log('Test user created.');
             userRes = await pool.query("SELECT * FROM public.users WHERE id = $1", [userId]);
        } catch (err: any) {
            log('Error creating user: ' + err.message);
            // If error is duplicate key, maybe email exists with diff ID?
             const emailCheck = await pool.query("SELECT * FROM public.users WHERE email = $1", [email]);
             if (emailCheck.rows.length > 0) {
                 log(`User with email ${email} already exists with ID: ${emailCheck.rows[0].id}. Updating our target ID usage if possible or alerting.`);
             }
            return;
        }
    }

    if (userRes.rows.length > 0) {
        // Ensure is_active
        if (!userRes.rows[0].is_active) {
            await pool.query("UPDATE public.users SET is_active = true WHERE id = $1", [userId]);
            log('Set is_active = true');
        }

        // Check Family Memberships
        const memberRes = await pool.query("SELECT * FROM family_members WHERE user_id = $1", [userId]);
        log('Family Memberships count: ' + memberRes.rows.length);
        
        if (memberRes.rows.length === 0) {
            log('User has NO family memberships. This explains the 403 Forbidden.');
            
            // Check if any families exist
            const famRes = await pool.query("SELECT * FROM families LIMIT 5");
            
            if (famRes.rows.length > 0) {
                // Auto-join first family
                const familyId = famRes.rows[0].id;
                log(`Auto-joining user to family ${familyId} (${famRes.rows[0].name})...`);
                try {
                     await pool.query("INSERT INTO family_members (family_id, user_id, role, joined_at) VALUES ($1, $2, 'admin', NOW())", [familyId, userId]);
                     log('User added to family successfully.');
                } catch (e: any) {
                    log('Error joining family: ' + e.message);
                }
            } else {
                log('No families exist. Creating default family...');
                try {
                     const newFam = await pool.query(`
                         INSERT INTO families (name, description, created_by, owner_id, invite_code, settings, house_type_id, type, created_at, updated_at)
                         VALUES ('Dev Family', 'Default Dev Family', $1, $1, 'DEV1234', '{}', NULL, 'house', NOW(), NOW())
                         RETURNING id
                     `, [userId]);
                     const newFamId = newFam.rows[0].id;
                     await pool.query("INSERT INTO family_members (family_id, user_id, role, joined_at) VALUES ($1, $2, 'owner', NOW())", [newFamId, userId]);
                     log('Default family created and user added as owner.');
                } catch (err: any) {
                    log('Error creating default family: ' + err.message);
                }
            }
        } else {
             log('User IS a member of a family. 403 must be caused by something else?');
        }
    }
    
  } catch (e: any) {
    log('Script Error: ' + e.message);
  } finally {
    await pool.end();
  }
}

check();
