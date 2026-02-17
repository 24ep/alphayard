
import { prisma } from '../src/lib/prisma';
import { Prisma } from '../../prisma/generated/prisma/client';

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
    const countRes = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`SELECT COUNT(*) FROM social_posts`);
    log(`Total Posts: ${countRes[0].count}`);

    log('\n2. Fetching Top 5 Posts (Raw)...');
    // Removed specific fields to just select * or similar
    const rawPosts = await prisma.$queryRaw(Prisma.sql`SELECT * FROM social_posts LIMIT 5`);
    log('Raw Posts Count: ' + (rawPosts as any[]).length);


    log('\n3. Checking Families Existence...');
    const fRes = await prisma.$queryRaw<Array<{ id: string; name: string }>>(Prisma.sql`SELECT id, name FROM families LIMIT 1`);
    let familyId = null;
    if (fRes.length > 0) {
        familyId = fRes[0].id;
        log(`Found Family: ${fRes[0].name} (${familyId})`);
    } else {
        log('NO FAMILIES FOUND. Cannot create post.');
    }

    log('\n4. Checking Authors Existence...');
    const uRes = await prisma.$queryRaw<Array<{ id: string; email: string }>>(Prisma.sql`SELECT id, email FROM users LIMIT 1`);
    let authorId = null;
    if (uRes.length > 0) {
        authorId = uRes[0].id;
        log(`Found User: ${uRes[0].email} (${authorId})`);
    } else {
        log('NO USERS FOUND. Cannot create post.');
    }

    if (familyId && authorId) {
        log('\n5. Attempting to CREATE a test post...');
        try {
            const insertRes = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
                INSERT INTO social_posts (
                    family_id, author_id, content, type, visibility, status
                ) VALUES (${familyId}, ${authorId}, ${'Test Post from Debug Script'}, ${'text'}, ${'family'}, ${'active'})
                RETURNING id
            `);
            log(`Successfully created post! ID: ${insertRes[0].id}`);
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
    await prisma.$disconnect();
  }
}

debugSocialPosts();
