-- ============================================================
-- FIX: Eliminate circular RLS dependency
--
-- Problem: user_role() queries public.users, but users RLS
-- policies call user_role() → infinite loop.
--
-- Solution: Store role + therapist_id in auth.users.raw_app_meta_data
-- and read from JWT instead of querying the table.
-- ============================================================

-- STEP 1: Create trigger that syncs role to auth.users metadata
CREATE OR REPLACE FUNCTION public.sync_user_role_to_auth()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data
    || jsonb_build_object('user_role', NEW.role)
    || jsonb_build_object('user_therapist_id', COALESCE(NEW.therapist_id, ''))
  WHERE id = NEW.auth_uid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire on insert and update of public.users
DROP TRIGGER IF EXISTS on_user_role_change ON public.users;
CREATE TRIGGER on_user_role_change
  AFTER INSERT OR UPDATE OF role, therapist_id ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_role_to_auth();

-- STEP 2: Sync existing users (run the trigger logic for seed data)
UPDATE auth.users au
SET raw_app_meta_data = au.raw_app_meta_data
  || jsonb_build_object('user_role', u.role)
  || jsonb_build_object('user_therapist_id', COALESCE(u.therapist_id, ''))
FROM public.users u
WHERE au.id = u.auth_uid;

-- STEP 3: Replace helper functions to read from JWT (no table query)
CREATE OR REPLACE FUNCTION public.user_role() RETURNS text AS $$
  SELECT coalesce(
    auth.jwt() -> 'app_metadata' ->> 'user_role',
    ''
  )
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.user_therapist_id() RETURNS text AS $$
  SELECT coalesce(
    auth.jwt() -> 'app_metadata' ->> 'user_therapist_id',
    ''
  )
$$ LANGUAGE sql STABLE;

-- STEP 4: Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
