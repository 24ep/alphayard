
import { PrismaClient } from '../../prisma/generated/prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function checkTable() {
  try {
    console.log('Connected to DB');

    // Check table existence
    const res = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'circle_invitations'
    `) as Array<{ table_name: string }>;

    if (res.length === 0) {
      console.error('ERROR: Table circle_invitations DOES NOT EXIST');
      return;
    }
    console.log('Table circle_invitations exists.');

    // Check columns
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'circle_invitations'
    `) as Array<{ column_name: string; data_type: string }>;
    
    console.log('Columns:', cols.map(r => `${r.column_name} (${r.data_type})`).join(', '));

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
    await prisma.$queryRawUnsafe(testQuery);
    console.log('Query executed successfully (no syntax error).');

  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkTable();
