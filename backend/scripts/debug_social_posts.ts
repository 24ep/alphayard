
import { pool } from '../src/config/database';

async function debugSocialPosts() {
  try {

    const fs = require('fs');
    const path = require('path');
    const logFile = path.resolve(__dirname, '../debug_output.txt');
    const log = (msg: string) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    // Clear file
    fs.writeFileSync(logFile, '');

    log('--- DEBUG SOCIAL POSTS ---');

    log('1. Checking Total Posts Count...');
    const countRes = await pool.query('SELECT COUNT(*) FROM social_posts');
    log(`Total Posts: ${countRes.rows[0].count}`);

    log('\n2. Fetching Top 5 Posts (Raw)...');
    // Removed specific fields to just select * or similar
    const rawPosts = await pool.query('SELECT * FROM social_posts LIMIT 5');
    log('Raw Posts Count: ' + rawPosts.rows.length);


    log('\n3. Checking Families Existence...');
    const fRes = await pool.query('SELECT id, name FROM families LIMIT 1');
    let familyId = null;
    if (fRes.rows.length > 0) {
        familyId = fRes.rows[0].id;
        log(`Found Family: ${fRes.rows[0].name} (${familyId})`);
    } else {
        log('NO FAMILIES FOUND. Cannot create post.');
    }

    log('\n4. Checking Authors Existence...');
    const uRes = await pool.query('SELECT id, email FROM users LIMIT 1');
    let authorId = null;
    if (uRes.rows.length > 0) {
        authorId = uRes.rows[0].id;
        log(`Found User: ${uRes.rows[0].email} (${authorId})`);
    } else {
        log('NO USERS FOUND. Cannot create post.');
    }

    if (familyId && authorId) {
        log('\n5. Attempting to CREATE a test post...');
        try {
            const insertSql = `
                INSERT INTO social_posts (
                    family_id, author_id, content, type, visibility, status
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `;
            const insertRes = await pool.query(insertSql, [
                familyId, authorId, 'Test Post from Debug Script', 'text', 'family', 'active'
            ]);
            log(`Successfully created post! ID: ${insertRes.rows[0].id}`);
        } catch (e) {
            log('FAILED to create post: ' + e);
        }
    }


  } catch (err) {
    console.error('Error:', err);
    // Try to log error to file too
    try {
        require('fs').appendFileSync(require('path').resolve(__dirname, '../debug_output.txt'), 'Error: ' + err);
    } catch (e) {}

  } finally {
    await pool.end();
  }
}

debugSocialPosts();
