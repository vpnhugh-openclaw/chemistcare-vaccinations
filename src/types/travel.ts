// ═══════════════════════════════════════════════
// Travel Medicine Module – Type Definitions
// ═══════════════════════════════════════════════

export type TravelStep =
  | 'patient-form'
  | 'risk-assessment'
  | 'vaccination'
  | 'prescribing'
  | 'medical-kit'
  | 'documentation'
  | 'follow-up';

export const TRAVEL_STEPS: { key: TravelStep; label: string; description: string }[] = [
  { key: 'patient-form', label: 'Patient Form', description: 'Personal, travel & health details' },
  { key: 'risk-assessment', label: 'Risk Assessment', description: 'This Person / This Trip / This Time' },
  { key: 'vaccination', label: 'Vaccinations', description: '3Rs organiser & scheduling' },
  { key: 'prescribing', label: 'Prescribing', description: 'Malaria, altitude, TD, VTE' },
  { key: 'medical-kit', label: 'Medical Kit', description: 'Personalised kit builder' },
  { key: 'documentation', label: 'Documentation', description: 'Consultation record & letters' },
  { key: 'follow-up', label: 'Follow-up', description: 'Recall & post-travel' },
];

// ── Itinerary ──

export interface ItineraryLeg {
  id: string;
  destination: string;
  region: string;
  departureDate: string;
  returnDate: string;
  accommodation: 'hotel' | 'hostel' | 'homestay' | 'camping' | 'other';
  purpose: 'holiday' | 'vfr' | 'business' | 'volunteering' | 'medical_tourism' | 'aid_work' | 'other';
  ruralTravel: boolean;
  remoteTravel: boolean;
}

export interface TravelCompanion {
  name: string;
  age: number;
}

// ── Health history ──

export const MEDICAL_CONDITIONS = [
  'diabetes', 'asthma', 'cardiac_disease', 'renal_disease', 'neurological',
  'haematological', 'immunocompromise', 'splenectomy_asplenia', 'active_cancer',
  'vte_dvt_history', 'thrombophilia', 'recent_surgery', 'mental_illness',
  'colostomy_ileostomy', 'raynauds', 'ophthalmic', 'obesity',
] as const;
export type MedicalCondition = typeof MEDICAL_CONDITIONS[number];

// ── Vaccination history ──

export const VACCINE_LIST = [
  'BCG', 'Cholera', 'Hep A', 'Hep B', 'Influenza', 'Japanese Encephalitis',
  'MMR', 'Meningococcal ACWY', 'Pneumococcal', 'Polio', 'Rabies',
  'Tetanus/dTpa', 'Typhoid', 'Varicella', 'Yellow Fever', 'COVID-19',
  'Zoster/Shingles', 'RSV', 'HPV', 'Mpox',
] as const;

export interface VaccineHistoryEntry {
  vaccine: string;
  yearReceived: string;
  adverseReaction: string;
}

// ── Patient pre-consultation form ──

export interface TravelPatientForm {
  // Personal
  fullName: string;
  dob: string;
  gender: string;
  occupation: string;
  countryOfBirth: string;
  phone: string;
  email: string;

  // Travel
  itinerary: ItineraryLeg[];
  companions: TravelCompanion[];

  // Health
  childhoodVaccinesComplete: boolean | null;
  currentMedications: string;
  allergies: string;
  eggAllergy: boolean;
  medicalConditions: MedicalCondition[];
  bmi: string;
  pregnancyCurrent: boolean;
  pregnancyPlanned: boolean;
  breastfeeding: boolean;
  previousOverseasTravel: boolean;
  priorMalariaProphylaxis: string;
  faintingHistory: boolean;

  // Vaccination history
  vaccineHistory: VaccineHistoryEntry[];
  airConsentGranted: boolean;
}

// ── Risk flags ──

export type RiskLevel = 'red' | 'amber' | 'green';

export interface TravelRiskFlag {
  id: string;
  level: RiskLevel;
  title: string;
  message: string;
  action?: string;
  blocksConsultation?: boolean;
}

// ── Vaccine planning ──

export type VaccineCategory = 'routine' | 'recommended' | 'required';

export interface PlannedVaccine {
  name: string;
  category: VaccineCategory;
  brand?: string;
  dose?: string;
  scheduledDate?: string;
  isLive: boolean;
  outsideScope: boolean;
  contraindicated: boolean;
  contraindicationReason?: string;
  notes?: string;
}

// ── Prescribing sub-modules ──

export type PrescribingModule = 'malaria' | 'altitude' | 'travellers-diarrhoea' | 'vte';

export interface MalariaChemoprophylaxis {
  drug: string;
  dose: string;
  startBefore: string;
  continueAfter: string;
  keyNotes: string;
}

export const MALARIA_DRUGS: MalariaChemoprophylaxis[] = [
  { drug: 'Atovaquone-proguanil (Malarone)', dose: '250/100mg daily', startBefore: '1–2 days', continueAfter: '7 days', keyNotes: 'Best for last-minute travel, shortest post-travel course, take with food' },
  { drug: 'Doxycycline 100mg', dose: '100mg daily', startBefore: '1–2 days', continueAfter: '28 days', keyNotes: 'Avoid with isotretinoin, photosensitivity risk' },
  { drug: 'Mefloquine 250mg', dose: '250mg weekly', startBefore: '1–3 weeks', continueAfter: '28 days', keyNotes: 'Avoid in Greater Mekong (resistance); avoid if psychiatric history' },
  { drug: 'Tafenoquine', dose: 'Loading 3 days pre-travel', startBefore: '3 days', continueAfter: '7 days', keyNotes: 'Requires quantitative G6PD testing before prescribing' },
];

export interface AltitudeDrug {
  drug: string;
  dose: string;
  notes: string;
}

export const ALTITUDE_DRUGS: AltitudeDrug[] = [
  { drug: 'Acetazolamide', dose: '250mg BD', notes: 'First-line; paraesthesia, polyuria, metallic taste; sulfa allergy contraindication' },
  { drug: 'Dexamethasone', dose: '4mg Q6H', notes: 'If acetazolamide contraindicated' },
];

export interface TDAntibiotic {
  drug: string;
  dose: string;
  notes: string;
}

export const TD_ANTIBIOTICS: TDAntibiotic[] = [
  { drug: 'Azithromycin', dose: '1g single dose (or 500mg daily ×3 days)', notes: 'Preferred — especially SE/South Asia, pregnant women' },
  { drug: 'Norfloxacin', dose: '800mg single dose', notes: 'Increasing quinolone resistance — avoid SE/South Asia' },
  { drug: 'Ciprofloxacin', dose: '750mg single dose', notes: 'Avoid SE/South Asia due to quinolone resistance' },
];

// ── Medical kit ──

export interface MedicalKitSection {
  title: string;
  items: string[];
}

// ── Documentation ──

export interface TravelConsultationRecord {
  patientForm: TravelPatientForm;
  riskFlags: TravelRiskFlag[];
  plannedVaccines: PlannedVaccine[];
  prescribedMedications: string[];
  medicalKitItems: MedicalKitSection[];
  counsellingConfirmed: Record<string, boolean>;
  pharmacistName: string;
  pharmacistCredentials: string;
  consultDate: string;
  followUpDates: string[];
}
