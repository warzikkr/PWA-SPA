-- ============================================================
-- STEP 1: Create all tables (no RLS yet)
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

CREATE TABLE public.intakes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  booking_id    uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  data          jsonb NOT NULL DEFAULT '{}',
  signature     text,
  completed_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.therapist_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  therapist_id    text NOT NULL,
  therapist_name  text,
  text            text NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now()
);

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

CREATE TABLE public.app_config (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config  jsonb NOT NULL DEFAULT '{}'
);

-- Seed default config row
INSERT INTO public.app_config (id, config) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '{}'
);

-- ============================================================
-- STEP 2: Helper functions (tables exist now)
-- ============================================================

CREATE OR REPLACE FUNCTION public.user_role() RETURNS text AS $$
  SELECT role FROM public.users WHERE auth_uid = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_therapist_id() RETURNS text AS $$
  SELECT therapist_id FROM public.users WHERE auth_uid = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- STEP 3: Enable RLS on all tables
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 4: RLS Policies
-- ============================================================

-- ── USERS ──
CREATE POLICY users_admin ON public.users
  FOR ALL USING (public.user_role() = 'admin');
CREATE POLICY users_self_read ON public.users
  FOR SELECT USING (auth_uid = auth.uid());
CREATE POLICY users_reception_read ON public.users
  FOR SELECT USING (public.user_role() = 'reception');
CREATE POLICY users_therapist_read ON public.users
  FOR SELECT USING (public.user_role() = 'therapist');

-- ── CLIENTS ──
CREATE POLICY clients_admin ON public.clients
  FOR ALL USING (public.user_role() = 'admin');
CREATE POLICY clients_reception_read ON public.clients
  FOR SELECT USING (public.user_role() = 'reception');
CREATE POLICY clients_reception_insert ON public.clients
  FOR INSERT WITH CHECK (public.user_role() = 'reception');
CREATE POLICY clients_reception_update ON public.clients
  FOR UPDATE USING (public.user_role() = 'reception');
CREATE POLICY clients_therapist_read ON public.clients
  FOR SELECT USING (public.user_role() = 'therapist');
CREATE POLICY clients_anon_insert ON public.clients
  FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY clients_anon_select ON public.clients
  FOR SELECT USING (auth.role() = 'anon');

-- ── BOOKINGS ──
CREATE POLICY bookings_admin ON public.bookings
  FOR ALL USING (public.user_role() = 'admin');
CREATE POLICY bookings_reception ON public.bookings
  FOR ALL USING (public.user_role() = 'reception');
CREATE POLICY bookings_therapist_read ON public.bookings
  FOR SELECT USING (
    public.user_role() = 'therapist'
    AND therapist_id = public.user_therapist_id()
  );
CREATE POLICY bookings_anon_insert ON public.bookings
  FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY bookings_anon_select ON public.bookings
  FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY bookings_anon_update ON public.bookings
  FOR UPDATE USING (auth.role() = 'anon');

-- ── INTAKES ──
CREATE POLICY intakes_admin ON public.intakes
  FOR ALL USING (public.user_role() = 'admin');
CREATE POLICY intakes_reception_read ON public.intakes
  FOR SELECT USING (public.user_role() = 'reception');
CREATE POLICY intakes_therapist_read ON public.intakes
  FOR SELECT USING (
    public.user_role() = 'therapist'
    AND booking_id IN (
      SELECT id FROM public.bookings
      WHERE therapist_id = public.user_therapist_id()
    )
  );
CREATE POLICY intakes_anon_insert ON public.intakes
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- ── THERAPIST NOTES ──
CREATE POLICY notes_admin ON public.therapist_notes
  FOR ALL USING (public.user_role() = 'admin');
CREATE POLICY notes_reception_read ON public.therapist_notes
  FOR SELECT USING (public.user_role() = 'reception');
CREATE POLICY notes_therapist ON public.therapist_notes
  FOR ALL USING (
    public.user_role() = 'therapist'
    AND therapist_id = public.user_therapist_id()
  );

-- ── CHANGE REQUESTS ──
CREATE POLICY cr_admin ON public.change_requests
  FOR ALL USING (public.user_role() = 'admin');
CREATE POLICY cr_reception_read ON public.change_requests
  FOR SELECT USING (public.user_role() = 'reception');
CREATE POLICY cr_reception_insert ON public.change_requests
  FOR INSERT WITH CHECK (public.user_role() = 'reception');

-- ── APP CONFIG ──
CREATE POLICY config_admin ON public.app_config
  FOR ALL USING (public.user_role() = 'admin');
CREATE POLICY config_read ON public.app_config
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY config_anon_read ON public.app_config
  FOR SELECT USING (auth.role() = 'anon');

-- ============================================================
-- STEP 5: Enable Realtime
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.therapist_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.intakes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.change_requests;
