-- Migration: Booking System — status rename + availability support
-- Run this ONCE against your Supabase database.

-- 1. Rename existing 'pending' bookings to 'scheduled'
UPDATE public.bookings
SET status = 'scheduled'
WHERE status = 'pending';

-- 2. Ensure anon can query bookings by date (for availability checks on /book page)
-- This policy may already exist from migration_fix_v5.sql; CREATE OR REPLACE not available for policies,
-- so we use a DO block to only create if missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'anon_select_bookings'
  ) THEN
    EXECUTE 'CREATE POLICY anon_select_bookings ON public.bookings FOR SELECT TO anon USING (true)';
  END IF;
END
$$;

-- 3. Ensure anon can insert bookings (for online booking from /book page)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'anon_insert_bookings'
  ) THEN
    EXECUTE 'CREATE POLICY anon_insert_bookings ON public.bookings FOR INSERT TO anon WITH CHECK (true)';
  END IF;
END
$$;

-- 4. Ensure anon can read clients (for name autocomplete on /book page)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'clients' AND policyname = 'anon_select_clients'
  ) THEN
    EXECUTE 'CREATE POLICY anon_select_clients ON public.clients FOR SELECT TO anon USING (true)';
  END IF;
END
$$;

-- 5. Update app_config statuses if stored in DB
-- (Config is stored as JSONB in app_config table. The default config in code is the primary source,
-- but if admin has customized config, this updates the stored statuses.)
UPDATE public.app_config
SET data = jsonb_set(
  data,
  '{statuses}',
  '[
    {"id": "scheduled", "label": "Scheduled", "enabled": true},
    {"id": "checked_in", "label": "Checked In", "enabled": true},
    {"id": "assigned", "label": "Assigned", "enabled": true},
    {"id": "in_progress", "label": "In Progress", "enabled": true},
    {"id": "done", "label": "Done", "enabled": true},
    {"id": "cancelled", "label": "Cancelled", "enabled": true}
  ]'::jsonb
)
WHERE data ? 'statuses';
