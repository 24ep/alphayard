
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined in .env');
  process.exit(1);
}

const client = new Client({
  connectionString,
});

async function generateAvatars() {
  try {
    await client.connect();
    console.log('Connected to database to generate avatars...');

    // 1. Get all users with null avatar_url
    const res = await client.query(`
      SELECT id, first_name, last_name, avatar_url 
      FROM users 
      WHERE avatar_url IS NULL OR avatar_url = ''
    `);

    const usersWithoutAvatar = res.rows;
    console.log(`Found ${usersWithoutAvatar.length} users needing avatars.`);

    // 2. Update each user with a DiceBear URL
    let updatedCount = 0;
    for (const user of usersWithoutAvatar) {
      // Use user ID as seed to ensure stability (same user always gets same avatar)
      // We can also combine with name if preferred: \`\${user.first_name}-\${user.last_name}\`
      const seed = user.id; 
      const avatarUrl = `https://api.dicebear.com/9.x/avataaars/png?seed=${seed}`;

      await client.query(`
        UPDATE users 
        SET avatar_url = $1, updated_at = NOW() 
        WHERE id = $2
      `, [avatarUrl, user.id]);

      updatedCount++;
      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount} users...`);
      }
    }

    console.log(`Successfully generated avatars for ${updatedCount} users.`);

  } catch (err) {
    console.error('Error generating avatars:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

generateAvatars();
