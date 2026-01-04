
import { pool } from '../src/config/database';

async function checkDb() {
    let client;
    try {
        console.log('Checking database connection...');
        client = await pool.connect();
        console.log('Connected to database.');

        const userId = 'f739edde-45f8-4aa9-82c8-c1876f434683';

        // 1. Check auth.users
        const authUserRes = await client.query('SELECT * FROM auth.users WHERE id = $1', [userId]);
        if (authUserRes.rowCount === 0) {
            console.error('User not found in auth.users!');
            return;
        }
        console.log('User found in auth.users.');

        // 2. Check public.users (Sync if missing)
        const publicUserRes = await client.query('SELECT 1 FROM public.users WHERE id = $1', [userId]);
        if (publicUserRes.rowCount === 0) {
            console.log(`User ${userId} missing in public.users. Inserting...`);
            const authUser = authUserRes.rows[0];
            const meta = authUser.raw_user_meta_data || {};

            // Remove potentially conflicting user
            await client.query('DELETE FROM public.users WHERE email = $1 AND id != $2', [authUser.email, userId]);

            await client.query(`
            INSERT INTO public.users (
                id, email, password_hash, first_name, last_name, avatar_url, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
        `, [
                authUser.id,
                authUser.email,
                authUser.encrypted_password || 'placeholder',
                meta.firstName || 'Test',
                meta.lastName || 'User',
                null
            ]);
            console.log('Inserted/Updated public.users.');
        } else {
            console.log('User present in public.users.');
        }

        // 3. Check family membership
        const memberRes = await client.query('SELECT * FROM family_members WHERE user_id = $1', [userId]);
        if (memberRes.rowCount === 0) {
            console.log('User has no family membership. Assigning to a family...');
            const familyRes = await client.query('SELECT id FROM families LIMIT 1');

            if (familyRes.rowCount > 0) {
                const familyId = familyRes.rows[0].id;
                await client.query(`
                INSERT INTO family_members (family_id, user_id, role, joined_at)
                VALUES ($1, $2, 'owner', NOW())
            `, [familyId, userId]);
                console.log(`User assigned to family ${familyId} as owner.`);
            } else {
                console.warn('No families found to assign user to!');
                // Optional: Create a family if none exist
            }
        } else {
            console.log(`User is a member of family ${memberRes.rows[0].family_id} with role ${memberRes.rows[0].role}.`);
        }

        // 4. Verify Post Creation Logic
        const familyId = memberRes.rows.length > 0 ? memberRes.rows[0].family_id : (await client.query('SELECT id FROM families LIMIT 1')).rows[0]?.id;

        if (familyId) {
            console.log('Testing post creation...');
            const insertRes = await client.query(`
                INSERT INTO social_posts (family_id, author_id, content, type, visibility, created_at, updated_at)
                VALUES ($1, $2, 'Test Post', 'text', 'family', NOW(), NOW())
                RETURNING id
            `, [familyId, userId]);

            const postId = insertRes.rows[0].id;
            console.log(`Created test post ${postId}. Verifying retrieval...`);

            const fetchRes = await client.query(`
                SELECT sp.id, u.first_name, f.name
                FROM social_posts sp
                JOIN public.users u ON sp.author_id = u.id
                JOIN families f ON sp.family_id = f.id
                WHERE sp.id = $1
            `, [postId]);

            if (fetchRes.rowCount > 0) {
                console.log('Successfully retrieved post with joins!');
                await client.query('DELETE FROM social_posts WHERE id = $1', [postId]);
                console.log('Cleaned up test post.');
            } else {
                console.error('FAILED to retrieve post with joins.');
            }
        }


    } catch (err: any) {
        console.error('Database error:', err.message);
    } finally {
        if (client) client.release();
        pool.end();
    }
}

checkDb();
