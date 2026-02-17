
import { prisma } from '../src/lib/prisma';
import { Prisma } from '../../prisma/generated/prisma/client';

async function listPosts() {
    try {
        const res = await prisma.$queryRaw(Prisma.sql`
            SELECT id, content, family_id, author_id, created_at, is_deleted, status
            FROM social_posts 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        console.log('Social posts:');
        console.log(JSON.stringify(res, null, 2));

        const joinTest = await prisma.$queryRaw(Prisma.sql`
            SELECT sp.id, sp.content, sp.family_id, sp.author_id,
                   f.id as family_match,
                   u.id as user_match
            FROM social_posts sp
            LEFT JOIN families f ON sp.family_id = f.id
            LEFT JOIN public.users u ON sp.author_id = u.id
        `);
        console.log('Join Test Results:');
        (joinTest as any[]).forEach((row: any) => {
            console.log(`Post ${row.id}: FamilyMatch=${!!row.family_match}, UserMatch=${!!row.user_match}`);
        });

        await prisma.$disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        await prisma.$disconnect();
        process.exit(1);
    }
}

listPosts();
