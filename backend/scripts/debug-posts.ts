
import { pool } from '../src/config/database';

async function listPosts() {
    try {
        const res = await pool.query(`
      SELECT id, content, family_id, author_id, created_at, is_deleted, status
      FROM social_posts 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
        console.log('Social posts:');
        console.log(JSON.stringify(res.rows, null, 2));

        const joinTest = await pool.query(`
      SELECT sp.id, sp.content, sp.family_id, sp.author_id,
             f.id as family_match,
             u.id as user_match
      FROM social_posts sp
      LEFT JOIN families f ON sp.family_id = f.id
      LEFT JOIN public.users u ON sp.author_id = u.id
    `);
        console.log('Join Test Results:');
        joinTest.rows.forEach(row => {
            console.log(`Post ${row.id}: FamilyMatch=${!!row.family_match}, UserMatch=${!!row.user_match}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listPosts();
