
-- Consultation records table
CREATE TABLE public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'submitting', 'finalised', 'discarded')),
  patient_first_name text,
  patient_last_name text,
  patient_dob date,
  patient_sex text,
  patient_pregnancy_status text,
  patient_allergies text,
  patient_medications text,
  patient_comorbidities text,
  gp_name text,
  gp_clinic text,
  gp_phone text,
  condition_id text,
  condition_name text,
  red_flags_checked jsonb DEFAULT '{}',
  red_flag_triggered boolean DEFAULT false,
  referral_notes text,
  assessment_data jsonb DEFAULT '{}',
  working_diagnosis text,
  differentials jsonb DEFAULT '[]',
  scope_validation_passed boolean DEFAULT false,
  selected_therapy_id text,
  deviation_justification text,
  follow_up_plan text,
  safety_net_advice text,
  clinical_notes text,
  pinned_evidence jsonb DEFAULT '[]',
  full_note_text text,
  gp_letter_text text,
  patient_summary_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  finalised_at timestamptz,
  created_by uuid REFERENCES auth.users(id)
);

-- Consultation audit events
CREATE TABLE public.consult_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consult_id uuid REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  step text,
  validation_result jsonb,
  error_reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consult_audit_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for consultations
CREATE POLICY "Users can manage own consultations" ON public.consultations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users can read consultations" ON public.consultations FOR SELECT USING (true);

-- RLS policies for audit events
CREATE POLICY "Users can insert audit events" ON public.consult_audit_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read audit events" ON public.consult_audit_events FOR SELECT USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
