const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const client = new Client({
  host: process.env.DB_HOST || 'localhost', // Default to localhost for running from host machine
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// Mobile application tables SQL - Derived from scripts/create-mobile-tables.js
// We also need to add the auth.users table since we are removing Supabase Auth
const createSchemaSQL = `
-- Create auth schema if it doesn't exist (mimicking Supabase)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users table (Simplified version of Supabase auth.users)
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  encrypted_password VARCHAR(255),
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  invited_at TIMESTAMP WITH TIME ZONE,
  confirmation_token VARCHAR(255),
  recovery_token VARCHAR(255),
  email_change_token_new VARCHAR(255),
  email_change VARCHAR(255),
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  is_super_admin BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  phone VARCHAR(15),
  phone_confirmed_at TIMESTAMP WITH TIME ZONE,
  phone_change VARCHAR(15),
  phone_change_token VARCHAR(255),
  email_change_token_current VARCHAR(255),
  email_change_confirm_status SMALLINT,
  banned_until TIMESTAMP WITH TIME ZONE,
  reauthentication_token VARCHAR(255),
  reauthentication_sent_at TIMESTAMP WITH TIME ZONE,
  is_sso_user BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Families table
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family members table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- admin, member, child
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  name VARCHAR(255),
  type VARCHAR(50) DEFAULT 'group', -- group, private
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- text, image, video, file
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location tracking table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  accuracy NUMERIC(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  period VARCHAR(50) DEFAULT 'monthly', -- daily, weekly, monthly, yearly
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES public.budgets(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  category VARCHAR(100),
  paid_by UUID REFERENCES auth.users(id),
  expense_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage/Files table
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  file_url TEXT NOT NULL,
  folder VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_family_id ON public.tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_calendar_events_family_id ON public.calendar_events(family_id);
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON public.locations(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_timestamp ON public.locations(timestamp);
CREATE INDEX IF NOT EXISTS idx_expenses_family_id ON public.expenses(family_id);
CREATE INDEX IF NOT EXISTS idx_files_family_id ON public.files(family_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Note: Policies need to be adjusted for PostgREST
-- PostgREST accesses as the 'postgres' role initially or switches to a claim-based role.
-- For simplicity in this migration, we will create permissive policies for authenticated users
-- or rely on the application logic if RLS is too complex to port 1:1 immediately.

-- Simplified Policy: Authenticated users can do anything (REFINE THIS FOR PRODUCTION)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.profiles;
CREATE POLICY "Allow all for authenticated" ON public.profiles FOR ALL USING (true); -- Insecure, placeholder


-- System Configurations table
CREATE TABLE IF NOT EXISTS public.system_configs (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

-- Countries table for Phone Auth
CREATE TABLE IF NOT EXISTS public.countries (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  dial_code VARCHAR(10) NOT NULL,
  flag VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Countries (Upsert style)
INSERT INTO public.countries (code, name, dial_code, flag) VALUES
('US', 'United States', '+1', '🇺🇸'),
('GB', 'United Kingdom', '+44', '🇬🇧'),
('CA', 'Canada', '+1', '🇨🇦'),
('AU', 'Australia', '+61', '🇦🇺'),
('DE', 'Germany', '+49', '🇩🇪'),
('FR', 'France', '+33', '🇫🇷'),
('JP', 'Japan', '+81', '🇯🇵'),
('CN', 'China', '+86', '🇨🇳'),
('IN', 'India', '+91', '🇮🇳'),
('TH', 'Thailand', '+66', '🇹🇭'),
('SG', 'Singapore', '+65', '🇸🇬'),
('MY', 'Malaysia', '+60', '🇲🇾'),
('ID', 'Indonesia', '+62', '🇮🇩'),
('VN', 'Vietnam', '+84', '🇻🇳'),
('PH', 'Philippines', '+63', '🇵🇭')
ON CONFLICT (code) DO UPDATE SET
name = EXCLUDED.name,
dial_code = EXCLUDED.dial_code,
flag = EXCLUDED.flag;
`;

async function migrateSchema() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('\\nMigrating schema...');
    await client.query(createSchemaSQL);
    console.log('✅ Schema migration complete!');

  } catch (error) {
    console.error('❌ Error migrating schema:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\\nDatabase connection closed.');
  }
}

migrateSchema();
