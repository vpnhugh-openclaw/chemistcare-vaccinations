export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no-show";

export type EligibilityQuestion = {
  id: string;
  question: string;
  type: "boolean" | "select" | "text";
  options?: string[];
  redFlagAnswer?: string;
  redFlagMessage?: string;
  required: boolean;
};

export type ServiceAvailability = {
  day: string;
  available: boolean;
  open: string;
  close: string;
};

export type PharmacyService = {
  id: string;
  name: string;
  durationMinutes: number;
  description: string;
  eligibilityQuestions: EligibilityQuestion[];
  active: boolean;
  availability: ServiceAvailability[];
};

export type AppointmentSlot = {
  id: string;
  date: string;
  time: string;
  durationMinutes: number;
  pharmacistName: string;
  service: string;
  status: BookingStatus;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  eligibilityAnswers?: Record<string, string>;
  notes?: string;
};

const DEFAULT_AVAILABILITY: ServiceAvailability[] = [
  { day: "Monday", available: true, open: "08:30", close: "18:00" },
  { day: "Tuesday", available: true, open: "08:30", close: "18:00" },
  { day: "Wednesday", available: true, open: "08:30", close: "18:00" },
  { day: "Thursday", available: true, open: "08:30", close: "18:00" },
  { day: "Friday", available: true, open: "08:30", close: "17:00" },
  { day: "Saturday", available: false, open: "09:00", close: "13:00" },
  { day: "Sunday", available: false, open: "09:00", close: "13:00" },
];

export const pharmacyServices: PharmacyService[] = [
  // ── Pharmacist Prescribing (VCPP / National) ──
  {
    id: "uti",
    name: "UTI Consultation",
    durationMinutes: 20,
    description: "Assessment and treatment pathway for uncomplicated urinary tract infections.",
    active: true,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "uti-q1", question: "Are you female and aged between 18 and 65?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "Based on your response, this service may not be appropriate. Please consult your GP or visit an emergency department if needed.", required: true },
      { id: "uti-q2", question: "Are you pregnant or breastfeeding?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "This service is not suitable during pregnancy or breastfeeding. Please see your GP as soon as possible.", required: true },
      { id: "uti-q3", question: "Do you have any of the following: fever, back/flank pain, nausea or vomiting?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Your symptoms may indicate a more serious infection. Please seek urgent medical attention.", required: true },
      { id: "uti-q4", question: "Have you had more than 2 UTIs in the past 6 months?", type: "boolean", required: true },
    ],
  },
  {
    id: "ocp",
    name: "Oral Contraceptive Pill (Resupply)",
    durationMinutes: 15,
    description: "Continued supply of combined or progestogen-only oral contraceptive pill.",
    active: true,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "ocp-q1", question: "Have you been taking this contraceptive pill for at least 12 months?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "You need an initial prescription from your GP before using this resupply service.", required: true },
      { id: "ocp-q2", question: "Have you had a blood pressure check in the last 12 months?", type: "boolean", required: true },
      { id: "ocp-q3", question: "Do you have a history of blood clots, migraine with aura, or breast cancer?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Please see your GP for review before continuing this medication.", required: true },
    ],
  },
  {
    id: "shingles",
    name: "Shingles (Herpes Zoster) Treatment",
    durationMinutes: 20,
    description: "Assessment and antiviral treatment for suspected shingles.",
    active: true,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "sh-q1", question: "Are you aged 18 or over?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "This service is only available for adults aged 18 and over.", required: true },
      { id: "sh-q2", question: "Did the rash appear within the last 72 hours?", type: "boolean", required: true },
      { id: "sh-q3", question: "Is the rash near your eye, ear, or on the tip of your nose?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Shingles involving the face requires urgent medical assessment. Please see a doctor today.", required: true },
      { id: "sh-q4", question: "Are you immunocompromised or taking immunosuppressant medications?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Please see your GP urgently for specialist management.", required: true },
    ],
  },
  {
    id: "acne",
    name: "Mild-to-Moderate Acne Consultation",
    durationMinutes: 20,
    description: "Assessment and treatment of mild-to-moderate acne vulgaris.",
    active: true,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "ac-q1", question: "Are you aged between 12 and 65?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "This service is available for patients aged 12–65.", required: true },
      { id: "ac-q2", question: "Is the acne primarily on your face, chest, or back?", type: "boolean", required: true },
      { id: "ac-q3", question: "Have you been diagnosed with severe or cystic acne?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Severe acne requires GP or dermatologist management.", required: true },
    ],
  },
  {
    id: "impetigo",
    name: "Impetigo (School Sores) Treatment",
    durationMinutes: 15,
    description: "Assessment and topical/oral antibiotic treatment for localised impetigo.",
    active: true,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "imp-q1", question: "Are the sores limited to a small area (less than 3 patches)?", type: "boolean", required: true },
      { id: "imp-q2", question: "Does the patient have a fever or feel generally unwell?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Systemic symptoms require GP assessment.", required: true },
    ],
  },
  {
    id: "tinea",
    name: "Tinea (Fungal Skin Infection)",
    durationMinutes: 15,
    description: "Assessment and antifungal treatment for localised tinea infections.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "tin-q1", question: "Is the affected area limited to skin (not nails or scalp)?", type: "boolean", required: true },
      { id: "tin-q2", question: "Have you tried an over-the-counter antifungal without improvement for over 4 weeks?", type: "boolean", required: true },
    ],
  },
  {
    id: "allergic-rhinitis",
    name: "Allergic Rhinitis (Hay Fever)",
    durationMinutes: 15,
    description: "Assessment and pharmacological management of allergic rhinitis symptoms.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "ar-q1", question: "Are your symptoms primarily nasal (sneezing, runny nose, congestion)?", type: "boolean", required: true },
      { id: "ar-q2", question: "Do you have asthma that is poorly controlled?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Please see your GP to optimise asthma management first.", required: true },
    ],
  },
  {
    id: "gord",
    name: "Reflux / GORD (Resupply)",
    durationMinutes: 15,
    description: "Continued supply of proton pump inhibitors for diagnosed GORD.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "gord-q1", question: "Have you been diagnosed with GORD by a doctor?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "You need a GP diagnosis before using this resupply service.", required: true },
      { id: "gord-q2", question: "Do you have difficulty swallowing, unintended weight loss, or vomiting blood?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "These symptoms require urgent medical review. Please see your GP immediately.", required: true },
    ],
  },
  {
    id: "iron-deficiency",
    name: "Iron Deficiency (Resupply)",
    durationMinutes: 15,
    description: "Continued supply of iron supplements for diagnosed iron deficiency.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "iron-q1", question: "Have you had blood tests confirming iron deficiency in the last 12 months?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "Please see your GP for blood tests before starting iron therapy.", required: true },
    ],
  },

  // ── Chronic Disease Management ──
  {
    id: "bp-review",
    name: "Blood Pressure Review",
    durationMinutes: 15,
    description: "Blood pressure monitoring and medication review service.",
    active: true,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "bp-q1", question: "Are you currently taking blood pressure medication?", type: "boolean", required: true },
      { id: "bp-q2", question: "Have you experienced any recent chest pain or shortness of breath?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "These symptoms require urgent medical attention. Please call 000 or go to your nearest emergency department immediately.", required: true },
    ],
  },
  {
    id: "diabetes-review",
    name: "Diabetes Health Check",
    durationMinutes: 30,
    description: "Blood glucose monitoring, HbA1c review, and medication adherence check for type 2 diabetes.",
    active: true,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "dm-q1", question: "Have you been diagnosed with type 2 diabetes?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "This service is for patients with a confirmed type 2 diabetes diagnosis.", required: true },
      { id: "dm-q2", question: "Are you currently experiencing very high or very low blood sugar symptoms (e.g. confusion, tremors, excessive thirst)?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Please seek urgent medical attention for acute blood sugar issues.", required: true },
    ],
  },
  {
    id: "asthma-review",
    name: "Asthma Management Review",
    durationMinutes: 20,
    description: "Inhaler technique assessment, symptom control review, and action plan update.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "ast-q1", question: "Have you been diagnosed with asthma by a doctor?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "Please see your GP for diagnosis before using this service.", required: true },
      { id: "ast-q2", question: "Are you currently having an asthma attack or severe difficulty breathing?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Please call 000 immediately or use your reliever and seek emergency care.", required: true },
    ],
  },
  {
    id: "copd-review",
    name: "COPD Management Review",
    durationMinutes: 25,
    description: "Inhaler technique, symptom control, and exacerbation risk review for COPD patients.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "copd-q1", question: "Have you been diagnosed with COPD (chronic bronchitis or emphysema)?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "This service is for patients with confirmed COPD.", required: true },
      { id: "copd-q2", question: "Are you currently experiencing a severe exacerbation (much worse breathing than usual)?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Please seek urgent medical attention.", required: true },
    ],
  },

  // ── Preventive & Screening ──
  {
    id: "smoking-cessation",
    name: "Smoking Cessation Support",
    durationMinutes: 20,
    description: "NRT assessment, quit plan development, and ongoing support for smoking cessation.",
    active: true,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "sc-q1", question: "Are you currently a smoker or have you quit within the last 4 weeks?", type: "boolean", required: true },
      { id: "sc-q2", question: "Are you pregnant or breastfeeding?", type: "boolean", required: true },
    ],
  },
  {
    id: "weight-management",
    name: "Weight Management Consultation",
    durationMinutes: 30,
    description: "BMI assessment, lifestyle counselling, and medication review for weight management.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "wm-q1", question: "Are you aged 18 or over?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "This service is for adults only. Please see your GP.", required: true },
    ],
  },

  // ── CPA Services ──
  {
    id: "med-review",
    name: "Medication Review (MedsCheck)",
    durationMinutes: 30,
    description: "Comprehensive review of current medications for safety and adherence.",
    active: true,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "mr-q1", question: "Are you currently taking 5 or more regular medications?", type: "boolean", required: true },
      { id: "mr-q2", question: "Have you been to hospital or had a medication change in the past 6 months?", type: "boolean", required: true },
    ],
  },
  {
    id: "diabetes-medscheck",
    name: "Diabetes MedsCheck",
    durationMinutes: 45,
    description: "Specialised medication review for patients with type 2 diabetes, including device training.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "dmc-q1", question: "Have you been diagnosed with type 2 diabetes?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "This service is for patients with confirmed type 2 diabetes.", required: true },
      { id: "dmc-q2", question: "Are you taking diabetes medications?", type: "boolean", required: true },
    ],
  },

  // ── Travel & Vaccination ──
  {
    id: "travel-health",
    name: "Travel Health Consultation",
    durationMinutes: 30,
    description: "Pre-travel health assessment, vaccination advice, and medication supply.",
    active: true,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "th-q1", question: "Where are you travelling to?", type: "text", required: true },
      { id: "th-q2", question: "When is your departure date?", type: "text", required: true },
      { id: "th-q3", question: "Do you have any known allergies to vaccines or medications?", type: "boolean", required: true },
    ],
  },
  {
    id: "flu-vaccination",
    name: "Influenza Vaccination",
    durationMinutes: 10,
    description: "Annual influenza vaccination for eligible patients aged 10 and over.",
    active: true,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "flu-q1", question: "Are you aged 10 or over?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "Pharmacist flu vaccinations are available from age 10. Please see your GP for younger children.", required: true },
      { id: "flu-q2", question: "Have you ever had a severe allergic reaction to a flu vaccine or eggs?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Please discuss with your GP before receiving a flu vaccine.", required: true },
      { id: "flu-q3", question: "Are you currently unwell with a fever?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Please wait until you have recovered before getting vaccinated.", required: true },
    ],
  },
  {
    id: "covid-vaccination",
    name: "COVID-19 Vaccination",
    durationMinutes: 15,
    description: "COVID-19 vaccination and booster doses for eligible patients.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "cov-q1", question: "Are you aged 5 or over?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "Please see your GP for vaccination of children under 5.", required: true },
      { id: "cov-q2", question: "Have you had a severe allergic reaction to a previous COVID-19 vaccine?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Please discuss with your GP before receiving another dose.", required: true },
    ],
  },

  // ── Other Clinical Services ──
  {
    id: "wound-care",
    name: "Minor Wound Care",
    durationMinutes: 15,
    description: "Assessment and dressing of minor cuts, abrasions, and burns.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "wc-q1", question: "Is the wound a minor cut, graze, or superficial burn?", type: "boolean", redFlagAnswer: "No", redFlagMessage: "Deep wounds, animal bites, or large burns require medical attention. Please see a doctor.", required: true },
      { id: "wc-q2", question: "Is the wound showing signs of infection (increasing redness, pus, warmth)?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "Signs of infection need medical assessment. Please see your GP.", required: true },
    ],
  },
  {
    id: "ear-health",
    name: "Ear Health Check",
    durationMinutes: 15,
    description: "Otoscopic ear examination and management of earwax or minor ear complaints.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "ear-q1", question: "Are you experiencing ear pain, discharge, or sudden hearing loss?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "These symptoms may require GP assessment. Please see your doctor.", required: true },
    ],
  },
  {
    id: "sleep-health",
    name: "Sleep Health Consultation",
    durationMinutes: 20,
    description: "Assessment of sleep difficulties and advice on sleep hygiene and over-the-counter options.",
    active: false,
    availability: DEFAULT_AVAILABILITY.map(d => ({ ...d })),
    eligibilityQuestions: [
      { id: "sl-q1", question: "Have you been experiencing sleep difficulties for more than 4 weeks?", type: "boolean", required: true },
      { id: "sl-q2", question: "Do you snore loudly or has anyone observed you stop breathing during sleep?", type: "boolean", redFlagAnswer: "Yes", redFlagMessage: "You may need a sleep study. Please see your GP for a referral.", required: true },
    ],
  },
];

export const sampleAppointments: AppointmentSlot[] = [
  {
    id: "apt-001",
    date: "2026-03-10",
    time: "09:00",
    durationMinutes: 20,
    pharmacistName: "Sarah Chen",
    service: "UTI Consultation",
    status: "confirmed",
    patientName: "Jane Smith",
    patientEmail: "jane.smith@email.com",
    patientPhone: "0412 345 678",
    notes: "",
  },
  {
    id: "apt-002",
    date: "2026-03-10",
    time: "09:30",
    durationMinutes: 15,
    pharmacistName: "Sarah Chen",
    service: "Blood Pressure Review",
    status: "pending",
    patientName: "Robert Lee",
    patientEmail: "r.lee@email.com",
    patientPhone: "0423 456 789",
    notes: "",
  },
  {
    id: "apt-003",
    date: "2026-03-11",
    time: "10:00",
    durationMinutes: 30,
    pharmacistName: "Sarah Chen",
    service: "Travel Health Consultation",
    status: "confirmed",
    patientName: "Mei Wong",
    patientEmail: "mei.wong@email.com",
    patientPhone: "0434 567 890",
    notes: "Travelling to Nepal — 3 weeks",
  },
];
