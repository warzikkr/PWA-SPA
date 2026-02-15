-- ============================================================
-- FIX AUTH: Remove corrupted seed data from auth tables
-- After running this, create users via Supabase Dashboard
-- ============================================================

-- Step 1: Delete app users (they reference auth_uid)
DELETE FROM public.users;

-- Step 2: Delete identities first (FK to auth.users)
DELETE FROM auth.identities
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@spa.local', 'reception@spa.local', 'anna@spa.local', 'maria@spa.local')
);

-- Step 3: Delete corrupted auth users
DELETE FROM auth.users
WHERE email IN ('admin@spa.local', 'reception@spa.local', 'anna@spa.local', 'maria@spa.local');
