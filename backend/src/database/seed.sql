-- ============================================================================
-- BOUNDARY DATABASE SEED DATA
-- ============================================================================
-- 
-- Sample data for development and testing
-- This file is run after schema.sql
--
-- ============================================================================

SET search_path TO bondarys, core, admin, public;

-- ============================================================================
-- CORE: REFERENCE DATA
-- ============================================================================

-- Countries
INSERT INTO core.countries (code, name, native_name, phone_code, currency_code, flag_emoji, is_active) VALUES
('US', 'United States', 'United States', '+1', 'USD', '🇺🇸', true),
('GB', 'United Kingdom', 'United Kingdom', '+44', 'GBP', '🇬🇧', true),
('TH', 'Thailand', 'ประเทศไทย', '+66', 'THB', '🇹🇭', true),
('JP', 'Japan', '日本', '+81', 'JPY', '🇯🇵', true),
('SG', 'Singapore', 'Singapore', '+65', 'SGD', '🇸🇬', true),
('AU', 'Australia', 'Australia', '+61', 'AUD', '🇦🇺', true),
('DE', 'Germany', 'Deutschland', '+49', 'EUR', '🇩🇪', true),
('FR', 'France', 'France', '+33', 'EUR', '🇫🇷', true),
('CN', 'China', '中国', '+86', 'CNY', '🇨🇳', true),
('KR', 'South Korea', '대한민국', '+82', 'KRW', '🇰🇷', true);

-- Languages
INSERT INTO core.languages (code, name, native_name, direction, is_active) VALUES
('en', 'English', 'English', 'ltr', true),
('th', 'Thai', 'ภาษาไทย', 'ltr', true),
('ja', 'Japanese', '日本語', 'ltr', true),
('zh', 'Chinese', '中文', 'ltr', true),
('ko', 'Korean', '한국어', 'ltr', true),
('de', 'German', 'Deutsch', 'ltr', true),
('fr', 'French', 'Français', 'ltr', true),
('es', 'Spanish', 'Español', 'ltr', true);

-- Currencies
INSERT INTO core.currencies (code, name, symbol, decimal_places, is_active) VALUES
('USD', 'US Dollar', '$', 2, true),
('GBP', 'British Pound', '£', 2, true),
('EUR', 'Euro', '€', 2, true),
('THB', 'Thai Baht', '฿', 2, true),
('JPY', 'Japanese Yen', '¥', 0, true),
('SGD', 'Singapore Dollar', 'S$', 2, true),
('AUD', 'Australian Dollar', 'A$', 2, true),
('CNY', 'Chinese Yuan', '¥', 2, true),
('KRW', 'South Korean Won', '₩', 0, true);

-- ============================================================================
-- CORE: SAMPLE USERS
-- ============================================================================

-- Get default app ID
DO $$
DECLARE
    v_app_id UUID;
    v_user1_id UUID;
    v_user2_id UUID;
    v_user3_id UUID;
    v_admin_role_id UUID;
    v_super_admin_id UUID;
    v_circle_family_id UUID;
    v_circle_friends_id UUID;
    v_chat_room_id UUID;
BEGIN
    -- Get application ID
    SELECT id INTO v_app_id FROM core.applications WHERE slug = 'bondarys';

    -- Create sample users (password: password123 - bcrypt hash)
    INSERT INTO core.users (id, email, password_hash, first_name, last_name, phone_number, is_active, is_verified)
    VALUES 
        (gen_random_uuid(), 'john@example.com', '$2b$10$rQZ5xPGKqZ5X5X5X5X5X5O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5', 'John', 'Doe', '+1234567890', true, true),
        (gen_random_uuid(), 'jane@example.com', '$2b$10$rQZ5xPGKqZ5X5X5X5X5X5O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5', 'Jane', 'Smith', '+1234567891', true, true),
        (gen_random_uuid(), 'bob@example.com', '$2b$10$rQZ5xPGKqZ5X5X5X5X5X5O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5', 'Bob', 'Wilson', '+1234567892', true, true)
    RETURNING id INTO v_user1_id;

    SELECT id INTO v_user1_id FROM core.users WHERE email = 'john@example.com';
    SELECT id INTO v_user2_id FROM core.users WHERE email = 'jane@example.com';
    SELECT id INTO v_user3_id FROM core.users WHERE email = 'bob@example.com';

    -- Link users to application
    INSERT INTO core.user_applications (user_id, application_id, role, status)
    VALUES 
        (v_user1_id, v_app_id, 'member', 'active'),
        (v_user2_id, v_app_id, 'member', 'active'),
        (v_user3_id, v_app_id, 'member', 'active');

    -- Create user settings
    INSERT INTO core.user_settings (user_id, application_id, language_code, timezone, theme)
    VALUES 
        (v_user1_id, v_app_id, 'en', 'America/New_York', 'light'),
        (v_user2_id, v_app_id, 'en', 'Europe/London', 'dark'),
        (v_user3_id, v_app_id, 'th', 'Asia/Bangkok', 'system');

    -- ============================================================================
    -- ADMIN: SAMPLE ADMIN USER
    -- ============================================================================
    
    SELECT id INTO v_admin_role_id FROM admin.admin_roles WHERE name = 'super_admin';

    INSERT INTO admin.admin_users (id, email, password_hash, name, role_id, is_super_admin, is_active)
    VALUES (gen_random_uuid(), 'admin@bondarys.com', '$2b$10$rQZ5xPGKqZ5X5X5X5X5X5O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5', 'System Admin', v_admin_role_id, true, true)
    RETURNING id INTO v_super_admin_id;

    -- Link admin to application
    INSERT INTO admin.admin_user_applications (admin_user_id, application_id, role, is_primary)
    VALUES (v_super_admin_id, v_app_id, 'super_admin', true);

    -- ============================================================================
    -- BONDARYS: SAMPLE CIRCLES
    -- ============================================================================
    
    -- Create family circle
    INSERT INTO bondarys.circles (id, owner_id, circle_type_id, name, description, invite_code)
    VALUES (
        gen_random_uuid(),
        v_user1_id,
        (SELECT id FROM bondarys.circle_types WHERE name = 'family'),
        'Doe Family',
        'Our family circle',
        'DOE2024'
    ) RETURNING id INTO v_circle_family_id;

    -- Create friends circle
    INSERT INTO bondarys.circles (id, owner_id, circle_type_id, name, description, invite_code)
    VALUES (
        gen_random_uuid(),
        v_user1_id,
        (SELECT id FROM bondarys.circle_types WHERE name = 'friends'),
        'Close Friends',
        'My best friends',
        'FRIENDS24'
    ) RETURNING id INTO v_circle_friends_id;

    -- Add members to circles
    INSERT INTO bondarys.circle_members (circle_id, user_id, role)
    VALUES 
        (v_circle_family_id, v_user1_id, 'admin'),
        (v_circle_family_id, v_user2_id, 'member'),
        (v_circle_friends_id, v_user1_id, 'admin'),
        (v_circle_friends_id, v_user2_id, 'member'),
        (v_circle_friends_id, v_user3_id, 'member');

    -- ============================================================================
    -- BONDARYS: SAMPLE SOCIAL POSTS
    -- ============================================================================
    
    INSERT INTO bondarys.social_posts (author_id, circle_id, content, visibility, reaction_count, comment_count)
    VALUES 
        (v_user1_id, v_circle_family_id, 'Having a great family dinner tonight! 🍽️', 'circle', 5, 2),
        (v_user2_id, v_circle_friends_id, 'Just finished a morning run! 🏃‍♀️', 'circle', 8, 3),
        (v_user1_id, NULL, 'Beautiful sunset today 🌅', 'public', 12, 4),
        (v_user3_id, v_circle_friends_id, 'Weekend trip planning! Who''s in?', 'circle', 3, 5);

    -- Add comments
    INSERT INTO bondarys.social_comments (post_id, author_id, content)
    SELECT p.id, v_user2_id, 'Looks amazing!'
    FROM bondarys.social_posts p WHERE p.author_id = v_user1_id LIMIT 1;

    -- Add follows
    INSERT INTO bondarys.user_follows (follower_id, following_id)
    VALUES 
        (v_user1_id, v_user2_id),
        (v_user2_id, v_user1_id),
        (v_user3_id, v_user1_id),
        (v_user3_id, v_user2_id);

    -- ============================================================================
    -- BONDARYS: SAMPLE CHAT
    -- ============================================================================
    
    -- Create chat room for family circle
    INSERT INTO bondarys.chat_rooms (id, circle_id, name, type, created_by)
    VALUES (gen_random_uuid(), v_circle_family_id, 'Family Chat', 'group', v_user1_id)
    RETURNING id INTO v_chat_room_id;

    -- Add participants
    INSERT INTO bondarys.chat_participants (room_id, user_id, role)
    VALUES 
        (v_chat_room_id, v_user1_id, 'admin'),
        (v_chat_room_id, v_user2_id, 'member');

    -- Add messages
    INSERT INTO bondarys.chat_messages (room_id, sender_id, content, message_type)
    VALUES 
        (v_chat_room_id, v_user1_id, 'Hey everyone! Welcome to our family chat 👋', 'text'),
        (v_chat_room_id, v_user2_id, 'Thanks for creating this!', 'text'),
        (v_chat_room_id, v_user1_id, 'Let''s use this to stay connected', 'text');

    -- Update last message
    UPDATE bondarys.chat_rooms 
    SET last_message_at = NOW(), last_message_preview = 'Let''s use this to stay connected'
    WHERE id = v_chat_room_id;

    -- ============================================================================
    -- BONDARYS: SAMPLE LOCATIONS
    -- ============================================================================
    
    -- Add geofences (home, work)
    INSERT INTO bondarys.geofences (user_id, circle_id, name, latitude, longitude, radius, type, address)
    VALUES 
        (v_user1_id, v_circle_family_id, 'Home', 40.7128, -74.0060, 100, 'home', '123 Main St, New York, NY'),
        (v_user1_id, NULL, 'Office', 40.7580, -73.9855, 150, 'work', '456 Broadway, New York, NY');

    -- Add user locations
    INSERT INTO bondarys.user_locations (user_id, latitude, longitude, accuracy, battery_level, is_moving)
    VALUES 
        (v_user1_id, 40.7128, -74.0060, 10.5, 85, false),
        (v_user2_id, 51.5074, -0.1278, 15.0, 62, true);

    -- ============================================================================
    -- BONDARYS: SAMPLE NOTES
    -- ============================================================================
    
    INSERT INTO bondarys.notes (user_id, circle_id, title, content, color, is_pinned, tags)
    VALUES 
        (v_user1_id, NULL, 'Shopping List', '- Milk\n- Bread\n- Eggs\n- Butter', '#FEF3C7', true, '["shopping", "groceries"]'),
        (v_user1_id, v_circle_family_id, 'Family Vacation Ideas', '1. Beach trip\n2. Mountain hiking\n3. City tour', '#DBEAFE', false, '["travel", "family"]'),
        (v_user2_id, NULL, 'Meeting Notes', 'Discussed project timeline and milestones', '#F3E8FF', false, '["work", "meetings"]'),
        (v_user1_id, NULL, 'Recipe: Pasta', 'Ingredients:\n- Pasta\n- Tomato sauce\n- Cheese\n\nInstructions:\n1. Boil pasta\n2. Add sauce\n3. Top with cheese', '#DCFCE7', false, '["recipes", "cooking"]');

    -- ============================================================================
    -- BONDARYS: SAMPLE TODOS
    -- ============================================================================
    
    INSERT INTO bondarys.todos (user_id, circle_id, title, description, priority, status, due_date, tags)
    VALUES 
        (v_user1_id, NULL, 'Complete project report', 'Finish the quarterly report', 'high', 'pending', NOW() + INTERVAL '2 days', '["work"]'),
        (v_user1_id, NULL, 'Buy groceries', 'Get items from shopping list', 'medium', 'pending', NOW() + INTERVAL '1 day', '["personal", "shopping"]'),
        (v_user1_id, v_circle_family_id, 'Plan birthday party', 'Organize decorations and cake', 'high', 'pending', NOW() + INTERVAL '7 days', '["family", "events"]'),
        (v_user2_id, NULL, 'Schedule dentist', 'Annual checkup', 'low', 'completed', NOW() - INTERVAL '2 days', '["health"]'),
        (v_user1_id, NULL, 'Read book', 'Finish reading current book', 'low', 'pending', NOW() + INTERVAL '14 days', '["personal", "reading"]');

    -- ============================================================================
    -- BONDARYS: SAMPLE EMERGENCY CONTACTS
    -- ============================================================================
    
    INSERT INTO bondarys.emergency_contacts (user_id, name, phone_number, relationship, is_primary)
    VALUES 
        (v_user1_id, 'Jane Smith', '+1234567891', 'Spouse', true),
        (v_user1_id, 'Mom', '+1234567899', 'Mother', false),
        (v_user2_id, 'John Doe', '+1234567890', 'Spouse', true);

    -- ============================================================================
    -- CORE: SAMPLE NOTIFICATIONS
    -- ============================================================================
    
    INSERT INTO core.notifications (user_id, application_id, type, title, body, data, is_read)
    VALUES 
        (v_user1_id, v_app_id, 'social', 'New follower', 'Bob Wilson started following you', '{"user_id": "' || v_user3_id || '"}', false),
        (v_user1_id, v_app_id, 'circle', 'Circle update', 'Jane joined your family circle', '{"circle_id": "' || v_circle_family_id || '"}', true),
        (v_user2_id, v_app_id, 'chat', 'New message', 'John: Let''s use this to stay connected', '{"room_id": "' || v_chat_room_id || '"}', false);

END $$;

-- ============================================================================
-- CORE: EMAIL TEMPLATES
-- ============================================================================

INSERT INTO core.email_templates (application_id, name, slug, subject, html_content, text_content, variables)
SELECT 
    id,
    'Welcome Email',
    'welcome',
    'Welcome to {{app_name}}!',
    '<h1>Welcome, {{first_name}}!</h1><p>Thanks for joining {{app_name}}. We''re excited to have you.</p>',
    'Welcome, {{first_name}}! Thanks for joining {{app_name}}.',
    '["first_name", "app_name"]'::jsonb
FROM core.applications WHERE slug = 'bondarys';

INSERT INTO core.email_templates (application_id, name, slug, subject, html_content, text_content, variables)
SELECT 
    id,
    'Password Reset',
    'password-reset',
    'Reset your password',
    '<h1>Password Reset</h1><p>Hi {{first_name}}, click <a href="{{reset_link}}">here</a> to reset your password.</p>',
    'Hi {{first_name}}, visit this link to reset your password: {{reset_link}}',
    '["first_name", "reset_link"]'::jsonb
FROM core.applications WHERE slug = 'bondarys';

INSERT INTO core.email_templates (application_id, name, slug, subject, html_content, text_content, variables)
SELECT 
    id,
    'Circle Invitation',
    'circle-invite',
    'You''ve been invited to join {{circle_name}}',
    '<h1>Circle Invitation</h1><p>{{inviter_name}} invited you to join {{circle_name}}. Use code: {{invite_code}}</p>',
    '{{inviter_name}} invited you to join {{circle_name}}. Use code: {{invite_code}}',
    '["inviter_name", "circle_name", "invite_code"]'::jsonb
FROM core.applications WHERE slug = 'bondarys';

-- ============================================================================
-- CORE: SUBSCRIPTION PLANS
-- ============================================================================

INSERT INTO core.subscription_plans (application_id, name, slug, description, price_monthly, price_yearly, features, limits)
SELECT 
    id,
    'Free',
    'free',
    'Basic features for individuals',
    0.00,
    0.00,
    '["1 circle", "Basic location sharing", "Standard support"]'::jsonb,
    '{"circles": 1, "members_per_circle": 5, "storage_mb": 100}'::jsonb
FROM core.applications WHERE slug = 'bondarys';

INSERT INTO core.subscription_plans (application_id, name, slug, description, price_monthly, price_yearly, features, limits)
SELECT 
    id,
    'Plus',
    'plus',
    'More features for families',
    4.99,
    49.99,
    '["5 circles", "Advanced location sharing", "Location history", "Priority support"]'::jsonb,
    '{"circles": 5, "members_per_circle": 20, "storage_mb": 1000}'::jsonb
FROM core.applications WHERE slug = 'bondarys';

INSERT INTO core.subscription_plans (application_id, name, slug, description, price_monthly, price_yearly, features, limits)
SELECT 
    id,
    'Premium',
    'premium',
    'All features unlocked',
    9.99,
    99.99,
    '["Unlimited circles", "All location features", "Emergency SOS", "Premium support", "No ads"]'::jsonb,
    '{"circles": -1, "members_per_circle": -1, "storage_mb": 10000}'::jsonb
FROM core.applications WHERE slug = 'bondarys';

-- ============================================================================
-- CORE: SYSTEM CONFIG
-- ============================================================================

INSERT INTO core.system_config (key, value, description, is_public) VALUES
('app.version', '"2.0.0"', 'Current application version', true),
('app.maintenance_mode', 'false', 'Enable maintenance mode', false),
('features.social_enabled', 'true', 'Enable social features', false),
('features.chat_enabled', 'true', 'Enable chat features', false),
('features.location_enabled', 'true', 'Enable location features', false),
('limits.max_circle_members', '50', 'Maximum members per circle', false),
('limits.max_message_length', '5000', 'Maximum chat message length', false);

-- ============================================================================
-- ADMIN: ASSIGN PERMISSIONS TO ROLES
-- ============================================================================

-- Super Admin gets all permissions
INSERT INTO admin.admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin.admin_roles r, admin.admin_permissions p
WHERE r.name = 'super_admin';

-- Admin gets most permissions (except some settings)
INSERT INTO admin.admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin.admin_roles r, admin.admin_permissions p
WHERE r.name = 'admin' 
AND p.module != 'database';

-- Editor gets content permissions
INSERT INTO admin.admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin.admin_roles r, admin.admin_permissions p
WHERE r.name = 'editor' 
AND p.module IN ('dashboard', 'content', 'circles');

-- Viewer gets view permissions only
INSERT INTO admin.admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin.admin_roles r, admin.admin_permissions p
WHERE r.name = 'viewer' 
AND p.action = 'view';

-- ============================================================================
-- DONE
-- ============================================================================

\echo 'Seed data inserted successfully!'
\echo ''
\echo 'Sample accounts:'
\echo '  Users: john@example.com, jane@example.com, bob@example.com'
\echo '  Admin: admin@bondarys.com'
\echo '  Password: password123 (all accounts)'
