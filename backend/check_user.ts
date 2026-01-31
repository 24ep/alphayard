
import { query } from './src/config/database'; // Adjust import based on file location

async function main() {
  try {
    const res = await query(`SELECT id, email, raw_user_meta_data FROM users WHERE id = '95937de0-404d-41a2-ad76-8de35d1f048e'`);
    if (res.rows.length === 0) {
      console.log('User not found');
    } else {
      console.log('User found:', JSON.stringify(res.rows[0], null, 2));
    }
  } catch (err) {
    console.error('Error querying DB:', err);
  }
  process.exit();
}

main();
