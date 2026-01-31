-- Modal Marketing CMS Migration
-- This migration creates tables for modal marketing content on homescreen

-- Modal Marketing Content Table
CREATE TABLE IF NOT EXISTS modal_marketing_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    modal_type VARCHAR(50) NOT NULL CHECK (modal_type IN ('popup', 'banner', 'notification', 'promotion', 'announcement')),
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('immediate', 'delayed', 'user_action', 'time_based', 'location_based')),
    trigger_delay INTEGER DEFAULT 0, -- seconds
    trigger_conditions JSONB, -- conditions for showing modal
    display_settings JSONB NOT NULL, -- styling and positioning
    target_audience JSONB, -- user segments, demographics
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    max_views_per_user INTEGER DEFAULT 1,
    max_views_total INTEGER,
    current_views INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modal Marketing Analytics Table
CREATE TABLE IF NOT EXISTS modal_marketing_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modal_id UUID REFERENCES modal_marketing_content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    circle_id UUID REFERENCES circles(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('view', 'click', 'close', 'dismiss', 'interact')),
    action_data JSONB, -- additional data about the action
    device_info JSONB, -- device, browser, OS info
    location_data JSONB, -- user location if available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modal Marketing User Interactions Table
CREATE TABLE IF NOT EXISTS modal_marketing_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modal_id UUID REFERENCES modal_marketing_content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    circle_id UUID REFERENCES circles(id) ON DELETE SET NULL,
    interaction_count INTEGER DEFAULT 1,
    first_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dismissed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(modal_id, user_id, circle_id)
);

-- Insert default modal content types
INSERT INTO content_types (name, description, schema) VALUES
('modal_popup', 'Popup modal for marketing content', '{
  "fields": {
    "title": {"type": "string", "required": true, "maxLength": 200},
    "content": {"type": "text", "required": true, "maxLength": 1000},
    "button_text": {"type": "string", "required": true, "maxLength": 50},
    "button_action": {"type": "string", "required": true, "maxLength": 100},
    "image_url": {"type": "string", "required": false},
    "background_color": {"type": "string", "required": false, "default": "#FFFFFF"},
    "text_color": {"type": "string", "required": false, "default": "#000000"},
    "button_color": {"type": "string", "required": false, "default": "#007BFF"},
    "close_button": {"type": "boolean", "default": true},
    "overlay_close": {"type": "boolean", "default": true}
  }
}'),
('modal_banner', 'Banner modal for announcements', '{
  "fields": {
    "title": {"type": "string", "required": true, "maxLength": 100},
    "message": {"type": "string", "required": true, "maxLength": 500},
    "banner_type": {"type": "string", "required": true, "enum": ["info", "warning", "success", "error"]},
    "position": {"type": "string", "required": true, "enum": ["top", "bottom", "center"]},
    "auto_close": {"type": "boolean", "default": false},
    "close_delay": {"type": "number", "default": 5000},
    "icon": {"type": "string", "required": false},
    "action_button": {"type": "object", "required": false}
  }
}'),
('modal_notification', 'Push notification modal', '{
  "fields": {
    "title": {"type": "string", "required": true, "maxLength": 100},
    "body": {"type": "string", "required": true, "maxLength": 200},
    "icon": {"type": "string", "required": false},
    "image": {"type": "string", "required": false},
    "action_url": {"type": "string", "required": false},
    "priority": {"type": "string", "enum": ["low", "normal", "high"], "default": "normal"},
    "sound": {"type": "boolean", "default": true},
    "vibration": {"type": "boolean", "default": true}
  }
}')
ON CONFLICT (name) DO NOTHING;

-- Insert default modal categories
INSERT INTO categories (circle_id, name, description, color, icon) VALUES
(NULL, 'Modal Popups', 'Marketing popup modals', '#FF6B6B', '💬'),
(NULL, 'Banner Alerts', 'Banner notifications and alerts', '#4ECDC4', '📢'),
(NULL, 'Promotions', 'Promotional content modals', '#45B7D1', '🎯'),
(NULL, 'Announcements', 'Important announcements', '#96CEB4', '📢'),
(NULL, 'System Notifications', 'System-generated notifications', '#FFEAA7', '🔔')
ON CONFLICT (circle_id, name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_modal_marketing_content_active ON modal_marketing_content(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_modal_marketing_content_trigger ON modal_marketing_content(trigger_type, trigger_delay);
CREATE INDEX IF NOT EXISTS idx_modal_marketing_analytics_modal ON modal_marketing_analytics(modal_id, created_at);
CREATE INDEX IF NOT EXISTS idx_modal_marketing_analytics_user ON modal_marketing_analytics(user_id, circle_id);
CREATE INDEX IF NOT EXISTS idx_modal_marketing_interactions_user ON modal_marketing_interactions(user_id, circle_id, modal_id);

-- Insert sample modal content
INSERT INTO modal_marketing_content (
    title, 
    content, 
    modal_type, 
    trigger_type, 
    trigger_delay, 
    display_settings, 
    target_audience, 
    priority, 
    is_active,
    start_date,
    end_date
) VALUES (
    'Welcome to Bondarys!',
    'Get started with your family safety network. Connect with your loved ones and stay safe together.',
    'popup',
    'immediate',
    0,
    '{"width": "90%", "height": "auto", "position": "center", "animation": "fadeIn", "overlay": true}',
    '{"user_types": ["new_user"], "circles": "all"}',
    10,
    true,
    NOW(),
    NOW() + INTERVAL '30 days'
),
(
    'New Feature Alert',
    'Check out our new location sharing feature! Share your location with family members safely.',
    'banner',
    'delayed',
    5,
    '{"position": "top", "color": "#4ECDC4", "text_color": "#FFFFFF", "animation": "slideDown"}',
    '{"user_types": ["existing_user"], "circles": "all"}',
    5,
    true,
    NOW(),
    NOW() + INTERVAL '7 days'
);
