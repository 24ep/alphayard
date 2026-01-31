
import { pool } from '../config/database';

async function verifyColumns() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    const columns = res.rows.map(r => r.column_name);
    console.log('Columns:', columns.join(', '));
    
    const check = ['user_type', 'subscription_tier', 'circle_ids'];
    check.forEach(c => {
        console.log(`${c}: ${columns.includes(c) ? 'EXISTS' : 'MISSING'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

verifyColumns();

