const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

const sql = `
-- Create emotion_type enum if not exists
DO $$ BEGIN
  CREATE TYPE emotion_type AS ENUM ('very_bad', 'bad', 'neutral', 'good', 'very_good');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create emotion_records table
CREATE TABLE IF NOT EXISTS emotion_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    emotion_type emotion_type NOT NULL DEFAULT 'neutral',
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_emotion_records_user_id ON emotion_records(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_records_recorded_at ON emotion_records(recorded_at);

-- Fix any inactive users (set is_active = true so sockets work)
UPDATE public.users SET is_active = true WHERE is_active = false OR is_active IS NULL;
`;

pool.query(sql)
  .then(() => {
    console.log('email_logs table created successfully');
    pool.end();
  })
  .catch(e => {
    console.error('Error:', e.message);
    pool.end();
  });
