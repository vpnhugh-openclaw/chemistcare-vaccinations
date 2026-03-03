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

export type PharmacyService = {
  id: string;
  name: string;
  durationMinutes: number;
  description: string;
  eligibilityQuestions: EligibilityQuestion[];
  active: boolean;
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

export const pharmacyServices: PharmacyService[] = [
  {
    id: "uti",
    name: "UTI Consultation",
    durationMinutes: 20,
    description: "Assessment and treatment pathway for uncomplicated urinary tract infections.",
    active: true,
    eligibilityQuestions: [
      {
        id: "uti-q1",
        question: "Are you female and aged between 18 and 65?",
        type: "boolean",
        redFlagAnswer: "No",
        redFlagMessage: "Based on your response, this service may not be appropriate. Please consult your GP or visit an emergency department if needed.",
        required: true,
      },
      {
        id: "uti-q2",
        question: "Are you pregnant or breastfeeding?",
        type: "boolean",
        redFlagAnswer: "Yes",
        redFlagMessage: "This service is not suitable during pregnancy or breastfeeding. Please see your GP as soon as possible.",
        required: true,
      },
      {
        id: "uti-q3",
        question: "Do you have any of the following: fever, back/flank pain, nausea or vomiting?",
        type: "boolean",
        redFlagAnswer: "Yes",
        redFlagMessage: "Your symptoms may indicate a more serious infection. Please seek urgent medical attention.",
        required: true,
      },
      {
        id: "uti-q4",
        question: "Have you had more than 2 UTIs in the past 6 months?",
        type: "boolean",
        required: true,
      },
    ],
  },
  {
    id: "bp-review",
    name: "Blood Pressure Review",
    durationMinutes: 15,
    description: "Blood pressure monitoring and medication review service.",
    active: true,
    eligibilityQuestions: [
      {
        id: "bp-q1",
        question: "Are you currently taking blood pressure medication?",
        type: "boolean",
        required: true,
      },
      {
        id: "bp-q2",
        question: "Have you experienced any recent chest pain or shortness of breath?",
        type: "boolean",
        redFlagAnswer: "Yes",
        redFlagMessage: "These symptoms require urgent medical attention. Please call 000 or go to your nearest emergency department immediately.",
        required: true,
      },
    ],
  },
  {
    id: "travel-health",
    name: "Travel Health Consultation",
    durationMinutes: 30,
    description: "Pre-travel health assessment, vaccination advice, and medication supply.",
    active: true,
    eligibilityQuestions: [
      {
        id: "th-q1",
        question: "Where are you travelling to?",
        type: "text",
        required: true,
      },
      {
        id: "th-q2",
        question: "When is your departure date?",
        type: "text",
        required: true,
      },
      {
        id: "th-q3",
        question: "Do you have any known allergies to vaccines or medications?",
        type: "boolean",
        required: true,
      },
    ],
  },
  {
    id: "med-review",
    name: "Medication Review (MedsCheck)",
    durationMinutes: 30,
    description: "Comprehensive review of current medications for safety and adherence.",
    active: true,
    eligibilityQuestions: [
      {
        id: "mr-q1",
        question: "Are you currently taking 5 or more regular medications?",
        type: "boolean",
        required: true,
      },
      {
        id: "mr-q2",
        question: "Have you been to hospital or had a medication change in the past 6 months?",
        type: "boolean",
        required: true,
      },
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
