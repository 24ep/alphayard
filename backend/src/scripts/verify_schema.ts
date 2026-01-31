
import { pool } from '../config/database';

async function verifySchema() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    const columns = res.rows.map(r => r.column_name);
    console.log('Columns in users table:', columns.join(', '));
    
    const missing = ['date_of_birth', 'push_token', 'notification_settings', 'preferences', 'is_onboarding_complete'].filter(c => !columns.includes(c));
    
    if (missing.length === 0) {
      console.log('SUCCESS: All required columns are present.');
    } else {
      console.error('FAILURE: Missing columns:', missing.join(', '));
      process.exit(1);
    }

  } catch (error) {
    console.error('Error verifying schema:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

verifySchema();
