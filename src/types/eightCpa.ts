// 8CPA Module Types

export type EightCpaServiceType = 'MEDSCHECK' | 'DIABETES_MEDSCHECK';
export type EightCpaServiceStatus = 'DRAFT' | 'COMPLETED' | 'INELIGIBLE' | 'CANCELLED';
export type PrescriberType = 'USUAL' | 'OTHER';
export type ConsentSigner = 'PATIENT' | 'CARER';
export type SmokingStatus = 'NEVER' | 'FORMER' | 'CURRENT' | 'UNKNOWN';
export type AlcoholUse = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'UNKNOWN';
export type ResponsibleParty = 'PATIENT' | 'PHARMACIST' | 'GP' | 'SPECIALIST' | 'OTHER';
export type FollowUpStatus = 'NOT_DUE' | 'DUE' | 'COMPLETED' | 'MISSED';
export type AttachmentType = 'PDF' | 'JPG' | 'PNG' | 'OTHER';
export type AttachmentCategory = 'CONSENT_FORM' | 'GP_REPORT' | 'PATIENT_REPORT' | 'HANDWRITTEN_NOTES' | 'OTHER';
export type ClaimStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'MANUAL_ONLY';
export type CommunicationMethod = 'PHONE' | 'FAX' | 'EMAIL' | 'SECURE_MESSAGING' | 'LETTER' | 'MYHR_UPLOAD' | 'OTHER';
export type PharmacistRole = 'REGISTERED_PHARMACIST' | 'INTERN_UNDER_SUPERVISION';
export type ResidentialStatus = 'LIVING_AT_HOME' | 'AGED_CARE' | 'OTHER';

export interface EightCpaService {
  id: string;
  service_type: EightCpaServiceType;
  status: EightCpaServiceStatus;
  pharmacy_name: string;
  section_90_number: string | null;
  pharmacy_accreditation_id: string | null;
  service_date: string;
  service_time: string;
  created_at: string;
  updated_at: string;
}

export interface EightCpaPatientSnapshot {
  id: string;
  service_id: string;
  full_name: string;
  date_of_birth: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  suburb: string | null;
  postcode: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  medicare_number: string | null;
  medicare_reference_number: string | null;
  dva_number: string | null;
  gender: string | null;
  residential_status: ResidentialStatus;
  is_atsi: boolean;
  primary_language: string;
  has_carer: boolean;
  carer_details: string | null;
  my_health_record_available: boolean;
}

export interface EightCpaEligibility {
  id: string;
  service_id: string;
  is_medicare_or_dva_eligible: boolean;
  has_received_medscheck_hmr_rmmr_last_12m: boolean;
  is_living_in_community_setting: boolean;
  notes_on_residential_status: string | null;
  taking_5_or_more_prescription_medicines: boolean;
  recent_significant_medical_event: boolean;
  recent_significant_medical_event_details: string | null;
  high_risk_medicine_use: boolean;
  high_risk_medicine_details: string | null;
  recent_type2_diagnosis_last_12m: boolean;
  poorly_controlled_type2: boolean;
  barriers_to_timely_access_diabetes_services: string[];
  program_eligibility_summary: string | null;
  pharmacist_declares_eligibility_met: boolean;
  pharmacist_eligibility_notes: string | null;
}

export interface EightCpaMedicationItem {
  id: string;
  service_id: string;
  brand_name: string | null;
  generic_name: string | null;
  form: string | null;
  strength: string | null;
  dose_and_regimen: string | null;
  indication: string | null;
  special_instructions: string | null;
  start_date: string | null;
  prescriber_name: string | null;
  is_prescription: boolean;
  is_non_prescription: boolean;
  is_complementary: boolean;
  order_index: number;
}

export interface EightCpaActionPlanItem {
  id: string;
  service_id: string;
  issue_description: string;
  outcome: string | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  responsible_party: ResponsibleParty;
  goal_text: string | null;
  order_index: number;
}

export interface EightCpaAttachment {
  id: string;
  service_id: string;
  file_name: string;
  file_type: AttachmentType;
  category: AttachmentCategory;
  uploaded_at: string;
  filesize: number;
  storage_path: string;
  notes: string | null;
  is_deleted: boolean;
}

export const SERVICE_TYPE_LABELS: Record<EightCpaServiceType, string> = {
  MEDSCHECK: 'MedsCheck',
  DIABETES_MEDSCHECK: 'Diabetes MedsCheck',
};

export const SERVICE_STATUS_LABELS: Record<EightCpaServiceStatus, string> = {
  DRAFT: 'Draft',
  COMPLETED: 'Completed',
  INELIGIBLE: 'Ineligible',
  CANCELLED: 'Cancelled',
};

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  NOT_SUBMITTED: 'Not Submitted',
  SUBMITTED: 'Submitted',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  MANUAL_ONLY: 'Manual Only',
};

export const MEDSCHECK_FEE = 100.00;
export const DIABETES_MEDSCHECK_FEE = 150.00;
