-- Consolidate User Management Migration
-- This script moves data from redundant user-related tables into the primary users table metadata

-- 1. Ensure raw_user_meta_data column exists (it should, but just in case)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='raw_user_meta_data') THEN
        ALTER TABLE users ADD COLUMN raw_user_meta_data JSONB DEFAULT '{}';
    END IF;
END $$;

-- 2. Move data from user_preferences into users.raw_user_meta_data
UPDATE users u
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'preferences', (
        SELECT jsonb_build_object(
            'interests', up.interests,
            'personality_traits', up.personality_traits,
            'expectations', up.expectations,
            'how_did_you_hear', up.how_did_you_hear,
            'notification_settings', up.notification_settings,
            'privacy_settings', up.privacy_settings
        )
        FROM user_preferences up
        WHERE up.user_id = u.id
    )
)
WHERE EXISTS (SELECT 1 FROM user_preferences up WHERE up.user_id = u.id);

-- 3. Rename house_management to circle_profile (more consistent with Circles)
-- Or move its data to circles table if preferred. Let's rename for now to avoid data loss.
ALTER TABLE IF EXISTS house_management RENAME TO circle_profiles;
ALTER TABLE circle_profiles RENAME COLUMN house_name TO display_name;
ALTER TABLE circle_profiles RENAME COLUMN house_type TO profile_type;
ALTER TABLE circle_profiles RENAME COLUMN house_status TO status;
ALTER TABLE circle_profiles RENAME COLUMN house_features TO features;
ALTER TABLE circle_profiles RENAME COLUMN house_size_sqft TO size_sqft;

-- 4. Mark user_preferences as redundant (we can drop it if the user is sure, but let's just leave it for now or move to a backup schema)
-- COMMENT ON TABLE user_preferences IS 'DEPRECATED: Data moved to users.raw_user_meta_data';

-- 5. Consolidate emergency_contacts into user metadata if they are personal contacts
-- Note: if emergency_contacts is linked to circles, keep it. If linked to users, move it.
-- Based on the name it seems linked to users or circles. Let's check schema.
-- (Assumed based on previous list-tables output)

-- 6. Final cleanup of house vs circle in existing tables
UPDATE circles SET type = 'circle' WHERE type = 'hourse';
ALTER TABLE circles DROP CONSTRAINT IF EXISTS circles_type_check;
ALTER TABLE circles ADD CONSTRAINT circles_type_check CHECK (type IN ('circle', 'friends', 'sharehouse'));
