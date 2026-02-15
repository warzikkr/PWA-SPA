-- ============================================================
-- Supabase schema for Spa Salon PWA
-- Run this in Supabase SQL Editor to create all tables + RLS
-- ============================================================

-- Helper: get current user's app role
CREATE OR REPLACE FUNCTION public.user_role() RETURNS text AS $$
  SELECT role FROM public.users WHERE auth_uid = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's therapist_id
CREATE OR REPLACE FUNCTION public.user_therapist_id() RETURNS text AS $$
  SELECT therapist_id FROM public.users WHERE auth_uid = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE public.users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid      uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name     text NOT NULL,
  username      text UNIQUE NOT NULL,
  role          text NOT NULL CHECK (role IN ('admin', 'reception', 'therapist')),
  therapist_id  text,
  enabled       boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY users_admin ON public.users
  FOR ALL USING (public.user_role() = 'admin');

-- Authenticated users can read their own row
CREATE POLICY users_self_read ON public.users
  FOR SELECT USING (auth_uid = auth.uid());

-- Reception can read all users (to see therapist names)
CREATE POLICY users_reception_read ON public.users
  FOR SELECT USING (public.user_role() = 'reception');

-- Therapist can read all users (to see names)
CREATE POLICY users_therapist_read ON public.users
  FOR SELECT USING (public.user_role() = 'therapist');

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE public.clients (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name          text NOT NULL,
  email              text NOT NULL DEFAULT '',
  contact_method     text NOT NULL DEFAULT '',
  contact_value      text NOT NULL DEFAULT '',
  marketing_source   text NOT NULL DEFAULT '',
  consent_promotions boolean NOT NULL DEFAULT false,
  consent_privacy    boolean NOT NULL DEFAULT false,
  gender             text,
  tags               jsonb NOT NULL DEFAULT '[]',
  notes              text,
  preferences        jsonb,
  visit_history      jsonb DEFAULT '[]',
  audit_log          jsonb DEFAULT '[]',
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY clients_admin ON public.clients
  FOR ALL USING (public.user_role() = 'admin');

-- Reception: read + insert + update
CREATE POLICY clients_reception_read ON public.clients
  FOR SELECT USING (public.user_role() = 'reception');
CREATE POLICY clients_reception_insert ON public.clients
  FOR INSERT WITH CHECK (public.user_role() = 'reception');
CREATE POLICY clients_reception_update ON public.clients
  FOR UPDATE USING (public.user_role() = 'reception');

-- Therapist: read only (app layer strips contact info via TherapistClientView)
CREATE POLICY clients_therapist_read ON public.clients
  FOR SELECT USING (public.user_role() = 'therapist');

-- Anon (kiosk): insert only
CREATE POLICY clients_anon_insert ON public.clients
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- Anon (kiosk): select own row by id for findOrCreate flow
CREATE POLICY clients_anon_select ON public.clients
  FOR SELECT USING (auth.role() = 'anon');

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE public.bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  therapist_id    text,
  room_id         text,
  intake_id       uuid,
  status          text NOT NULL DEFAULT 'pending',
  date            text NOT NULL,
  start_time      text,
  end_time        text,
  payment_status  text DEFAULT 'unpaid',
  payment_type    text,
  internal_note   text,
  source          text NOT NULL DEFAULT 'booking',
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY bookings_admin ON public.bookings
  FOR ALL USING (public.user_role() = 'admin');

-- Reception: full access
CREATE POLICY bookings_reception ON public.bookings
  FOR ALL USING (public.user_role() = 'reception');

-- Therapist: read bookings assigned to them
CREATE POLICY bookings_therapist_read ON public.bookings
  FOR SELECT USING (
    public.user_role() = 'therapist'
    AND therapist_id = public.user_therapist_id()
  );

-- Anon (kiosk): insert + read own bookings
CREATE POLICY bookings_anon_insert ON public.bookings
  FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY bookings_anon_select ON public.bookings
  FOR SELECT USING (auth.role() = 'anon');
-- Anon (kiosk): update own bookings (for back-linking intake_id)
CREATE POLICY bookings_anon_update ON public.bookings
  FOR UPDATE USING (auth.role() = 'anon');

-- ============================================================
-- INTAKES
-- ============================================================
CREATE TABLE public.intakes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  booking_id    uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  data          jsonb NOT NULL DEFAULT '{}',
  signature     text,
  completed_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.intakes ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY intakes_admin ON public.intakes
  FOR ALL USING (public.user_role() = 'admin');

-- Reception: read
CREATE POLICY intakes_reception_read ON public.intakes
  FOR SELECT USING (public.user_role() = 'reception');

-- Therapist: read intakes for their bookings
CREATE POLICY intakes_therapist_read ON public.intakes
  FOR SELECT USING (
    public.user_role() = 'therapist'
    AND booking_id IN (
      SELECT id FROM public.bookings
      WHERE therapist_id = public.user_therapist_id()
    )
  );

-- Anon (kiosk): insert
CREATE POLICY intakes_anon_insert ON public.intakes
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- ============================================================
-- THERAPIST NOTES
-- ============================================================
CREATE TABLE public.therapist_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  therapist_id    text NOT NULL,
  therapist_name  text,
  text            text NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.therapist_notes ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY notes_admin ON public.therapist_notes
  FOR ALL USING (public.user_role() = 'admin');

-- Reception: read
CREATE POLICY notes_reception_read ON public.therapist_notes
  FOR SELECT USING (public.user_role() = 'reception');

-- Therapist: CRUD own notes
CREATE POLICY notes_therapist ON public.therapist_notes
  FOR ALL USING (
    public.user_role() = 'therapist'
    AND therapist_id = public.user_therapist_id()
  );

-- ============================================================
-- CHANGE REQUESTS
-- ============================================================
CREATE TABLE public.change_requests (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name           text NOT NULL,
  requested_by_user_id  text NOT NULL,
  requested_by_name     text NOT NULL,
  type                  text NOT NULL CHECK (type IN ('delete', 'critical_update')),
  description           text NOT NULL DEFAULT '',
  payload               jsonb NOT NULL DEFAULT '{}',
  status                text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by_user_id   text,
  reviewed_by_name      text,
  reviewed_at           timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY cr_admin ON public.change_requests
  FOR ALL USING (public.user_role() = 'admin');

-- Reception: read + create
CREATE POLICY cr_reception_read ON public.change_requests
  FOR SELECT USING (public.user_role() = 'reception');
CREATE POLICY cr_reception_insert ON public.change_requests
  FOR INSERT WITH CHECK (public.user_role() = 'reception');

-- ============================================================
-- APP CONFIG (single-row)
-- ============================================================
CREATE TABLE public.app_config (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config  jsonb NOT NULL DEFAULT '{}'
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY config_admin ON public.app_config
  FOR ALL USING (public.user_role() = 'admin');

-- All authenticated users can read config
CREATE POLICY config_read ON public.app_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- Anon can read config (kiosk needs intake schema)
CREATE POLICY config_anon_read ON public.app_config
  FOR SELECT USING (auth.role() = 'anon');

-- ============================================================
-- Enable Realtime on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.therapist_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.intakes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.change_requests;

-- ============================================================
-- Seed: insert default config row (empty — app uses defaultConfig fallback)
-- ============================================================
INSERT INTO public.app_config (id, config) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '{}'
);
