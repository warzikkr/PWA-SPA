-- ============================================================
-- FIX v4: Missing RLS policies + schema fixes
--
-- Issues found:
-- 1. Kiosk (anon) can't UPDATE clients (preferences, visit history)
-- 2. Therapist can't UPDATE bookings (start/finish session)
-- 3. Reception can't INSERT intakes
-- 4. client_id in bookings is NOT NULL + FK — walk-in flow breaks
-- 5. Therapist can't read intakes properly
-- ============================================================

-- FIX 1: Allow anon to update clients (kiosk updates preferences)
CREATE POLICY clients_anon_update ON public.clients
  FOR UPDATE USING (auth.role() = 'anon');

-- FIX 2: Allow therapist to update their own bookings (start/finish)
CREATE POLICY bookings_therapist_update ON public.bookings
  FOR UPDATE USING (
    (auth.jwt()->'app_metadata'->>'user_role') = 'therapist'
    AND therapist_id = (auth.jwt()->'app_metadata'->>'user_therapist_id')
  );

-- FIX 3: Allow reception to insert/read intakes
CREATE POLICY intakes_reception_insert ON public.intakes
  FOR INSERT WITH CHECK ((auth.jwt()->'app_metadata'->>'user_role') = 'reception');

-- FIX 4: Make client_id nullable for walk-in bookings (no client yet)
ALTER TABLE public.bookings ALTER COLUMN client_id DROP NOT NULL;

-- FIX 5: Broader therapist read on intakes — allow reading intakes
-- for any booking they can see (drop old restrictive policy, add simple one)
DROP POLICY IF EXISTS intakes_therapist_read ON public.intakes;
CREATE POLICY intakes_therapist_read ON public.intakes
  FOR SELECT USING ((auth.jwt()->'app_metadata'->>'user_role') = 'therapist');

-- FIX 6: Allow anon to read intakes (kiosk getByBookingId check)
CREATE POLICY intakes_anon_read ON public.intakes
  FOR SELECT USING (auth.role() = 'anon');

-- Reload schema
NOTIFY pgrst, 'reload schema';
