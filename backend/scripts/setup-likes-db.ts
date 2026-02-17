
import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkLikesTable() {
    try {
        console.log('🔗 Connecting to database...');

        // Check if table exists
        const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'social_post_likes';
    `) as Array<{ table_name: string }>;

        if (tables.length === 0) {
            console.log('⚠️ social_post_likes table missing. Creating...');
            await prisma.$executeRawUnsafe(`
        CREATE TABLE social_post_likes (
            id SERIAL PRIMARY KEY,
            post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(post_id, user_id)
        );
      `);
            console.log('✅ social_post_likes table created.');
        } else {
            console.log('✅ social_post_likes table exists.');
        }

        // Check counters trigger
        // Need to ensure likes_count is updated on social_posts
        // I'll drop and recreate the trigger function for likes similar to comments
        console.log('🛠️ Configuring triggers for likes...');

        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS update_social_post_likes_trigger ON social_post_likes;`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS update_social_post_likes_counter() CASCADE;`);

        await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION update_social_post_likes_counter()
      RETURNS TRIGGER AS $$
      BEGIN
          IF (TG_OP = 'INSERT') THEN
              UPDATE social_posts
              SET likes_count = COALESCE(likes_count, 0) + 1,
                  updated_at = NOW()
              WHERE id = NEW.post_id;
              RETURN NEW;
          ELSIF (TG_OP = 'DELETE') THEN
              UPDATE social_posts
              SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0),
                  updated_at = NOW()
              WHERE id = OLD.post_id;
              RETURN OLD;
          END IF;
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER update_social_post_likes_trigger
      AFTER INSERT OR DELETE ON social_post_likes
      FOR EACH ROW
      EXECUTE FUNCTION update_social_post_likes_counter();
    `);

        console.log('✅ Likes trigger configured.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking likes table:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

checkLikesTable();
