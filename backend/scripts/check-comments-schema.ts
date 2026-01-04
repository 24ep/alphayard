
import { query } from '../src/config/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkCommentsSchema() {
    try {
        console.log('🔗 Connecting to database...');

        const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'social_comments';
    `);

        console.log('📋 Columns in social_comments:');
        result.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type})`);
        });

        const hasMedia = result.rows.some(r => r.column_name === 'media' || r.column_name === 'media_url');
        const hasMediaType = result.rows.some(r => r.column_name === 'media_type');

        if (!hasMedia) {
            console.log('⚠️ Missing media columns. Configuring migration...');

            // Add media columns
            // Supporting multiple types: image, video, gif, sticker
            // Storing as JSONB might be flexible: { type: 'image', url: '...' }
            // Or separate columns: media_url, media_type

            await query(`
            ALTER TABLE social_comments
            ADD COLUMN IF NOT EXISTS media_url TEXT,
            ADD COLUMN IF NOT EXISTS media_type VARCHAR(20); -- image, video, gif, sticker
        `);
            console.log('✅ Added media_url and media_type columns.');
        } else {
            console.log('✅ Media columns exist.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking schema:', error);
        process.exit(1);
    }
}

checkCommentsSchema();
