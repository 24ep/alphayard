-- Circle hierarchy + ownership + billing assignment (AppKit-only)

ALTER TABLE circles
  ADD COLUMN IF NOT EXISTS circle_type VARCHAR(50) NOT NULL DEFAULT 'team',
  ADD COLUMN IF NOT EXISTS parent_id UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'circles_parent_id_fkey'
  ) THEN
    ALTER TABLE circles
      ADD CONSTRAINT circles_parent_id_fkey
      FOREIGN KEY (parent_id) REFERENCES circles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_circles_application_id ON circles(application_id);
CREATE INDEX IF NOT EXISTS idx_circles_parent_id ON circles(parent_id);

ALTER TABLE circle_members
  ADD COLUMN IF NOT EXISTS is_inherited BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS source_circle_id UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'circle_members_source_circle_id_fkey'
  ) THEN
    ALTER TABLE circle_members
      ADD CONSTRAINT circle_members_source_circle_id_fkey
      FOREIGN KEY (source_circle_id) REFERENCES circles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_source_circle_id ON circle_members(source_circle_id);

CREATE TABLE IF NOT EXISTS circle_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT circle_owners_circle_id_user_id_key UNIQUE (circle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_circle_owners_user_id ON circle_owners(user_id);

CREATE TABLE IF NOT EXISTS circle_billing_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT circle_billing_assignments_circle_id_user_id_key UNIQUE (circle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_circle_billing_assignments_user_id ON circle_billing_assignments(user_id);

CREATE TABLE IF NOT EXISTS user_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_admin_id UUID NULL REFERENCES admin_users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  remind_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_comments_app_user ON user_comments(application_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_comments_created_at ON user_comments(created_at);

CREATE TABLE IF NOT EXISTS user_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_admin_id UUID NULL REFERENCES admin_users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  note TEXT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_reminders_app_user ON user_reminders(application_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_remind_at ON user_reminders(remind_at);
