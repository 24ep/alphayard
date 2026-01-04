
import { query } from '../src/config/database';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function fixCommentTrigger() {
    try {
        console.log('🔗 Connecting to database...');

        // 1. Drop existing trigger and function
        console.log('🗑️ Dropping existing trigger and function...');
        await query(`DROP TRIGGER IF EXISTS update_social_comment_counters_trigger ON social_comments;`);
        await query(`DROP FUNCTION IF EXISTS update_social_comment_counters() CASCADE;`);

        // 2. Recreate function with correct logic
        console.log('🛠️ Recreating function update_social_comment_counters...');
        await query(`
      CREATE OR REPLACE FUNCTION update_social_comment_counters()
      RETURNS TRIGGER AS $$
      BEGIN
          IF (TG_OP = 'INSERT') THEN
              UPDATE social_posts
              SET comments_count = COALESCE(comments_count, 0) + 1,
                  updated_at = NOW()
              WHERE id = NEW.post_id;
              RETURN NEW;
          ELSIF (TG_OP = 'DELETE') THEN
              UPDATE social_posts
              SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0),
                  updated_at = NOW()
              WHERE id = OLD.post_id;
              RETURN OLD;
          END IF;
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

        // 3. Recreate trigger
        console.log('🔫 Recreating trigger on social_comments...');
        await query(`
      CREATE TRIGGER update_social_comment_counters_trigger
      AFTER INSERT OR DELETE ON social_comments
      FOR EACH ROW
      EXECUTE FUNCTION update_social_comment_counters();
    `);

        console.log('✅ Fix applied successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing trigger:', error);
        process.exit(1);
    }
}

fixCommentTrigger();
