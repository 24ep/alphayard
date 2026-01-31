-- 30-seed.sql
-- This script replaces all mockup data with real database entries

-- Clear existing data (in development only)
TRUNCATE TABLE 
  circle_members,
  circles,
  users,
  chat_rooms,
  messages,
  user_locations,
  geofences,
  safety_alerts,
  files,
  calendar_events,
  tasks,
  notifications
CASCADE;

-- Insert sample users
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, avatar_url, email_verified, created_at, updated_at) VALUES
('76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', 'john.doe@example.com', '$2b$10$example_hash_1', 'John', 'Doe', '+1234567890', 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=JD', true, NOW(), NOW()),
('ae89f5fe-5d84-4cc7-a10c-83a7de9183eb', 'jane.doe@example.com', '$2b$10$example_hash_2', 'Jane', 'Doe', '+1234567891', 'https://via.placeholder.com/150/10B981/FFFFFF?text=JD', true, NOW(), NOW()),
('bc486139-4808-4715-8b18-360c031d5009', 'mike.smith@example.com', '$2b$10$example_hash_3', 'Mike', 'Smith', '+1234567892', 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=MS', true, NOW(), NOW()),
('b43b7fac-ea6d-43ca-bf18-390b3b86ae8b', 'sarah.johnson@example.com', '$2b$10$example_hash_4', 'Sarah', 'Johnson', '+1234567893', 'https://via.placeholder.com/150/EF4444/FFFFFF?text=SJ', true, NOW(), NOW()),
('df94d8a9-7390-40d1-8efc-a4f2cb0f6b0d', 'david.wilson@example.com', '$2b$10$example_hash_5', 'David', 'Wilson', '+1234567894', 'https://via.placeholder.com/150/8B5CF6/FFFFFF?text=DW', true, NOW(), NOW());

-- Insert sample families
INSERT INTO circles (id, name, type, description, created_by, owner_id, created_at, updated_at) VALUES
('8e24f6b2-3285-4dfc-8070-30c93f291808', 'Doe Circle', 'circle', 'The main Doe Circle household', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', NOW(), NOW()),
('969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'Smith Circle', 'circle', 'The Smith Circle household', 'bc486139-4808-4715-8b18-360c031d5009', 'bc486139-4808-4715-8b18-360c031d5009', NOW(), NOW()),
('97a05be8-10cc-4337-a75e-071d6f7d999f', 'Johnson Circle', 'circle', 'The Johnson Circle household', 'b43b7fac-ea6d-43ca-bf18-390b3b86ae8b', 'b43b7fac-ea6d-43ca-bf18-390b3b86ae8b', NOW(), NOW());
-- Insert circle members
INSERT INTO circle_members (id, circle_id, user_id, role, joined_at) VALUES
('5a347320-8d46-4db7-9144-526b53d515f7', '8e24f6b2-3285-4dfc-8070-30c93f291808', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', 'admin', NOW()),
('2def948e-fa10-4b83-9453-c902c2b276e1', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'ae89f5fe-5d84-4cc7-a10c-83a7de9183eb', 'member', NOW()),
('d82337d6-9bf3-4594-aab6-c03214509713', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'bc486139-4808-4715-8b18-360c031d5009', 'admin', NOW()),
('5a668576-b706-4e31-9ca7-4c9cc3af40f0', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'b43b7fac-ea6d-43ca-bf18-390b3b86ae8b', 'member', NOW()),
('d337cef8-aab9-4d20-97d1-f701dd489282', '97a05be8-10cc-4337-a75e-071d6f7d999f', 'df94d8a9-7390-40d1-8efc-a4f2cb0f6b0d', 'admin', NOW());

-- Insert chat rooms
INSERT INTO chat_rooms (id, circle_id, name, type, created_at, updated_at) VALUES
('75ea2aaa-e086-4896-822c-c70269989a60', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'Doe Circle Chat', 'circle', NOW(), NOW()),
('03e83793-ca4d-45a6-a3be-43c9e1a0d727', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'Smith Circle Chat', 'circle', NOW(), NOW()),
('c4a5bc5e-ec89-4816-8a7d-cb4d19796377', '97a05be8-10cc-4337-a75e-071d6f7d999f', 'Johnson Circle Chat', 'circle', NOW(), NOW());

-- Insert chat participants

-- Insert sample messages
INSERT INTO chat_messages (id, room_id, sender_id, content, type, created_at, updated_at) VALUES
('3f4521a5-7e0f-45ab-9204-9c5d61aea3ac', '75ea2aaa-e086-4896-822c-c70269989a60', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', 'Welcome to our circle chat!', 'text', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('ea57ee70-a9d6-4280-801d-174fe5085bbd', '75ea2aaa-e086-4896-822c-c70269989a60', 'ae89f5fe-5d84-4cc7-a10c-83a7de9183eb', 'Thanks for setting this up!', 'text', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('1a4ee142-3ab4-42b5-a945-8478576ee7c1', '75ea2aaa-e086-4896-822c-c70269989a60', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', 'How is everyone doing today?', 'text', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('fbe882ca-9102-40ad-92c2-b6581f6e3d38', '03e83793-ca4d-45a6-a3be-43c9e1a0d727', 'bc486139-4808-4715-8b18-360c031d5009', 'Circle dinner at 6 PM tonight', 'text', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('4962d245-7755-4b6a-b61f-3f4c464afc89', '03e83793-ca4d-45a6-a3be-43c9e1a0d727', 'b43b7fac-ea6d-43ca-bf18-390b3b86ae8b', 'I will be there!', 'text', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes');

-- Insert user locations
INSERT INTO user_locations (id, user_id, latitude, longitude, address, accuracy, created_at, updated_at) VALUES
('b65ae048-4f6f-48f5-bf2f-b8c544363c2c', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', 37.7749, -122.4194, '123 Main St, San Francisco, CA', 10.5, NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes'),
('8bf44626-764f-4f40-b395-5ebdcb410ce2', 'ae89f5fe-5d84-4cc7-a10c-83a7de9183eb', 37.7849, -122.4094, '456 Office Blvd, San Francisco, CA', 8.2, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes'),
('3fc4c880-6ec5-401b-b70a-d01dc835f0fd', 'bc486139-4808-4715-8b18-360c031d5009', 37.7649, -122.4294, '789 School Ave, San Francisco, CA', 12.1, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
('dad085ce-e0a0-4c16-bfe2-9352ca14c065', 'b43b7fac-ea6d-43ca-bf18-390b3b86ae8b', 37.7549, -122.4394, '321 Park St, San Francisco, CA', 9.8, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes'),
('7d9592b1-daaa-41a4-8723-866626703bde', 'df94d8a9-7390-40d1-8efc-a4f2cb0f6b0d', 37.7449, -122.4494, '654 Market St, San Francisco, CA', 11.3, NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes');

-- Insert geofences
INSERT INTO geofences (id, circle_id, name, latitude, longitude, radius, type, is_active, created_at, updated_at) VALUES
('7340eb2d-60a4-416a-84ff-6b2f6dfe7f04', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'Home', 37.7749, -122.4194, 100, 'home', true, NOW(), NOW()),
('bd1ba6af-4f25-4f38-b8fa-c2a2795a268a', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'School', 37.7849, -122.4094, 50, 'school', true, NOW(), NOW()),
('bf55a908-3aa8-441b-9b5f-1461e0ff9b44', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'Office', 37.7649, -122.4294, 75, 'work', true, NOW(), NOW()),
('429f1d25-b324-4206-aabd-24d107af7c93', '97a05be8-10cc-4337-a75e-071d6f7d999f', 'Park', 37.7549, -122.4394, 200, 'recreation', true, NOW(), NOW());

-- Insert safety alerts
INSERT INTO safety_alerts (id, user_id, circle_id, type, severity, message, location, is_resolved, created_at, updated_at) VALUES
('6e6e7231-4451-4cb2-a300-ab99caf8ebcb', 'bc486139-4808-4715-8b18-360c031d5009', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'panic', 'high', 'Emergency situation at school', '789 School Ave, San Francisco, CA', false, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('22400392-2b39-4786-b40e-915700b43dfb', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'inactivity', 'medium', 'No activity detected for 2 hours', '123 Main St, San Francisco, CA', true, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes'),
('c00e5fce-90ab-47d1-ade2-c53b87b27d11', 'b43b7fac-ea6d-43ca-bf18-390b3b86ae8b', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'geofence_exit', 'low', 'Left designated area', '321 Park St, San Francisco, CA', false, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes');

-- Insert sample files
INSERT INTO files (id, user_id, circle_id, filename, original_name, file_type, file_size, file_path, is_public, created_at, updated_at) VALUES
('029ca6d7-f01d-4945-b1b5-bff22e1a7942', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'family_photo_1.jpg', 'family_photo_1.jpg', 'image/jpeg', 2048576, '/uploads/family_photo_1.jpg', true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('1319332b-4bc4-4f94-bb48-b7166c98b2b8', 'ae89f5fe-5d84-4cc7-a10c-83a7de9183eb', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'document_1.pdf', 'important_document.pdf', 'application/pdf', 1024768, '/uploads/document_1.pdf', false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('54e5d4a1-e1e2-4dc6-accf-58dc8d11db9f', 'bc486139-4808-4715-8b18-360c031d5009', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'video_1.mp4', 'family_video.mp4', 'video/mp4', 10485760, '/uploads/video_1.mp4', true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- Insert sample events
INSERT INTO calendar_events (id, circle_id, title, description, start_time, end_time, location, created_by, created_at, updated_at) VALUES
('fb99813a-8441-43d5-8768-9802b6092a26', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'Circle Dinner', 'Weekly circle dinner', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 'Home', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', NOW(), NOW()),
('3e3c78fd-9760-4ea1-bcda-5e0ae85456f2', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'Doctor Appointment', 'Annual checkup', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 'City Medical Center', 'bc486139-4808-4715-8b18-360c031d5009', NOW(), NOW()),
('f65a7472-f3fb-47b8-8f27-8a8e7d0f3183', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'School Play', 'Kids school performance', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '2 hours', 'Lincoln Elementary', 'ae89f5fe-5d84-4cc7-a10c-83a7de9183eb', NOW(), NOW());

-- Insert event attendees

-- Insert sample tasks
INSERT INTO tasks (id, circle_id, title, description, priority, status, assigned_to, due_date, created_by, created_at, updated_at) VALUES
('a4f80898-c783-437b-b6f7-5e1552e66a22', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'Buy groceries', 'Weekly grocery shopping', 'medium', 'pending', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', NOW() + INTERVAL '1 day', 'ae89f5fe-5d84-4cc7-a10c-83a7de9183eb', NOW(), NOW()),
('4fddd05d-fe5f-4ffc-be22-68a1859cac7c', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'Pick up kids', 'Pick up kids from school', 'high', 'in_progress', 'ae89f5fe-5d84-4cc7-a10c-83a7de9183eb', NOW() + INTERVAL '2 hours', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', NOW(), NOW()),
('f3763725-7ed1-4bbf-b89c-a855ca6333a9', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'Pay bills', 'Monthly utility bills', 'high', 'completed', 'bc486139-4808-4715-8b18-360c031d5009', NOW() - INTERVAL '1 day', 'b43b7fac-ea6d-43ca-bf18-390b3b86ae8b', NOW(), NOW()),
('d7495229-60ab-48c0-922a-a1bf48c67a97', '97a05be8-10cc-4337-a75e-071d6f7d999f', 'Plan vacation', 'Summer vacation planning', 'low', 'pending', 'df94d8a9-7390-40d1-8efc-a4f2cb0f6b0d', NOW() + INTERVAL '1 week', 'df94d8a9-7390-40d1-8efc-a4f2cb0f6b0d', NOW(), NOW());

-- Insert sample notes

-- Insert sample notifications
INSERT INTO notifications (id, user_id, circle_id, type, title, message, is_read, created_at, updated_at) VALUES
('2d3225dc-a1bf-4b43-8a69-478b9608dd27', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'circle', 'New Circle Member', 'Jane Doe joined the circle', false, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('c684f6fd-929d-4d78-b9fb-5aae4a316485', 'ae89f5fe-5d84-4cc7-a10c-83a7de9183eb', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'safety', 'Safety Alert', 'Emergency alert from Mike Smith', false, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('6b153f61-f674-4cae-aade-ebdb5c0b5047', 'bc486139-4808-4715-8b18-360c031d5009', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'task', 'Task Assigned', 'You have been assigned a new task', true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('79722d01-6086-47e0-950f-7bffc55d9b6e', 'b43b7fac-ea6d-43ca-bf18-390b3b86ae8b', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'event', 'Upcoming Event', 'Circle dinner in 2 hours', false, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
('ae8cadc3-e39d-4357-9c5c-5ec8a1eb784a', 'df94d8a9-7390-40d1-8efc-a4f2cb0f6b0d', '97a05be8-10cc-4337-a75e-071d6f7d999f', 'message', 'New Message', 'New message in circle chat', false, NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes');

-- Update sequences to avoid conflicts
SELECT setval('users_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER)) FROM users WHERE id ~ '^user-[0-9]+$'));
SELECT setval('families_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER)) FROM families WHERE id ~ '^circle-[0-9]+$'));
SELECT setval('chat_rooms_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER)) FROM chat_rooms WHERE id ~ '^chat-[0-9]+$'));
SELECT setval('messages_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER)) FROM messages WHERE id ~ '^msg-[0-9]+$'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_user_id ON safety_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_files_circle_id ON files(circle_id);
CREATE INDEX IF NOT EXISTS idx_events_circle_id ON events(circle_id);
CREATE INDEX IF NOT EXISTS idx_tasks_circle_id ON tasks(circle_id);
CREATE INDEX IF NOT EXISTS idx_notes_circle_id ON notes(circle_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Insert sample gallery albums
INSERT INTO gallery_albums (id, circle_id, name, description, created_by, created_at, updated_at) VALUES
('cc6cc2e8-3cdb-4ed6-97d9-74e955d1eb35', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'hourse Photos', 'Our hourse memories', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', NOW(), NOW()),
('44c2d22f-2db9-4e40-9f22-38dca6f7a81d', '8e24f6b2-3285-4dfc-8070-30c93f291808', 'Vacation 2024', 'Summer vacation photos', 'ae89f5fe-5d84-4cc7-a10c-83a7de9183eb', NOW(), NOW()),
('9748233f-9509-4193-86c4-a54a1e7fc81f', '969b340a-e9d4-4f47-a2ad-a0c6b52e2e3c', 'Birthday Party', 'Mike birthday celebration', 'bc486139-4808-4715-8b18-360c031d5009', NOW(), NOW());

-- Insert sample gallery items
INSERT INTO gallery_items (id, album_id, file_id, title, description, created_by, created_at, updated_at) VALUES
('05c52139-e0a2-4a3b-9e64-e8fd6dfbc153', 'cc6cc2e8-3cdb-4ed6-97d9-74e955d1eb35', '029ca6d7-f01d-4945-b1b5-bff22e1a7942', 'hourse Portrait', 'Our annual hourse photo', '76313d4a-a6ce-4b4a-aea3-0b4b79e247c3', NOW(), NOW()),
('c4a5d723-7c18-42ba-bce4-dec93b0d8e6f', '44c2d22f-2db9-4e40-9f22-38dca6f7a81d', '54e5d4a1-e1e2-4dc6-accf-58dc8d11db9f', 'Beach Day', 'Fun day at the beach', 'ae89f5fe-5d84-4cc7-a10c-83a7de9183eb', NOW(), NOW()),
('e95d8e71-55a4-4446-98e9-b9de7b9ae4c7', '9748233f-9509-4193-86c4-a54a1e7fc81f', '029ca6d7-f01d-4945-b1b5-bff22e1a7942', 'Birthday Cake', 'Delicious birthday cake', 'bc486139-4808-4715-8b18-360c031d5009', NOW(), NOW());

-- ============================================
-- Mobile App Localization Seeding (mobile_app)
-- ============================================

-- Ensure core languages exist
INSERT INTO languages (code, name, native_name, direction, is_active, is_default, flag_emoji)
VALUES
('en','English','English','ltr',true,true,'🇺🇸'),
('th','Thai','ไทย','ltr',true,false,'🇹🇭'),
('vi','Vietnamese','Tiếng Việt','ltr',true,false,'🇻🇳'),
('id','Indonesian','Bahasa Indonesia','ltr',true,false,'🇮🇩'),
('lo','Lao','ລາວ','ltr',true,false,'🇱🇦'),
('my','Burmese','မြန်မာ','ltr',true,false,'🇲🇲')
ON CONFLICT (code) DO NOTHING;

-- Upsert mobile_app translation keys
INSERT INTO translation_keys (key, category, description, context, is_active)
VALUES
('ui.welcome.title','ui','Welcome screen title','mobile_app',true),
('ui.welcome.subtitle','ui','Welcome screen subtitle','mobile_app',true),
('ui.button.save','ui','Save button text','mobile_app',true),
('ui.button.cancel','ui','Cancel button text','mobile_app',true),
('ui.button.submit','ui','Submit button text','mobile_app',true),
('ui.button.delete','ui','Delete button text','mobile_app',true),
('ui.button.edit','ui','Edit button text','mobile_app',true),
('ui.button.add','ui','Add button text','mobile_app',true),
('ui.button.close','ui','Close button text','mobile_app',true),
('ui.button.back','ui','Back button text','mobile_app',true),
('ui.button.next','ui','Next button text','mobile_app',true),
('ui.button.previous','ui','Previous button text','mobile_app',true)
ON CONFLICT (key) DO UPDATE SET context='mobile_app', is_active=true;

-- Seed English translations (approved) for these keys if missing
INSERT INTO translations (key_id, language_id, value, is_approved, approved_at)
SELECT tk.id, l.id,
  CASE tk.key
    WHEN 'ui.welcome.title' THEN 'Welcome to Bondarys'
    WHEN 'ui.welcome.subtitle' THEN 'Connect with your family safely'
    WHEN 'ui.button.save' THEN 'Save'
    WHEN 'ui.button.cancel' THEN 'Cancel'
    WHEN 'ui.button.submit' THEN 'Submit'
    WHEN 'ui.button.delete' THEN 'Delete'
    WHEN 'ui.button.edit' THEN 'Edit'
    WHEN 'ui.button.add' THEN 'Add'
    WHEN 'ui.button.close' THEN 'Close'
    WHEN 'ui.button.back' THEN 'Back'
    WHEN 'ui.button.next' THEN 'Next'
    WHEN 'ui.button.previous' THEN 'Previous'
  END,
  true, NOW()
FROM translation_keys tk
JOIN languages l ON l.code='en'
LEFT JOIN translations t ON t.key_id=tk.id AND t.language_id=l.id
WHERE tk.context='mobile_app' AND t.id IS NULL;

-- Extend: Upsert additional mobile_app keys across app modules
INSERT INTO translation_keys (key, category, description, context, is_active)
VALUES
-- auth
('auth.login','auth','Login button label','mobile_app',true),
('auth.logout','auth','Logout button label','mobile_app',true),
('auth.register','auth','Register button label','mobile_app',true),
('auth.email','auth','Email field label','mobile_app',true),
('auth.password','auth','Password field label','mobile_app',true),
('auth.forgot_password','auth','Forgot password link','mobile_app',true),
-- navigation
('nav.home','navigation','Home tab','mobile_app',true),
('nav.chat','navigation','Chat tab','mobile_app',true),
('nav.calendar','navigation','Calendar tab','mobile_app',true),
('nav.tasks','navigation','Tasks tab','mobile_app',true),
('nav.personal','navigation','Personal tab','mobile_app',true),
('nav.settings','navigation','Settings tab','mobile_app',true),
('nav.safety','navigation','Safety tab','mobile_app',true),
-- settings
('settings.title','settings','Settings screen title','mobile_app',true),
('settings.language','settings','Language setting label','mobile_app',true),
('settings.notifications','settings','Notifications setting label','mobile_app',true),
('settings.privacy','settings','Privacy setting label','mobile_app',true),
('settings.account','settings','Account setting label','mobile_app',true),
('settings.save_success','settings','Settings saved confirmation','mobile_app',true),
-- chat
('chat.new_message','chat','New message placeholder','mobile_app',true),
('chat.typing','chat','Typing indicator','mobile_app',true),
('chat.send','chat','Send button','mobile_app',true),
('chat.attach','chat','Attach button','mobile_app',true),
('chat.read_by','chat','Read by label','mobile_app',true),
('chat.personal','chat','Personal label','mobile_app',true),
('chat.search','chat','Search messages label','mobile_app',true),
-- safety
('safety.alert','safety','Safety alert label','mobile_app',true),
('safety.panic','safety','Panic button','mobile_app',true),
('safety.share_location','safety','Share location action','mobile_app',true),
('safety.request_location','safety','Request location action','mobile_app',true),
('safety.geofence_enter','safety','Geofence entered label','mobile_app',true),
('safety.geofence_exit','safety','Geofence exited label','mobile_app',true),
-- calendar
('calendar.add_event','calendar','Add event action','mobile_app',true),
('calendar.edit_event','calendar','Edit event action','mobile_app',true),
('calendar.delete_event','calendar','Delete event action','mobile_app',true),
('calendar.today','calendar','Today label','mobile_app',true),
('calendar.all_day','calendar','All-day label','mobile_app',true),
-- tasks
('tasks.add','tasks','Add task action','mobile_app',true),
('tasks.edit','tasks','Edit task action','mobile_app',true),
('tasks.delete','tasks','Delete task action','mobile_app',true),
('tasks.complete','tasks','Complete task action','mobile_app',true),
('tasks.priority_low','tasks','Low priority label','mobile_app',true),
('tasks.priority_medium','tasks','Medium priority label','mobile_app',true),
('tasks.priority_high','tasks','High priority label','mobile_app',true),
-- notifications
('notifications.title','notifications','Notifications screen title','mobile_app',true),
('notifications.mark_read','notifications','Mark as read action','mobile_app',true),
('notifications.clear_all','notifications','Clear all notifications','mobile_app',true),
-- common additions
('common.search','common','Search label','mobile_app',true),
('common.filter','common','Filter label','mobile_app',true),
('common.enable','common','Enable label','mobile_app',true),
('common.disable','common','Disable label','mobile_app',true)
ON CONFLICT (key) DO UPDATE SET context='mobile_app', is_active=true;

-- Seed English values for added keys
INSERT INTO translations (key_id, language_id, value, is_approved, approved_at)
SELECT tk.id, l.id,
  CASE tk.key
    -- auth
    WHEN 'auth.login' THEN 'Login'
    WHEN 'auth.logout' THEN 'Logout'
    WHEN 'auth.register' THEN 'Register'
    WHEN 'auth.email' THEN 'Email'
    WHEN 'auth.password' THEN 'Password'
    WHEN 'auth.forgot_password' THEN 'Forgot Password?'
    -- navigation
    WHEN 'nav.home' THEN 'Home'
    WHEN 'nav.chat' THEN 'Chat'
    WHEN 'nav.calendar' THEN 'Calendar'
    WHEN 'nav.tasks' THEN 'Tasks'
    WHEN 'nav.personal' THEN 'Personal'
    WHEN 'nav.settings' THEN 'Settings'
    WHEN 'nav.safety' THEN 'Safety'
    -- settings
    WHEN 'settings.title' THEN 'Settings'
    WHEN 'settings.language' THEN 'Language'
    WHEN 'settings.notifications' THEN 'Notifications'
    WHEN 'settings.privacy' THEN 'Privacy'
    WHEN 'settings.account' THEN 'Account'
    WHEN 'settings.save_success' THEN 'Settings saved successfully'
    -- chat
    WHEN 'chat.new_message' THEN 'New message'
    WHEN 'chat.typing' THEN 'Typing…'
    WHEN 'chat.send' THEN 'Send'
    WHEN 'chat.attach' THEN 'Attach'
    WHEN 'chat.read_by' THEN 'Read by'
    WHEN 'chat.personal' THEN 'Personal'
    WHEN 'chat.search' THEN 'Search messages'
    -- safety
    WHEN 'safety.alert' THEN 'Safety Alert'
    WHEN 'safety.panic' THEN 'Panic'
    WHEN 'safety.share_location' THEN 'Share Location'
    WHEN 'safety.request_location' THEN 'Request Location'
    WHEN 'safety.geofence_enter' THEN 'Entered area'
    WHEN 'safety.geofence_exit' THEN 'Exited area'
    -- calendar
    WHEN 'calendar.add_event' THEN 'Add Event'
    WHEN 'calendar.edit_event' THEN 'Edit Event'
    WHEN 'calendar.delete_event' THEN 'Delete Event'
    WHEN 'calendar.today' THEN 'Today'
    WHEN 'calendar.all_day' THEN 'All day'
    -- tasks
    WHEN 'tasks.add' THEN 'Add Task'
    WHEN 'tasks.edit' THEN 'Edit Task'
    WHEN 'tasks.delete' THEN 'Delete Task'
    WHEN 'tasks.complete' THEN 'Complete'
    WHEN 'tasks.priority_low' THEN 'Low'
    WHEN 'tasks.priority_medium' THEN 'Medium'
    WHEN 'tasks.priority_high' THEN 'High'
    -- notifications
    WHEN 'notifications.title' THEN 'Notifications'
    WHEN 'notifications.mark_read' THEN 'Mark as read'
    WHEN 'notifications.clear_all' THEN 'Clear all'
    -- common
    WHEN 'common.search' THEN 'Search'
    WHEN 'common.filter' THEN 'Filter'
    WHEN 'common.enable' THEN 'Enable'
    WHEN 'common.disable' THEN 'Disable'
  END,
  true, NOW()
FROM translation_keys tk
JOIN languages l ON l.code='en'
LEFT JOIN translations t ON t.key_id=tk.id AND t.language_id=l.id
WHERE tk.context='mobile_app' AND t.id IS NULL;

-- Copy English values to other target languages where missing (unapproved)
INSERT INTO translations (key_id, language_id, value, is_approved, created_at, updated_at)
SELECT t_en.key_id, l_new.id, t_en.value, false, NOW(), NOW()
FROM translations t_en
JOIN languages l_en ON l_en.id=t_en.language_id AND l_en.code='en'
JOIN languages l_new ON l_new.code IN ('th','vi','id','lo','my')
LEFT JOIN translations t_existing ON t_existing.key_id=t_en.key_id AND t_existing.language_id=l_new.id
WHERE t_existing.id IS NULL;

COMMIT;

-- ============================================
-- Admin bootstrap (merged from seed_admin.sql)
-- ============================================

-- Ensure admin user exists
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, avatar_url, email_verified, created_at, updated_at)
SELECT '7b42c599-ba0b-4b9f-9ced-d76e77fcac3b', 'admin@bondary.com', '$2b$10$example_hash_admin', 'Admin', 'User', NULL, NULL, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@bondary.com');

-- Ensure demo family exists linked to admin user
INSERT INTO circles (id, name, description, created_by, owner_id, created_at, updated_at)
SELECT '25c03210-8047-48cb-be11-1a562ea2fdf2', 'Demo Family', 'Seeded family', u.id, u.id, NOW(), NOW()
FROM users u
WHERE u.email = 'admin@bondary.com'
ON CONFLICT (id) DO NOTHING;

-- Link admin as family admin member
INSERT INTO circle_members (id, circle_id, user_id, role, joined_at)
SELECT '1d3618ff-e0ea-4b7a-b745-695f2ab77850', '25c03210-8047-48cb-be11-1a562ea2fdf2', u.id, 'admin', NOW()
FROM users u
WHERE u.email = 'admin@bondary.com'
ON CONFLICT (id) DO NOTHING;