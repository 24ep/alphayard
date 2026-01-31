DO $$
BEGIN
    -- 1. Ensure admin_role_id exists and maps to role_id if role_id exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'admin_role_id') THEN
        ALTER TABLE admin_users ADD COLUMN admin_role_id UUID REFERENCES admin_roles(id);
        UPDATE admin_users SET admin_role_id = role_id WHERE role_id IS NOT NULL;
    END IF;

    -- 2. Ensure user_id exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'user_id') THEN
        ALTER TABLE admin_users ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    -- 3. Migrate existing admins to users table and link them
    INSERT INTO public.users (email, password_hash, first_name, last_name, is_active, raw_user_meta_data)
    SELECT email, password_hash, first_name, last_name, is_active, jsonb_build_object('role', 'admin')
    FROM admin_users
    WHERE email NOT IN (SELECT email FROM public.users)
    ON CONFLICT (email) DO NOTHING;

    -- Link admin_users to users
    UPDATE admin_users au
    SET user_id = u.id
    FROM public.users u
    WHERE au.email = u.email AND au.user_id IS NULL;

    -- 4. Set role for existing users in metadata if missing
    UPDATE public.users u
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
    FROM admin_users au
    WHERE u.id = au.user_id AND (u.raw_user_meta_data->>'role' IS NULL OR u.raw_user_meta_data->>'role' != 'admin');

END $$;
