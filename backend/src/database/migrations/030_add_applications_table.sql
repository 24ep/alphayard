-- Migration: 030_add_applications_table.sql
-- Description: Create applications table for multi-tenant/superapp support
-- Required for Admin Console and EAV system

-- Ensure trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    branding JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_slug ON applications(slug);
CREATE INDEX IF NOT EXISTS idx_applications_active ON applications(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default application (Admin Console, Mobile App)
INSERT INTO applications (name, slug, description, settings, is_active)
VALUES 
    ('Admin Console', 'admin-console', 'Main administration interface', '{"theme": "default"}', true),
    ('Mobile App', 'mobile-app', 'Consumer mobile application', '{"theme": "default"}', true)
ON CONFLICT (slug) DO NOTHING;
