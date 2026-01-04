-- Migration: Create events table
-- This table supports standard calendar events with recurrence and reminders

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  created_by uuid NOT NULL,
  
  title text NOT NULL,
  description text,
  
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  is_all_day boolean NOT NULL DEFAULT false,
  
  event_type text NOT NULL DEFAULT 'general', -- 'hourse', 'personal', 'work', etc.
  location text,
  location_latitude float,
  location_longitude float,
  
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_rule text, -- RRULE string (e.g., "FREQ=WEEKLY;INTERVAL=1")
  
  reminder_minutes integer[], -- Array of minutes before event to remind (e.g., [15, 60])
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by family and date range
CREATE INDEX IF NOT EXISTS idx_events_family_date ON public.events(family_id, start_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

SELECT 'Migration completed: events table created' as status;
