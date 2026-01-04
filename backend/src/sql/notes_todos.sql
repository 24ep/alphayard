-- Notes table
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  user_id uuid not null,
  title text,
  content text not null default '',
  category text not null default 'personal',
  is_pinned boolean not null default false,
  color text not null default '#FFB6C1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notes_family on public.notes(family_id);

-- Todos table
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  user_id uuid not null,
  title text not null,
  description text,
  is_completed boolean not null default false,
  position integer not null default 0,
  category text not null default 'work',
  priority text not null default 'medium',
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_todos_family on public.todos(family_id);

-- Migration for existing tables (add columns if they don't exist)
-- Run these if tables already exist:
-- ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'personal';
-- ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;
-- ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT '#FFB6C1';
-- ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'work';
-- ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium';
-- ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS due_date timestamptz;
