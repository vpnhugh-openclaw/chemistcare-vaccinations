
-- Enum types for claims system
CREATE TYPE public.episode_type AS ENUM ('INITIAL', 'RESUPPLY', 'FOLLOW_UP');
CREATE TYPE public.rule_severity AS ENUM ('HARD_FAIL', 'WARN');
CREATE TYPE public.claim_case_status AS ENUM ('NOT_ELIGIBLE', 'ELIGIBLE_PENDING_REVIEW', 'READY_FOR_CLAIM', 'CLAIMED', 'REJECTED');
CREATE TYPE public.rule_result AS ENUM ('PASS', 'FAIL', 'WARN', 'NOT_APPLICABLE');
CREATE TYPE public.batch_status AS ENUM ('DRAFT', 'FINALIZED', 'EXPORTED');

-- 1. claim_program
CREATE TABLE public.claim_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'VIC',
  funding_body TEXT NOT NULL,
  standard_fee_ex_gst DECIMAL(10,2) NOT NULL DEFAULT 20.00,
  gst_rate DECIMAL(5,4) NOT NULL DEFAULT 0.1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. condition_claim_program (maps conditions to programs)
CREATE TABLE public.condition_claim_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_code TEXT NOT NULL,
  condition_name TEXT NOT NULL,
  claim_program_id UUID NOT NULL REFERENCES public.claim_programs(id) ON DELETE CASCADE,
  episode_type public.episode_type NOT NULL DEFAULT 'INITIAL',
  is_default_mapping BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. claim_rule_set (versioned rule sets per program)
CREATE TABLE public.claim_rule_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_program_id UUID NOT NULL REFERENCES public.claim_programs(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. claim_rule (individual rules)
CREATE TABLE public.claim_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_set_id UUID NOT NULL REFERENCES public.claim_rule_sets(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  severity public.rule_severity NOT NULL DEFAULT 'HARD_FAIL',
  expression JSONB NOT NULL DEFAULT '{}',
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. claim_case (one per billable encounter)
CREATE TABLE public.claim_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_reference TEXT NOT NULL,
  patient_initials TEXT,
  patient_age INT,
  patient_sex TEXT,
  condition_name TEXT NOT NULL,
  consult_date DATE NOT NULL DEFAULT CURRENT_DATE,
  claim_program_id UUID NOT NULL REFERENCES public.claim_programs(id),
  rule_set_id UUID REFERENCES public.claim_rule_sets(id),
  status public.claim_case_status NOT NULL DEFAULT 'NOT_ELIGIBLE',
  eligibility_score INT,
  hard_fail_count INT NOT NULL DEFAULT 0,
  warn_count INT NOT NULL DEFAULT 0,
  fee_ex_gst DECIMAL(10,2) NOT NULL DEFAULT 0,
  gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  claim_period_start DATE,
  claim_period_end DATE,
  claimed_at TIMESTAMPTZ,
  protocol_completed BOOLEAN NOT NULL DEFAULT false,
  red_flags_negative BOOLEAN NOT NULL DEFAULT true,
  within_age_range BOOLEAN NOT NULL DEFAULT true,
  within_onset_window BOOLEAN,
  override_justification TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. claim_case_rule_results (audit trail)
CREATE TABLE public.claim_case_rule_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_case_id UUID NOT NULL REFERENCES public.claim_cases(id) ON DELETE CASCADE,
  claim_rule_id UUID NOT NULL REFERENCES public.claim_rules(id),
  result public.rule_result NOT NULL DEFAULT 'NOT_APPLICABLE',
  details TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. claim_batches
CREATE TABLE public.claim_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_name TEXT NOT NULL DEFAULT 'My Pharmacy',
  pharmacy_address TEXT,
  pharmacy_abn TEXT,
  claim_program_id UUID NOT NULL REFERENCES public.claim_programs(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status public.batch_status NOT NULL DEFAULT 'DRAFT',
  total_cases INT NOT NULL DEFAULT 0,
  total_amount_ex_gst DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_gst DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  generated_by TEXT,
  exported_pdf_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalized_at TIMESTAMPTZ
);

-- 8. claim_batch_case_links
CREATE TABLE public.claim_batch_case_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.claim_batches(id) ON DELETE CASCADE,
  claim_case_id UUID NOT NULL REFERENCES public.claim_cases(id),
  order_index INT NOT NULL DEFAULT 0,
  UNIQUE(batch_id, claim_case_id)
);

-- Enable RLS on all tables
ALTER TABLE public.claim_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condition_claim_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_rule_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_case_rule_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_batch_case_links ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow authenticated users full access (single-pharmacy system for now)
CREATE POLICY "Authenticated users can read claim_programs" ON public.claim_programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage claim_programs" ON public.claim_programs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read condition_claim_programs" ON public.condition_claim_programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage condition_claim_programs" ON public.condition_claim_programs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read claim_rule_sets" ON public.claim_rule_sets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage claim_rule_sets" ON public.claim_rule_sets FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read claim_rules" ON public.claim_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage claim_rules" ON public.claim_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read claim_cases" ON public.claim_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage claim_cases" ON public.claim_cases FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read claim_case_rule_results" ON public.claim_case_rule_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage claim_case_rule_results" ON public.claim_case_rule_results FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read claim_batches" ON public.claim_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage claim_batches" ON public.claim_batches FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read claim_batch_case_links" ON public.claim_batch_case_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage claim_batch_case_links" ON public.claim_batch_case_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_claim_programs_updated_at BEFORE UPDATE ON public.claim_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_claim_cases_updated_at BEFORE UPDATE ON public.claim_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_claim_cases_program ON public.claim_cases(claim_program_id);
CREATE INDEX idx_claim_cases_status ON public.claim_cases(status);
CREATE INDEX idx_claim_cases_consult_date ON public.claim_cases(consult_date);
CREATE INDEX idx_claim_batches_program ON public.claim_batches(claim_program_id);
CREATE INDEX idx_claim_batch_case_links_batch ON public.claim_batch_case_links(batch_id);
