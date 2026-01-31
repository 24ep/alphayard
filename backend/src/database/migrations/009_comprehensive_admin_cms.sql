-- Comprehensive Admin CMS Migration
-- This migration creates tables for comprehensive admin management

-- Admin Roles Table
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users Table (extends users table)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    admin_role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
    permissions JSONB DEFAULT '{}',
    is_super_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- House Management Table
CREATE TABLE IF NOT EXISTS house_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
    house_name VARCHAR(255) NOT NULL,
    house_type VARCHAR(50) NOT NULL CHECK (house_type IN ('single_family', 'apartment', 'condo', 'townhouse', 'other')),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    coordinates POINT, -- PostGIS point for location
    house_size_sqft INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    year_built INTEGER,
    house_status VARCHAR(50) DEFAULT 'active' CHECK (house_status IN ('active', 'inactive', 'maintenance', 'vacant')),
    management_notes TEXT,
    emergency_contacts JSONB DEFAULT '[]',
    house_features JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Accounts Table
CREATE TABLE IF NOT EXISTS social_media_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'snapchat', 'other')),
    account_handle VARCHAR(255) NOT NULL,
    account_url TEXT,
    account_type VARCHAR(50) DEFAULT 'personal' CHECK (account_type IN ('personal', 'business', 'family', 'organization')),
    is_verified BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    privacy_settings JSONB DEFAULT '{}',
    connection_status VARCHAR(50) DEFAULT 'connected' CHECK (connection_status IN ('connected', 'disconnected', 'pending', 'error')),
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_frequency VARCHAR(50) DEFAULT 'daily' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
    access_token TEXT, -- encrypted
    refresh_token TEXT, -- encrypted
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Posts Table
CREATE TABLE IF NOT EXISTS social_media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_account_id UUID REFERENCES social_media_accounts(id) ON DELETE CASCADE,
    circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    post_id VARCHAR(255) NOT NULL, -- platform-specific post ID
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    post_type VARCHAR(50) DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'link', 'poll', 'story')),
    visibility VARCHAR(50) DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'family', 'private')),
    engagement_metrics JSONB DEFAULT '{}', -- likes, shares, comments, etc.
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_scheduled BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(social_account_id, post_id)
);

-- Application Settings Table
CREATE TABLE IF NOT EXISTS application_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array')),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    is_editable BOOLEAN DEFAULT true,
    validation_rules JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Activity Log Table
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Notifications Table
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'error', 'success', 'maintenance')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    target_audience JSONB DEFAULT '{}', -- who should see this notification
    is_active BOOLEAN DEFAULT true,
    is_global BOOLEAN DEFAULT false,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin roles
INSERT INTO admin_roles (name, description, permissions, is_system_role) VALUES
('Super Admin', 'Full system access', '{"all": true}', true),
('Admin', 'Administrative access', '{"users": true, "circles": true, "content": true, "analytics": true}', false),
('Moderator', 'Content moderation access', '{"content": true, "users": {"view": true, "edit": false}}', false),
('Support', 'Customer support access', '{"users": {"view": true}, "circles": {"view": true}}', false),
('Analyst', 'Analytics and reporting access', '{"analytics": true, "reports": true}', false)
ON CONFLICT (name) DO NOTHING;

-- Insert default application settings
INSERT INTO application_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('app.name', '"Bondarys"', 'string', 'general', 'Application name', true),
('app.version', '"1.0.0"', 'string', 'general', 'Application version', true),
('app.description', '"Family Safety Network"', 'string', 'general', 'Application description', true),
('app.maintenance_mode', 'false', 'boolean', 'system', 'Maintenance mode status', false),
('app.registration_enabled', 'true', 'boolean', 'auth', 'User registration enabled', false),
('app.max_circle_members', '20', 'number', 'circles', 'Maximum family members per family', false),
('app.location_tracking_enabled', 'true', 'boolean', 'features', 'Location tracking feature enabled', false),
('app.social_features_enabled', 'true', 'boolean', 'features', 'Social media features enabled', false),
('app.notification_settings', '{"email": true, "push": true, "sms": false}', 'json', 'notifications', 'Default notification settings', false),
('app.privacy_settings', '{"data_retention_days": 365, "anonymize_after": 90}', 'json', 'privacy', 'Privacy and data retention settings', false),
('app.analytics_enabled', 'true', 'boolean', 'analytics', 'Analytics tracking enabled', false),
('app.backup_frequency', '"daily"', 'string', 'system', 'Database backup frequency', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(admin_role_id);
CREATE INDEX IF NOT EXISTS idx_house_management_family ON house_management(circle_id);
CREATE INDEX IF NOT EXISTS idx_house_management_status ON house_management(house_status);
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_family ON social_media_accounts(circle_id);
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_platform ON social_media_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_family ON social_media_posts(circle_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_posted_at ON social_media_posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_application_settings_category ON application_settings(category);
CREATE INDEX IF NOT EXISTS idx_application_settings_public ON application_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_resource ON admin_activity_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created ON admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_system_notifications_active ON system_notifications(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_system_notifications_global ON system_notifications(is_global);

-- Create function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
    p_admin_user_id UUID,
    p_action VARCHAR,
    p_resource_type VARCHAR,
    p_resource_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_activity_log (
        admin_user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        p_admin_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_old_values,
        p_new_values,
        p_ip_address,
        p_user_agent
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE(
    total_users BIGINT,
    total_circles BIGINT,
    total_houses BIGINT,
    active_social_accounts BIGINT,
    total_posts BIGINT,
    system_notifications BIGINT,
    recent_activity BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*) FROM circles WHERE is_active = true) as total_circles,
        (SELECT COUNT(*) FROM house_management WHERE house_status = 'active') as total_houses,
        (SELECT COUNT(*) FROM social_media_accounts WHERE connection_status = 'connected') as active_social_accounts,
        (SELECT COUNT(*) FROM social_media_posts WHERE posted_at >= NOW() - INTERVAL '30 days') as total_posts,
        (SELECT COUNT(*) FROM system_notifications WHERE is_active = true) as system_notifications,
        (SELECT COUNT(*) FROM admin_activity_log WHERE created_at >= NOW() - INTERVAL '24 hours') as recent_activity;
END;
$$ LANGUAGE plpgsql;
