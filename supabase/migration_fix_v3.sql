-- ============================================================
-- FIX v3: Grant permissions + simplified RLS
-- The root cause: anon/authenticated roles can't access tables
-- ============================================================

-- STEP 1: Grant schema + table access to anon and authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure future tables also get grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated;

-- STEP 2: Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
