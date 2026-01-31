
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function createTable() {
  try {
    await client.connect();
    console.log('Connected to DB');

    await client.query(`
      CREATE TABLE IF NOT EXISTS circle_invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        token VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE
      );
    `);
    
    // Add indexes for performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_invitations_email ON circle_invitations(email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_invitations_circle ON circle_invitations(circle_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_invitations_token ON circle_invitations(token);`);

    console.log('Table circle_invitations created successfully.');

  } catch (err) {
    console.error('Migration Error:', err);
  } finally {
    await client.end();
  }
}

createTable();
