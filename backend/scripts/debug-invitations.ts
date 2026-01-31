
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkTable() {
  try {
    await client.connect();
    console.log('Connected to DB');

    // Check table existence
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'circle_invitations'
    `);

    if (res.rows.length === 0) {
      console.error('ERROR: Table circle_invitations DOES NOT EXIST');
      return;
    }
    console.log('Table circle_invitations exists.');

    // Check columns
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'circle_invitations'
    `);
    
    console.log('Columns:', cols.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));

    // Try the problematic select query with a dummy email
    const testQuery = `
      SELECT 
        fi.id, fi.circle_id, fi.email, fi.message, fi.status, fi.created_at, fi.expires_at,
        f.id as circle_id, f.name as circle_name, f.description as circle_desc,
        u.first_name, u.last_name
      FROM circle_invitations fi
      JOIN circles f ON fi.circle_id = f.id
      LEFT JOIN public.users u ON fi.invited_by = u.id
      WHERE fi.email = 'test@example.com' AND fi.status = 'pending'
    `;
    
    console.log('Testing query...');
    await client.query(testQuery);
    console.log('Query executed successfully (no syntax error).');

  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await client.end();
  }
}

checkTable();
