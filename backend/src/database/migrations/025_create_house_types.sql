-- Create house_types table
CREATE TABLE IF NOT EXISTS house_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100), -- Material Community Icon name
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial data
INSERT INTO house_types (name, code, description, icon, sort_order)
VALUES 
  ('Hourse', 'hourse', 'Your main family home', 'home-heart', 1),
  ('Workplace', 'workplace', 'Your professional workplace', 'briefcase-outline', 2),
  ('Friend', 'friend', 'Close friends and social circles', 'account-multiple-outline', 3)
ON CONFLICT (code) DO NOTHING;

-- Add house_type_id to circles table if it doesn't exist
-- We use a DO block to check column existence safely in Postgres
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'circles' AND column_name = 'house_type_id') THEN
        ALTER TABLE circles ADD COLUMN house_type_id UUID REFERENCES house_types(id);
        
        -- Try to backfill based on some logic if possible, or set default to 'hourse'
        -- For now, we'll leave it nullable or set a default if sure
        -- UPDATE circles SET house_type_id = (SELECT id FROM house_types WHERE code = 'hourse');
    END IF;
END $$;
