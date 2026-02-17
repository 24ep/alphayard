-- Create a test application for login configuration testing
INSERT INTO core.applications (
    id, 
    name, 
    slug, 
    description, 
    branding, 
    settings, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    'Test Application',
    'test-app',
    'A test application for login configuration',
    '{"appName": "Test App", "primaryColor": "#3b82f6", "secondaryColor": "#64748b", "accentColor": "#f59e0b"}',
    '{}',
    true,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Create another test app
INSERT INTO core.applications (
    id, 
    name, 
    slug, 
    description, 
    branding, 
    settings, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    'Demo Application',
    'demo-app',
    'A demo application for showcasing login configuration',
    '{"appName": "Demo App", "primaryColor": "#8b5cf6", "secondaryColor": "#ec4899", "accentColor": "#10b981"}',
    '{}',
    true,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;
