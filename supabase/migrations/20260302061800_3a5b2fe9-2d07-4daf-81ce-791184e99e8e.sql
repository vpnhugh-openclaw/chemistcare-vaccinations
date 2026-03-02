
-- Add PPA-specific columns to claim_programs
ALTER TABLE public.claim_programs
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Other',
  ADD COLUMN IF NOT EXISTS is_api_supported boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ppa_program_code text,
  ADD COLUMN IF NOT EXISTS program_rules_url text;

-- Create PPA integration settings table (per-pharmacy config)
CREATE TABLE public.ppa_integration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_name text NOT NULL DEFAULT 'My Pharmacy',
  ppa_service_provider_id text,
  ppa_user_id text,
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  is_connected boolean NOT NULL DEFAULT false,
  last_connection_test_at timestamptz,
  last_connection_status text,
  registered_programs jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ppa_integration_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ppa_integration_settings"
  ON public.ppa_integration_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage ppa_integration_settings"
  ON public.ppa_integration_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create integration audit log
CREATE TABLE public.integration_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_source text NOT NULL DEFAULT 'ppa',
  program_code text,
  claim_case_id uuid,
  request_summary text,
  response_status integer,
  response_summary text,
  error_message text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.integration_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read integration_audit_log"
  ON public.integration_audit_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert integration_audit_log"
  ON public.integration_audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Add PPA claim response fields to claim_cases
ALTER TABLE public.claim_cases
  ADD COLUMN IF NOT EXISTS ppa_claim_id text,
  ADD COLUMN IF NOT EXISTS ppa_response jsonb,
  ADD COLUMN IF NOT EXISTS ppa_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS submission_confirmed_by text;

-- Trigger for ppa_integration_settings updated_at
CREATE TRIGGER update_ppa_integration_settings_updated_at
  BEFORE UPDATE ON public.ppa_integration_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
