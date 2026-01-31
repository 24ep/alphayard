-- Migration: 029_enable_postgis.sql
-- Description: Enable PostGIS extension and upgrade location columns to Geography type
-- Note: Requires Docker image update to postgis/postgis

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==========================================
-- 1. Upgrade location_history
-- ==========================================
ALTER TABLE location_history ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- Migrate existing data
-- Note: ST_MakePoint takes (longitude, latitude) order
UPDATE location_history 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_location_history_location ON location_history USING GIST (location);

-- ==========================================
-- 2. Upgrade user_locations (Current Location)
-- ==========================================
ALTER TABLE user_locations ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

UPDATE user_locations 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_locations_location ON user_locations USING GIST (location);

-- ==========================================
-- 3. Upgrade geofences
-- ==========================================
-- We store the center point as a geography for efficient distance calculations (ST_DWithin)
ALTER TABLE geofences ADD COLUMN IF NOT EXISTS center_location GEOGRAPHY(POINT, 4326);

UPDATE geofences 
SET center_location = ST_SetSRID(ST_MakePoint(center_longitude, center_latitude), 4326)
WHERE center_latitude IS NOT NULL AND center_longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_geofences_center ON geofences USING GIST (center_location);
