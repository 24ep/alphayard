-- Create files table to store metadata for MinIO uploads
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size BIGINT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  circle_id UUID REFERENCES circles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_circle_id ON files(circle_id);

-- Expose to PostgREST (grant permissions)
GRANT ALL ON files TO postgres;
GRANT ALL ON files TO service_role;
GRANT SELECT ON files TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON files TO authenticated;
