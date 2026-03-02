
-- Enums for 8CPA module
CREATE TYPE public.eight_cpa_service_type AS ENUM ('MEDSCHECK', 'DIABETES_MEDSCHECK');
CREATE TYPE public.eight_cpa_service_status AS ENUM ('DRAFT', 'COMPLETED', 'INELIGIBLE', 'CANCELLED');
CREATE TYPE public.eight_cpa_prescriber_type AS ENUM ('USUAL', 'OTHER');
CREATE TYPE public.eight_cpa_consent_signer AS ENUM ('PATIENT', 'CARER');
CREATE TYPE public.eight_cpa_smoking_status AS ENUM ('NEVER', 'FORMER', 'CURRENT', 'UNKNOWN');
CREATE TYPE public.eight_cpa_alcohol_use AS ENUM ('NONE', 'LOW', 'MODERATE', 'HIGH', 'UNKNOWN');
CREATE TYPE public.eight_cpa_responsible_party AS ENUM ('PATIENT', 'PHARMACIST', 'GP', 'SPECIALIST', 'OTHER');
CREATE TYPE public.eight_cpa_follow_up_status AS ENUM ('NOT_DUE', 'DUE', 'COMPLETED', 'MISSED');
CREATE TYPE public.eight_cpa_attachment_type AS ENUM ('PDF', 'JPG', 'PNG', 'OTHER');
CREATE TYPE public.eight_cpa_attachment_category AS ENUM ('CONSENT_FORM', 'GP_REPORT', 'PATIENT_REPORT', 'HANDWRITTEN_NOTES', 'OTHER');
CREATE TYPE public.eight_cpa_claim_status AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'MANUAL_ONLY');
CREATE TYPE public.eight_cpa_communication_method AS ENUM ('PHONE', 'FAX', 'EMAIL', 'SECURE_MESSAGING', 'LETTER', 'MYHR_UPLOAD', 'OTHER');
CREATE TYPE public.eight_cpa_pharmacist_role AS ENUM ('REGISTERED_PHARMACIST', 'INTERN_UNDER_SUPERVISION');
CREATE TYPE public.eight_cpa_residential_status AS ENUM ('LIVING_AT_HOME', 'AGED_CARE', 'OTHER');

-- 1. eight_cpa_services
CREATE TABLE public.eight_cpa_services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type public.eight_cpa_service_type NOT NULL,
  status public.eight_cpa_service_status NOT NULL DEFAULT 'DRAFT',
  pharmacy_name text NOT NULL DEFAULT 'My Pharmacy',
  section_90_number text,
  pharmacy_accreditation_id text,
  service_date date NOT NULL DEFAULT CURRENT_DATE,
  service_time time NOT NULL DEFAULT LOCALTIME,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_services" ON public.eight_cpa_services FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_eight_cpa_services_updated_at
  BEFORE UPDATE ON public.eight_cpa_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. eight_cpa_patient_snapshots
CREATE TABLE public.eight_cpa_patient_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,
  address_line_1 text,
  address_line_2 text,
  suburb text,
  postcode text,
  state text,
  phone text,
  email text,
  medicare_number text,
  medicare_reference_number text,
  dva_number text,
  gender text,
  residential_status public.eight_cpa_residential_status DEFAULT 'LIVING_AT_HOME',
  is_atsi boolean DEFAULT false,
  primary_language text DEFAULT 'English',
  has_carer boolean DEFAULT false,
  carer_details text,
  my_health_record_available boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_patient_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_patient_snapshots" ON public.eight_cpa_patient_snapshots FOR ALL USING (true) WITH CHECK (true);

-- 3. eight_cpa_pharmacist_snapshots
CREATE TABLE public.eight_cpa_pharmacist_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE,
  pharmacist_name text NOT NULL,
  ahpra_registration_number text,
  role public.eight_cpa_pharmacist_role DEFAULT 'REGISTERED_PHARMACIST',
  is_responsible_pharmacist_for_service boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_pharmacist_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_pharmacist_snapshots" ON public.eight_cpa_pharmacist_snapshots FOR ALL USING (true) WITH CHECK (true);

-- 4. eight_cpa_prescribers
CREATE TABLE public.eight_cpa_prescribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE,
  prescriber_type public.eight_cpa_prescriber_type DEFAULT 'USUAL',
  prescriber_name text NOT NULL,
  provider_number text,
  practice_name text,
  practice_address text,
  phone text,
  email text,
  is_primary boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_prescribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_prescribers" ON public.eight_cpa_prescribers FOR ALL USING (true) WITH CHECK (true);

-- 5. eight_cpa_eligibility
CREATE TABLE public.eight_cpa_eligibility (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE UNIQUE,
  is_medicare_or_dva_eligible boolean DEFAULT false,
  has_received_medscheck_hmr_rmmr_last_12m boolean DEFAULT false,
  is_living_in_community_setting boolean DEFAULT true,
  notes_on_residential_status text,
  taking_5_or_more_prescription_medicines boolean DEFAULT false,
  recent_significant_medical_event boolean DEFAULT false,
  recent_significant_medical_event_details text,
  high_risk_medicine_use boolean DEFAULT false,
  high_risk_medicine_details text,
  recent_type2_diagnosis_last_12m boolean DEFAULT false,
  poorly_controlled_type2 boolean DEFAULT false,
  barriers_to_timely_access_diabetes_services jsonb DEFAULT '[]'::jsonb,
  program_eligibility_summary text,
  pharmacist_declares_eligibility_met boolean DEFAULT false,
  pharmacist_eligibility_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_eligibility ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_eligibility" ON public.eight_cpa_eligibility FOR ALL USING (true) WITH CHECK (true);

-- 6. eight_cpa_consent
CREATE TABLE public.eight_cpa_consent (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE UNIQUE,
  written_consent_obtained boolean DEFAULT false,
  consent_date date,
  consent_signed_by public.eight_cpa_consent_signer,
  consent_comments text,
  has_consent_pdf_attached boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_consent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_consent" ON public.eight_cpa_consent FOR ALL USING (true) WITH CHECK (true);

-- 7. eight_cpa_clinical_data
CREATE TABLE public.eight_cpa_clinical_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE UNIQUE,
  conditions_comorbidities jsonb DEFAULT '[]'::jsonb,
  lifestyle_smoking_status public.eight_cpa_smoking_status DEFAULT 'UNKNOWN',
  lifestyle_alcohol_use public.eight_cpa_alcohol_use DEFAULT 'UNKNOWN',
  lifestyle_diet_notes text,
  lifestyle_activity_notes text,
  clinical_bp_systolic integer,
  clinical_bp_diastolic integer,
  clinical_bp_date date,
  clinical_weight numeric,
  clinical_height numeric,
  clinical_bmi numeric,
  clinical_pulse integer,
  diabetes_bgl_readings_summary text,
  diabetes_hba1c_value numeric,
  diabetes_hba1c_date date,
  monitoring_device_used text,
  allergies_adverse_reactions jsonb DEFAULT '[]'::jsonb,
  underlying_medical_conditions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_clinical_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_clinical_data" ON public.eight_cpa_clinical_data FOR ALL USING (true) WITH CHECK (true);

-- 8. eight_cpa_medication_items
CREATE TABLE public.eight_cpa_medication_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE,
  brand_name text,
  generic_name text,
  form text,
  strength text,
  dose_and_regimen text,
  indication text,
  special_instructions text,
  start_date date,
  prescriber_name text,
  is_prescription boolean DEFAULT true,
  is_non_prescription boolean DEFAULT false,
  is_complementary boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_medication_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_medication_items" ON public.eight_cpa_medication_items FOR ALL USING (true) WITH CHECK (true);

-- 9. eight_cpa_action_plan_items
CREATE TABLE public.eight_cpa_action_plan_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE,
  issue_description text NOT NULL,
  outcome text,
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  responsible_party public.eight_cpa_responsible_party DEFAULT 'PHARMACIST',
  goal_text text,
  order_index integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_action_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_action_plan_items" ON public.eight_cpa_action_plan_items FOR ALL USING (true) WITH CHECK (true);

-- 10. eight_cpa_communication_logs
CREATE TABLE public.eight_cpa_communication_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE,
  communication_date date NOT NULL DEFAULT CURRENT_DATE,
  to_whom text NOT NULL,
  to_role text,
  method public.eight_cpa_communication_method DEFAULT 'PHONE',
  summary text,
  documents_shared text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_communication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_communication_logs" ON public.eight_cpa_communication_logs FOR ALL USING (true) WITH CHECK (true);

-- 11. eight_cpa_follow_ups
CREATE TABLE public.eight_cpa_follow_ups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE,
  follow_up_date date,
  follow_up_status public.eight_cpa_follow_up_status DEFAULT 'NOT_DUE',
  follow_up_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_follow_ups" ON public.eight_cpa_follow_ups FOR ALL USING (true) WITH CHECK (true);

-- 12. eight_cpa_attachments
CREATE TABLE public.eight_cpa_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type public.eight_cpa_attachment_type DEFAULT 'OTHER',
  category public.eight_cpa_attachment_category DEFAULT 'OTHER',
  uploaded_by_user_id uuid,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  filesize integer DEFAULT 0,
  storage_path text NOT NULL,
  notes text,
  is_deleted boolean DEFAULT false
);
ALTER TABLE public.eight_cpa_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_attachments" ON public.eight_cpa_attachments FOR ALL USING (true) WITH CHECK (true);

-- 13. eight_cpa_claim_tracking
CREATE TABLE public.eight_cpa_claim_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.eight_cpa_services(id) ON DELETE CASCADE UNIQUE,
  ppa_claim_required boolean DEFAULT true,
  ppa_claim_status public.eight_cpa_claim_status DEFAULT 'NOT_SUBMITTED',
  ppa_submission_date date,
  ppa_rejection_reason text,
  fee_amount numeric DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eight_cpa_claim_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to eight_cpa_claim_tracking" ON public.eight_cpa_claim_tracking FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for 8CPA attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('eight-cpa-attachments', 'eight-cpa-attachments', false);

CREATE POLICY "Authenticated users can upload 8CPA attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'eight-cpa-attachments');

CREATE POLICY "Authenticated users can read 8CPA attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'eight-cpa-attachments');

CREATE POLICY "Authenticated users can delete 8CPA attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'eight-cpa-attachments');
