-- Migration: 027_add_gallery_tables.sql
-- Description: Add gallery_albums table and update files table for gallery support

-- Create gallery_albums table
CREATE TABLE IF NOT EXISTS gallery_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_photo_url TEXT,
    is_shared BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add gallery-specific columns to files table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='files' AND COLUMN_NAME='album_id') THEN
        ALTER TABLE files ADD COLUMN album_id UUID REFERENCES gallery_albums(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='files' AND COLUMN_NAME='is_favorite') THEN
        ALTER TABLE files ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='files' AND COLUMN_NAME='title') THEN
        ALTER TABLE files ADD COLUMN title VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='files' AND COLUMN_NAME='width') THEN
        ALTER TABLE files ADD COLUMN width INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='files' AND COLUMN_NAME='height') THEN
        ALTER TABLE files ADD COLUMN height INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='files' AND COLUMN_NAME='location') THEN
        ALTER TABLE files ADD COLUMN location JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='files' AND COLUMN_NAME='metadata') THEN
        ALTER TABLE files ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_album_id ON files(album_id);
CREATE INDEX IF NOT EXISTS idx_files_is_favorite ON files(is_favorite);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_circle_id ON gallery_albums(circle_id);
