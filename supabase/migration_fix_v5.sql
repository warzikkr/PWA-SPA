-- ============================================================
-- migration_fix_v5.sql — Fix missing RLS policies for kiosk (anon)
--
-- ROOT CAUSE: Kiosk operates as anon user. Two critical policies
-- were missing, causing silent failures:
--
-- 1) intakes: anon can INSERT but cannot SELECT (needed by
--    .insert().select().single() returning clause)
-- 2) clients: anon can INSERT and SELECT but cannot UPDATE
--    (needed by findOrCreate, updatePreferences, addVisit)
-- ============================================================

-- Allow anon to read back inserted intakes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'intakes' AND policyname = 'intakes_anon_select'
  ) THEN
    EXECUTE 'CREATE POLICY intakes_anon_select ON public.intakes FOR SELECT USING (auth.role() = ''anon'')';
  END IF;
END
$$;

-- Allow anon to update client records (preferences, visit history)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'clients_anon_update'
  ) THEN
    EXECUTE 'CREATE POLICY clients_anon_update ON public.clients FOR UPDATE USING (auth.role() = ''anon'')';
  END IF;
END
$$;
