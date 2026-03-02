
-- Performance indexes for high-frequency queries
-- Consultation/encounter timeline
CREATE INDEX IF NOT EXISTS idx_eight_cpa_services_date ON public.eight_cpa_services (service_date DESC);
CREATE INDEX IF NOT EXISTS idx_eight_cpa_services_status ON public.eight_cpa_services (status);
CREATE INDEX IF NOT EXISTS idx_eight_cpa_services_type_date ON public.eight_cpa_services (service_type, service_date DESC);

-- Patient search indexes
CREATE INDEX IF NOT EXISTS idx_eight_cpa_patient_snapshots_name ON public.eight_cpa_patient_snapshots USING gin (to_tsvector('english', full_name));
CREATE INDEX IF NOT EXISTS idx_eight_cpa_patient_snapshots_medicare ON public.eight_cpa_patient_snapshots (medicare_number);
CREATE INDEX IF NOT EXISTS idx_eight_cpa_patient_snapshots_dob ON public.eight_cpa_patient_snapshots (date_of_birth);
CREATE INDEX IF NOT EXISTS idx_eight_cpa_patient_snapshots_service ON public.eight_cpa_patient_snapshots (service_id);

-- Audit filtering
CREATE INDEX IF NOT EXISTS idx_integration_audit_log_created ON public.integration_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_audit_log_type ON public.integration_audit_log (event_type);

-- Claims high-frequency
CREATE INDEX IF NOT EXISTS idx_claim_cases_status ON public.claim_cases (status);
CREATE INDEX IF NOT EXISTS idx_claim_cases_date ON public.claim_cases (consult_date DESC);
CREATE INDEX IF NOT EXISTS idx_claim_cases_program ON public.claim_cases (claim_program_id);

-- 8CPA related tables
CREATE INDEX IF NOT EXISTS idx_eight_cpa_medication_items_service ON public.eight_cpa_medication_items (service_id);
CREATE INDEX IF NOT EXISTS idx_eight_cpa_action_plan_items_service ON public.eight_cpa_action_plan_items (service_id);
CREATE INDEX IF NOT EXISTS idx_eight_cpa_attachments_service ON public.eight_cpa_attachments (service_id);
CREATE INDEX IF NOT EXISTS idx_eight_cpa_eligibility_service ON public.eight_cpa_eligibility (service_id);
