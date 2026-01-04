-- Migration: Create notes/todos tables and add extended fields
-- This migration handles both new installations (creates tables) and existing ones (adds columns)

-- Create notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text,
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'personal',
  is_pinned boolean NOT NULL DEFAULT false,
  color text NOT NULL DEFAULT '#FFB6C1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_family ON public.notes(family_id);

-- Create todos table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  is_completed boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'work',
  priority text NOT NULL DEFAULT 'medium',
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_todos_family ON public.todos(family_id);

-- For existing tables, add columns if they don't exist
DO $$
BEGIN
  -- Notes columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'category') THEN
    ALTER TABLE public.notes ADD COLUMN category text NOT NULL DEFAULT 'personal';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'is_pinned') THEN
    ALTER TABLE public.notes ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'color') THEN
    ALTER TABLE public.notes ADD COLUMN color text NOT NULL DEFAULT '#FFB6C1';
  END IF;
  
  -- Todos columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'category') THEN
    ALTER TABLE public.todos ADD COLUMN category text NOT NULL DEFAULT 'work';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'priority') THEN
    ALTER TABLE public.todos ADD COLUMN priority text NOT NULL DEFAULT 'medium';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'due_date') THEN
    ALTER TABLE public.todos ADD COLUMN due_date timestamptz;
  END IF;
END $$;

SELECT 'Migration completed: notes/todos tables created with extended fields' as status;
