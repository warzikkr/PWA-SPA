-- ============================================================
-- Seed users — run AFTER schema.sql
--
-- This creates auth users + app user rows in one go.
-- Uses Supabase's auth.users table directly (requires running
-- as the postgres/service_role in SQL Editor).
-- ============================================================

-- 1. Create auth users (password = email prefix for dev)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role
) VALUES
  (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'admin@spa.local',
    crypt('admin', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'
  ),
  (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'reception@spa.local',
    crypt('reception', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'
  ),
  (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'anna@spa.local',
    crypt('anna', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'
  ),
  (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'maria@spa.local',
    crypt('maria', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'
  );

-- Also need identities for each auth user (required by Supabase Auth)
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
SELECT
  id, id, email,
  json_build_object('sub', id::text, 'email', email)::jsonb,
  'email', now(), now(), now()
FROM auth.users
WHERE email IN ('admin@spa.local', 'reception@spa.local', 'anna@spa.local', 'maria@spa.local');

-- 2. Link auth users to app users table
INSERT INTO public.users (full_name, username, role, therapist_id, enabled, auth_uid)
SELECT 'Admin',      'admin',     'admin',     NULL,   true, id FROM auth.users WHERE email = 'admin@spa.local'
UNION ALL
SELECT 'Front Desk', 'reception', 'reception', NULL,   true, id FROM auth.users WHERE email = 'reception@spa.local'
UNION ALL
SELECT 'Anna K.',    'anna',      'therapist', 'th_1', true, id FROM auth.users WHERE email = 'anna@spa.local'
UNION ALL
SELECT 'Maria S.',   'maria',     'therapist', 'th_2', true, id FROM auth.users WHERE email = 'maria@spa.local';
