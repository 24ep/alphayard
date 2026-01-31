-- Migration: 031_upgrade_saved_locations_postgis.sql
-- Description: Upgrade user_saved_locations to use PostGIS Geography type

-- 1. Add location column
ALTER TABLE user_saved_locations ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- 2. Migrate existing data
UPDATE user_saved_locations 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 3. Create spatial index
CREATE INDEX IF NOT EXISTS idx_user_saved_locations_location ON user_saved_locations USING GIST (location);
