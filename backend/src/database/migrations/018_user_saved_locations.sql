-- Migration: 018_user_saved_locations.sql
-- Description: Add user saved locations (hometown, workplace, school) and lat/lng to posts
-- Created: 2026-01-03

-- =============================================
-- USER SAVED LOCATIONS TABLE
-- =============================================

-- Table for storing user's saved locations (hometown, workplace, school, custom)
CREATE TABLE IF NOT EXISTS user_saved_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_type VARCHAR(50) NOT NULL CHECK (location_type IN ('hometown', 'workplace', 'school', 'custom')),
  name VARCHAR(255),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, location_type)
);

-- Index for faster user location lookups
CREATE INDEX IF NOT EXISTS idx_user_saved_locations_user_id ON user_saved_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_locations_type ON user_saved_locations(location_type);

-- =============================================
-- ADD LAT/LNG TO SOCIAL POSTS
-- =============================================

-- Add latitude and longitude columns to social_posts for geo-based filtering
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Index for spatial queries on posts
CREATE INDEX IF NOT EXISTS idx_social_posts_location ON social_posts(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- =============================================
-- RPC: Find nearby posts
-- =============================================

DROP FUNCTION IF EXISTS fn_social_nearby_posts(NUMERIC, NUMERIC, NUMERIC, INTEGER, UUID);
CREATE OR REPLACE FUNCTION fn_social_nearby_posts(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_m NUMERIC,
  p_limit INTEGER DEFAULT 50,
  p_circle_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  circle_id UUID,
  author_id UUID,
  content TEXT,
  type VARCHAR(20),
  media_urls JSONB,
  tags TEXT[],
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  visibility VARCHAR(20),
  status VARCHAR(20),
  likes_count INTEGER,
  shares_count INTEGER,
  comments_count INTEGER,
  views_count INTEGER,
  is_hidden BOOLEAN,
  is_deleted BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_m NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.circle_id,
    sp.author_id,
    sp.content,
    sp.type,
    sp.media_urls,
    sp.tags,
    sp.location,
    sp.latitude,
    sp.longitude,
    sp.visibility,
    sp.status,
    sp.likes_count,
    sp.shares_count,
    sp.comments_count,
    sp.views_count,
    sp.is_hidden,
    sp.is_deleted,
    sp.created_at,
    sp.updated_at,
    ST_DistanceSphere(ST_MakePoint(sp.longitude::numeric, sp.latitude::numeric), ST_MakePoint(p_lng, p_lat))::NUMERIC AS distance_m
  FROM social_posts sp
  WHERE sp.latitude IS NOT NULL 
    AND sp.longitude IS NOT NULL
    AND sp.is_deleted = FALSE
    AND sp.is_hidden = FALSE
    AND sp.status = 'active'
    AND ST_DistanceSphere(ST_MakePoint(sp.longitude::numeric, sp.latitude::numeric), ST_MakePoint(p_lng, p_lat)) <= p_radius_m
    AND (p_circle_id IS NULL OR sp.circle_id = p_circle_id)
  ORDER BY distance_m ASC
  LIMIT COALESCE(p_limit, 50);
END;
$$ LANGUAGE plpgsql STABLE;
