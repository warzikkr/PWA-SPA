-- ============================================================
-- FIX v2: Remove all helper functions from RLS policies.
-- Use inline JWT access instead — no function calls, no circular deps.
-- ============================================================

-- STEP 1: Drop ALL existing policies
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- STEP 2: Drop old helper functions
DROP FUNCTION IF EXISTS public.user_role();
DROP FUNCTION IF EXISTS public.user_therapist_id();

-- STEP 3: Make sure trigger exists to sync role into JWT metadata
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

DROP TRIGGER IF EXISTS on_user_role_change ON public.users;
CREATE TRIGGER on_user_role_change
  AFTER INSERT OR UPDATE OF role, therapist_id ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_role_to_auth();

-- Re-sync existing seed users
UPDATE auth.users au
SET raw_app_meta_data = au.raw_app_meta_data
  || jsonb_build_object('user_role', u.role)
  || jsonb_build_object('user_therapist_id', COALESCE(u.therapist_id, ''))
FROM public.users u
WHERE au.id = u.auth_uid;

-- ============================================================
-- STEP 4: Recreate ALL policies using inline JWT expressions
--
-- Shorthand used below:
--   role check:       (auth.jwt()->'app_metadata'->>'user_role')
--   therapist check:  (auth.jwt()->'app_metadata'->>'user_therapist_id')
-- ============================================================

-- ── USERS ──
CREATE POLICY users_admin ON public.users
  FOR ALL USING ((auth.jwt()->'app_metadata'->>'user_role') = 'admin');
CREATE POLICY users_self_read ON public.users
  FOR SELECT USING (auth_uid = auth.uid());
CREATE POLICY users_reception_read ON public.users
  FOR SELECT USING ((auth.jwt()->'app_metadata'->>'user_role') = 'reception');
CREATE POLICY users_therapist_read ON public.users
  FOR SELECT USING ((auth.jwt()->'app_metadata'->>'user_role') = 'therapist');

-- ── CLIENTS ──
CREATE POLICY clients_admin ON public.clients
  FOR ALL USING ((auth.jwt()->'app_metadata'->>'user_role') = 'admin');
CREATE POLICY clients_reception_read ON public.clients
  FOR SELECT USING ((auth.jwt()->'app_metadata'->>'user_role') = 'reception');
CREATE POLICY clients_reception_insert ON public.clients
  FOR INSERT WITH CHECK ((auth.jwt()->'app_metadata'->>'user_role') = 'reception');
CREATE POLICY clients_reception_update ON public.clients
  FOR UPDATE USING ((auth.jwt()->'app_metadata'->>'user_role') = 'reception');
CREATE POLICY clients_therapist_read ON public.clients
  FOR SELECT USING ((auth.jwt()->'app_metadata'->>'user_role') = 'therapist');
CREATE POLICY clients_anon_insert ON public.clients
  FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY clients_anon_select ON public.clients
  FOR SELECT USING (auth.role() = 'anon');

-- ── BOOKINGS ──
CREATE POLICY bookings_admin ON public.bookings
  FOR ALL USING ((auth.jwt()->'app_metadata'->>'user_role') = 'admin');
CREATE POLICY bookings_reception ON public.bookings
  FOR ALL USING ((auth.jwt()->'app_metadata'->>'user_role') = 'reception');
CREATE POLICY bookings_therapist_read ON public.bookings
  FOR SELECT USING (
    (auth.jwt()->'app_metadata'->>'user_role') = 'therapist'
    AND therapist_id = (auth.jwt()->'app_metadata'->>'user_therapist_id')
  );
CREATE POLICY bookings_anon_insert ON public.bookings
  FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY bookings_anon_select ON public.bookings
  FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY bookings_anon_update ON public.bookings
  FOR UPDATE USING (auth.role() = 'anon');

-- ── INTAKES ──
CREATE POLICY intakes_admin ON public.intakes
  FOR ALL USING ((auth.jwt()->'app_metadata'->>'user_role') = 'admin');
CREATE POLICY intakes_reception_read ON public.intakes
  FOR SELECT USING ((auth.jwt()->'app_metadata'->>'user_role') = 'reception');
CREATE POLICY intakes_therapist_read ON public.intakes
  FOR SELECT USING (
    (auth.jwt()->'app_metadata'->>'user_role') = 'therapist'
    AND booking_id IN (
      SELECT id FROM public.bookings
      WHERE therapist_id = (auth.jwt()->'app_metadata'->>'user_therapist_id')
    )
  );
CREATE POLICY intakes_anon_insert ON public.intakes
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- ── THERAPIST NOTES ──
CREATE POLICY notes_admin ON public.therapist_notes
  FOR ALL USING ((auth.jwt()->'app_metadata'->>'user_role') = 'admin');
CREATE POLICY notes_reception_read ON public.therapist_notes
  FOR SELECT USING ((auth.jwt()->'app_metadata'->>'user_role') = 'reception');
CREATE POLICY notes_therapist ON public.therapist_notes
  FOR ALL USING (
    (auth.jwt()->'app_metadata'->>'user_role') = 'therapist'
    AND therapist_id = (auth.jwt()->'app_metadata'->>'user_therapist_id')
  );

-- ── CHANGE REQUESTS ──
CREATE POLICY cr_admin ON public.change_requests
  FOR ALL USING ((auth.jwt()->'app_metadata'->>'user_role') = 'admin');
CREATE POLICY cr_reception_read ON public.change_requests
  FOR SELECT USING ((auth.jwt()->'app_metadata'->>'user_role') = 'reception');
CREATE POLICY cr_reception_insert ON public.change_requests
  FOR INSERT WITH CHECK ((auth.jwt()->'app_metadata'->>'user_role') = 'reception');

-- ── APP CONFIG ──
CREATE POLICY config_admin ON public.app_config
  FOR ALL USING ((auth.jwt()->'app_metadata'->>'user_role') = 'admin');
CREATE POLICY config_authenticated_read ON public.app_config
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY config_anon_read ON public.app_config
  FOR SELECT USING (auth.role() = 'anon');

-- ============================================================
-- STEP 5: Reload PostgREST schema cache
-- ============================================================
NOTIFY pgrst, 'reload schema';
