-- ============================================================================
-- BOUNDARY DATABASE SCHEMA v2.0
-- Fresh start with simplified 3-schema structure
-- ============================================================================
-- 
-- SCHEMAS:
--   core     - Global data + common features (users, files, notifications)
--   admin    - Admin panel only (admin users, roles, permissions)
--   bondarys - Bondarys app specific (social, circles, chat, location)
--
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- STEP 1: CREATE SCHEMAS
-- ============================================================================

DROP SCHEMA IF EXISTS bondarys CASCADE;
DROP SCHEMA IF EXISTS admin CASCADE;
DROP SCHEMA IF EXISTS core CASCADE;

CREATE SCHEMA core;
CREATE SCHEMA admin;
CREATE SCHEMA bondarys;

-- Set search path
SET search_path TO bondarys, core, admin, public;

-- Grant usage
GRANT USAGE ON SCHEMA core TO PUBLIC;
GRANT USAGE ON SCHEMA admin TO PUBLIC;
GRANT USAGE ON SCHEMA bondarys TO PUBLIC;

-- Schema comments
COMMENT ON SCHEMA core IS 'Global data + common features - used by ALL apps';
COMMENT ON SCHEMA admin IS 'Admin panel management - admin users, roles, permissions';
COMMENT ON SCHEMA bondarys IS 'Bondarys app specific - social, circles, chat, location';

-- ============================================================================
-- HELPER FUNCTION: Update timestamp trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ####################################################################################
--
--                              CORE SCHEMA
--                     (Global + Common Features)
--
-- ####################################################################################

-- ============================================================================
-- CORE: APPLICATIONS (App Registry)
-- ============================================================================

CREATE TABLE core.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    branding JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_applications_slug ON core.applications(slug);
CREATE INDEX idx_applications_active ON core.applications(is_active);

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON core.applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CORE: USERS (Shared across all apps)
-- ============================================================================

CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    bio TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON core.users(email);
CREATE INDEX idx_users_active ON core.users(is_active);
CREATE INDEX idx_users_phone ON core.users(phone_number);

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON core.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CORE: USER_APPLICATIONS (User-App Junction)
-- ============================================================================

CREATE TABLE core.user_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES core.applications(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}'::jsonb,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, application_id)
);

CREATE INDEX idx_user_applications_user ON core.user_applications(user_id);
CREATE INDEX idx_user_applications_app ON core.user_applications(application_id);

-- ============================================================================
-- CORE: REFERENCE DATA (Countries, Languages, Currencies)
-- ============================================================================

CREATE TABLE core.countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    phone_code VARCHAR(10),
    currency_code VARCHAR(3),
    flag_emoji VARCHAR(10),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE core.languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    direction VARCHAR(3) DEFAULT 'ltr',
    is_active BOOLEAN DEFAULT true
);

-- NOTE: core.currencies table removed (unused)

-- ============================================================================
-- CORE: USER SESSIONS & DEVICES
-- ============================================================================

CREATE TABLE core.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES core.applications(id) ON DELETE SET NULL,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user ON core.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON core.user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires ON core.user_sessions(expires_at);

CREATE TABLE core.user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES core.applications(id) ON DELETE SET NULL,
    device_id VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    platform VARCHAR(50),
    os_version VARCHAR(50),
    app_version VARCHAR(50),
    push_token TEXT,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_devices_user ON core.user_devices(user_id);
CREATE INDEX idx_user_devices_device ON core.user_devices(device_id);

CREATE TABLE core.login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES core.applications(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    login_method VARCHAR(50),
    status VARCHAR(20) NOT NULL,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_login_history_user ON core.login_history(user_id);
CREATE INDEX idx_login_history_created ON core.login_history(created_at);

-- ============================================================================
-- CORE: USER SETTINGS
-- ============================================================================

CREATE TABLE core.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES core.applications(id) ON DELETE SET NULL,
    language_code VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    theme VARCHAR(20) DEFAULT 'system',
    notification_preferences JSONB DEFAULT '{}'::jsonb,
    privacy_settings JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, application_id)
);

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON core.user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CORE: FILES & STORAGE
-- ============================================================================

CREATE TABLE core.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES core.applications(id) ON DELETE SET NULL,
    folder_id UUID,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT,
    storage_path TEXT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'local',
    url TEXT,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_files_user ON core.files(user_id);
CREATE INDEX idx_files_app ON core.files(application_id);
CREATE INDEX idx_files_folder ON core.files(folder_id);
CREATE INDEX idx_files_mime ON core.files(mime_type);

CREATE TABLE core.file_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES core.applications(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES core.file_folders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(20),
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE core.files ADD CONSTRAINT fk_files_folder 
    FOREIGN KEY (folder_id) REFERENCES core.file_folders(id) ON DELETE SET NULL;

-- NOTE: core.gallery_items and core.gallery_albums tables removed (unused)

-- ============================================================================
-- CORE: NOTIFICATIONS
-- ============================================================================

CREATE TABLE core.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES core.applications(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    body TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON core.notifications(user_id);
CREATE INDEX idx_notifications_app ON core.notifications(application_id);
CREATE INDEX idx_notifications_read ON core.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON core.notifications(created_at);

CREATE TABLE core.user_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES core.applications(id) ON DELETE SET NULL,
    token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL,
    device_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_push_tokens_user ON core.user_push_tokens(user_id);
CREATE UNIQUE INDEX idx_push_tokens_token ON core.user_push_tokens(token);

-- ============================================================================
-- CORE: EMAIL TEMPLATES
-- ============================================================================

CREATE TABLE core.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES core.applications(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT,
    text_content TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(application_id, slug)
);

-- NOTE: core.subscription_plans and core.subscriptions tables removed (unused)

-- ============================================================================
-- CORE: SYSTEM CONFIG
-- ============================================================================

CREATE TABLE core.system_config (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE core.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES core.applications(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(application_id, key)
);


-- ####################################################################################
--
--                              ADMIN SCHEMA
--                          (Admin Panel Only)
--
-- ####################################################################################

-- ============================================================================
-- ADMIN: ADMIN USERS
-- ============================================================================

CREATE TABLE admin.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role_id UUID,
    is_super_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin.admin_users(email);

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin.admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ADMIN: ROLES & PERMISSIONS
-- ============================================================================

CREATE TABLE admin.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    color VARCHAR(20),
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE admin.admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE(module, action)
);

CREATE TABLE admin.admin_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES admin.admin_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES admin.admin_permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

ALTER TABLE admin.admin_users ADD CONSTRAINT fk_admin_users_role 
    FOREIGN KEY (role_id) REFERENCES admin.admin_roles(id) ON DELETE SET NULL;

-- ============================================================================
-- ADMIN: ADMIN USER APPLICATIONS (Multi-app access)
-- ============================================================================

CREATE TABLE admin.admin_user_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin.admin_users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES core.applications(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '[]'::jsonb,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(admin_user_id, application_id)
);

CREATE INDEX idx_admin_user_apps_admin ON admin.admin_user_applications(admin_user_id);
CREATE INDEX idx_admin_user_apps_app ON admin.admin_user_applications(application_id);

-- ============================================================================
-- ADMIN: ACTIVITY LOG & AUDIT
-- ============================================================================

CREATE TABLE admin.admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin.admin_users(id) ON DELETE SET NULL,
    application_id UUID REFERENCES core.applications(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_admin ON admin.admin_activity_log(admin_user_id);
CREATE INDEX idx_admin_activity_app ON admin.admin_activity_log(application_id);
CREATE INDEX idx_admin_activity_created ON admin.admin_activity_log(created_at);

CREATE TABLE admin.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES core.applications(id) ON DELETE SET NULL,
    actor_type VARCHAR(50) NOT NULL,
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_app ON admin.audit_logs(application_id);
CREATE INDEX idx_audit_logs_actor ON admin.audit_logs(actor_type, actor_id);
CREATE INDEX idx_audit_logs_created ON admin.audit_logs(created_at);


-- ####################################################################################
--
--                            BONDARYS SCHEMA
--                        (Bondarys App Specific)
--
-- ####################################################################################

-- ============================================================================
-- BONDARYS: CIRCLES (Family/Friend Groups)
-- ============================================================================

CREATE TABLE bondarys.circle_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    default_settings JSONB DEFAULT '{}'::jsonb,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bondarys.circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    circle_type_id UUID REFERENCES bondarys.circle_types(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    invite_code VARCHAR(20) UNIQUE,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_circles_owner ON bondarys.circles(owner_id);
CREATE INDEX idx_circles_type ON bondarys.circles(circle_type_id);
CREATE INDEX idx_circles_invite ON bondarys.circles(invite_code);

CREATE TABLE bondarys.circle_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES bondarys.circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    nickname VARCHAR(100),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES core.users(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    UNIQUE(circle_id, user_id)
);

CREATE INDEX idx_circle_members_circle ON bondarys.circle_members(circle_id);
CREATE INDEX idx_circle_members_user ON bondarys.circle_members(user_id);

-- ============================================================================
-- BONDARYS: SAFETY & EMERGENCY
-- ============================================================================

CREATE TABLE bondarys.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    relationship VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    notify_on_emergency BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_emergency_contacts_user ON bondarys.emergency_contacts(user_id);

CREATE TABLE bondarys.safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    circle_id UUID REFERENCES bondarys.circles(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_name VARCHAR(255),
    description TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES core.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_safety_incidents_user ON bondarys.safety_incidents(user_id);
CREATE INDEX idx_safety_incidents_status ON bondarys.safety_incidents(status);

-- ============================================================================
-- BONDARYS: SOCIAL POSTS
-- ============================================================================

CREATE TABLE bondarys.social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    circle_id UUID REFERENCES bondarys.circles(id) ON DELETE CASCADE,
    content TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,
    location_name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    visibility VARCHAR(20) DEFAULT 'public',
    is_pinned BOOLEAN DEFAULT false,
    reaction_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_social_posts_author ON bondarys.social_posts(author_id);
CREATE INDEX idx_social_posts_circle ON bondarys.social_posts(circle_id);
CREATE INDEX idx_social_posts_created ON bondarys.social_posts(created_at DESC);

CREATE TABLE bondarys.social_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES bondarys.social_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES bondarys.social_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_social_comments_post ON bondarys.social_comments(post_id);
CREATE INDEX idx_social_comments_author ON bondarys.social_comments(author_id);

CREATE TABLE bondarys.social_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES bondarys.social_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES bondarys.social_comments(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_reaction_target CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX idx_social_reactions_post ON bondarys.social_reactions(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX idx_social_reactions_comment ON bondarys.social_reactions(user_id, comment_id) WHERE comment_id IS NOT NULL;

-- ============================================================================
-- BONDARYS: SOCIAL STORIES
-- ============================================================================

CREATE TABLE bondarys.social_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    caption TEXT,
    background_color VARCHAR(20),
    view_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_social_stories_author ON bondarys.social_stories(author_id);
CREATE INDEX idx_social_stories_expires ON bondarys.social_stories(expires_at);

CREATE TABLE bondarys.social_story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES bondarys.social_stories(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, viewer_id)
);

-- ============================================================================
-- BONDARYS: FOLLOWS & FRIENDS
-- ============================================================================

CREATE TABLE bondarys.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_user_follows_follower ON bondarys.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON bondarys.user_follows(following_id);

CREATE TABLE bondarys.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

CREATE INDEX idx_friend_requests_receiver ON bondarys.friend_requests(receiver_id, status);

-- ============================================================================
-- BONDARYS: CHAT SYSTEM
-- ============================================================================

CREATE TABLE bondarys.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID REFERENCES bondarys.circles(id) ON DELETE SET NULL,
    name VARCHAR(255),
    type VARCHAR(20) NOT NULL DEFAULT 'direct',
    avatar_url TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES core.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_rooms_circle ON bondarys.chat_rooms(circle_id);
CREATE INDEX idx_chat_rooms_last_message ON bondarys.chat_rooms(last_message_at DESC);

CREATE TABLE bondarys.chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES bondarys.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    nickname VARCHAR(100),
    is_muted BOOLEAN DEFAULT false,
    muted_until TIMESTAMP WITH TIME ZONE,
    last_read_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE INDEX idx_chat_participants_room ON bondarys.chat_participants(room_id);
CREATE INDEX idx_chat_participants_user ON bondarys.chat_participants(user_id);

CREATE TABLE bondarys.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES bondarys.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    reply_to_id UUID REFERENCES bondarys.chat_messages(id) ON DELETE SET NULL,
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    media_url TEXT,
    media_type VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room ON bondarys.chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON bondarys.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created ON bondarys.chat_messages(room_id, created_at DESC);

CREATE TABLE bondarys.chat_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES bondarys.chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE TABLE bondarys.chat_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES bondarys.chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    emoji VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- ============================================================================
-- BONDARYS: LOCATION TRACKING
-- ============================================================================

CREATE TABLE bondarys.user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(10, 2),
    altitude DECIMAL(10, 2),
    speed DECIMAL(10, 2),
    heading DECIMAL(5, 2),
    battery_level INTEGER,
    is_moving BOOLEAN,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_locations_user ON bondarys.user_locations(user_id);
CREATE INDEX idx_user_locations_recorded ON bondarys.user_locations(user_id, recorded_at DESC);

CREATE TABLE bondarys.geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    circle_id UUID REFERENCES bondarys.circles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius INTEGER NOT NULL,
    address TEXT,
    type VARCHAR(50) DEFAULT 'custom',
    notify_on_enter BOOLEAN DEFAULT true,
    notify_on_exit BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_geofences_user ON bondarys.geofences(user_id);
CREATE INDEX idx_geofences_circle ON bondarys.geofences(circle_id);

CREATE TABLE bondarys.location_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES core.users(id) ON DELETE CASCADE,
    shared_with_circle_id UUID REFERENCES bondarys.circles(id) ON DELETE CASCADE,
    duration_minutes INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_share_target CHECK (
        (shared_with_user_id IS NOT NULL AND shared_with_circle_id IS NULL) OR 
        (shared_with_user_id IS NULL AND shared_with_circle_id IS NOT NULL)
    )
);

CREATE INDEX idx_location_shares_user ON bondarys.location_shares(user_id);

-- ============================================================================
-- BONDARYS: NOTES (Direct table, not collection)
-- ============================================================================

CREATE TABLE bondarys.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    circle_id UUID REFERENCES bondarys.circles(id) ON DELETE SET NULL,
    title VARCHAR(255),
    content TEXT,
    color VARCHAR(20),
    tags JSONB DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    reminder_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_user ON bondarys.notes(user_id);
CREATE INDEX idx_notes_circle ON bondarys.notes(circle_id);
CREATE INDEX idx_notes_pinned ON bondarys.notes(user_id, is_pinned) WHERE is_pinned = true;

CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON bondarys.notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BONDARYS: TODOS (Direct table, not collection)
-- ============================================================================

CREATE TABLE bondarys.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    circle_id UUID REFERENCES bondarys.circles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES core.users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_todos_user ON bondarys.todos(user_id);
CREATE INDEX idx_todos_circle ON bondarys.todos(circle_id);
CREATE INDEX idx_todos_status ON bondarys.todos(user_id, status);
CREATE INDEX idx_todos_due ON bondarys.todos(due_date) WHERE status != 'completed';

CREATE TRIGGER update_todos_updated_at 
    BEFORE UPDATE ON bondarys.todos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DEFAULT DATA
-- ============================================================================

-- Default application
INSERT INTO core.applications (name, slug, description, is_active) 
VALUES ('Bondarys', 'bondarys', 'Family & friends connection app', true);

-- Default circle types
INSERT INTO bondarys.circle_types (name, display_name, icon, color, is_system) VALUES
('family', 'Family', 'users', '#3B82F6', true),
('friends', 'Friends', 'heart', '#EC4899', true),
('work', 'Work', 'briefcase', '#F59E0B', true),
('custom', 'Custom', 'circle', '#6B7280', false);

-- Default admin role
INSERT INTO admin.admin_roles (name, display_name, description, is_system) VALUES
('super_admin', 'Super Admin', 'Full system access', true),
('admin', 'Admin', 'Standard admin access', true),
('editor', 'Editor', 'Content editing access', true),
('viewer', 'Viewer', 'Read-only access', true);

-- Default permissions
INSERT INTO admin.admin_permissions (module, action, description) VALUES
('dashboard', 'view', 'View dashboard'),
('users', 'view', 'View users'),
('users', 'create', 'Create users'),
('users', 'edit', 'Edit users'),
('users', 'delete', 'Delete users'),
('circles', 'view', 'View circles'),
('circles', 'manage', 'Manage circles'),
('content', 'view', 'View content'),
('content', 'create', 'Create content'),
('content', 'edit', 'Edit content'),
('content', 'delete', 'Delete content'),
('settings', 'view', 'View settings'),
('settings', 'edit', 'Edit settings'),
('database', 'view', 'View database explorer');

-- ============================================================================
-- FINAL: Set default search path for database
-- ============================================================================

ALTER DATABASE boundary SET search_path TO bondarys, core, admin, public;

-- Done!
COMMENT ON DATABASE boundary IS 'Boundary database with 3-schema structure: core, admin, bondarys';
