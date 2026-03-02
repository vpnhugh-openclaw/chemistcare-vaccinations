// ═══════════════════════════════════════════════
// Travel Health – Structured Prescribing Data
// ═══════════════════════════════════════════════

export interface TravelMedication {
  id: string;
  drug: string;
  strength: string;
  dosingOptions: { label: string; value: string }[];
  indication: string;
  clinicalNotes: string[];
  contraindications: string[];
  referFlags?: string[];
  group: string;
}

// ── 2.1 Travellers' Diarrhoea ──

export const TD_MEDICATIONS: TravelMedication[] = [
  {
    id: 'td-loperamide',
    drug: 'Loperamide',
    strength: '2 mg capsules',
    group: 'Antidiarrhoeal',
    dosingOptions: [
      { label: 'Standard', value: 'Initial 4 mg, then 2 mg after each loose stool (max 16 mg in 24 hours; max 48 hours total).' },
    ],
    indication: 'Mild–moderate travellers\' diarrhoea in adults and children ≥12 years.',
    clinicalNotes: [
      'Hydration is first-line: oral rehydration solutions.',
      'Seek medical care if symptoms persist >48 hours or worsen.',
    ],
    contraindications: [
      'Age <12 years',
      'High fever',
      'Bloody diarrhoea',
      'Severe abdominal pain',
      'Suspected IBD flare',
    ],
  },
  {
    id: 'td-azithromycin',
    drug: 'Azithromycin',
    strength: '500 mg tablets',
    group: 'Antibiotics (Stand-by)',
    dosingOptions: [
      { label: '3-day course (mod–severe)', value: '500 mg once daily for 3 days (moderate–severe TD).' },
      { label: 'Single dose (mild–mod)', value: 'Single 1000 mg dose (mild–moderate TD).' },
    ],
    indication: 'Stand-by for moderate–severe travellers\' diarrhoea with fever/blood/inability to access care.',
    clinicalNotes: [
      'Preferred in areas with quinolone resistance (e.g. South/Southeast Asia).',
      'Self-treat trigger: 3+ loose stools/24h PLUS fever, blood, or severe symptoms.',
      'Complete full course even if symptoms improve.',
      'Seek medical care if no improvement within 24–48 hours.',
    ],
    contraindications: [],
  },
];

// ── 2.2 Altitude Illness ──

export const ALTITUDE_MEDICATIONS: TravelMedication[] = [
  {
    id: 'alt-acetazolamide',
    drug: 'Acetazolamide',
    strength: '250 mg',
    group: 'AMS Prevention',
    dosingOptions: [
      { label: 'Prophylaxis', value: '125 mg twice daily, starting 1 day before ascent.' },
      { label: 'Treatment', value: '250 mg twice daily until symptoms resolve.' },
    ],
    indication: 'Only for LOW risk travellers to ≥2500 m.',
    clinicalNotes: [
      'Low-risk definition: No prior altitude illness, gradual ascent, sleeping elevation ≤500 m/day above 3000 m.',
      'Most effective treatment is DESCENT.',
      'Never ascend with AMS symptoms.',
    ],
    contraindications: [
      'Severe renal impairment',
      'Hepatic cirrhosis',
      'Chronic angle-closure glaucoma',
      'Sulfonamide allergy',
    ],
    referFlags: [
      'Children <8 years at ≥2500 m',
      'Moderate/high risk itineraries',
      '>3500 m',
      'Cardiovascular, renal, or significant respiratory conditions',
    ],
  },
  {
    id: 'alt-metoclopramide',
    drug: 'Metoclopramide',
    strength: '10 mg',
    group: 'Antiemetics (altitude nausea)',
    dosingOptions: [
      { label: 'Standard', value: '10 mg orally every 8 hours as needed.' },
    ],
    indication: 'Altitude-associated nausea in low-risk travellers to ≥2500 m.',
    clinicalNotes: [
      'May cause sedation.',
      'Extrapyramidal effects possible, especially in young adults.',
      'Descent remains the most effective treatment.',
    ],
    contraindications: [],
  },
  {
    id: 'alt-promethazine',
    drug: 'Promethazine',
    strength: '25 mg',
    group: 'Antiemetics (altitude nausea)',
    dosingOptions: [
      { label: 'Standard', value: '25 mg orally every 4–6 hours as needed (max 100 mg in 24 hours).' },
    ],
    indication: 'Altitude-associated nausea in low-risk travellers to ≥2500 m.',
    clinicalNotes: [
      'Causes sedation — avoid driving or operating machinery.',
      'Descent remains the most effective treatment.',
    ],
    contraindications: [],
  },
];

// ── 2.3 Travel Vaccinations ──

export interface TravelVaccineInfo {
  id: string;
  name: string;
  type: 'inactivated' | 'live';
  notes: string;
  isReferOnly?: boolean;
}

export const TRAVEL_VACCINES: TravelVaccineInfo[] = [
  { id: 'vax-influenza', name: 'Influenza', type: 'inactivated', notes: 'Inactivated. Funded under NIP for Aboriginal and Torres Strait Islander people as per schedule.' },
  { id: 'vax-dtpa', name: 'Diphtheria–Tetanus–Pertussis', type: 'inactivated', notes: 'Inactivated. Booster if >10 years since last dose.' },
  { id: 'vax-hepa', name: 'Hepatitis A', type: 'inactivated', notes: 'Inactivated. Aboriginal and Torres Strait Islander children may have received in childhood.' },
  { id: 'vax-typhoid-inj', name: 'Typhoid (injectable)', type: 'inactivated', notes: 'Inactivated polysaccharide – Typherix, ViVAXIM (with Hep A).' },
  { id: 'vax-typhoid-oral', name: 'Typhoid (oral)', type: 'live', notes: 'Live attenuated – Vivotif (3-dose oral course).' },
  { id: 'vax-covid', name: 'COVID-19', type: 'inactivated', notes: 'As per current national recommendations.' },
];

export const VACCINE_SCHEDULING_RULES = [
  'Live vaccines: give same day OR ≥4 weeks apart.',
  'Inactivated vaccines: can be given any time relative to each other.',
  'Do not give oral typhoid and Dukoral within 8 hours of each other.',
];

export const VACCINE_REFER_FLAGS = [
  'Yellow fever',
  'Japanese encephalitis',
  'Rabies pre-exposure prophylaxis',
  'Immunocompromised travellers',
  'Pregnancy',
  'Complex travel itineraries',
];

// ── 2.4 VTE Prevention ──

export const VTE_COUNSELLING_ITEMS = [
  'Remain ambulant before and after travel.',
  'Regular movement and stretching during travel.',
  'Choose aisle seats for legroom.',
  'Avoid alcohol and sedatives.',
  'Maintain hydration; wear loose clothing.',
  'Consider graduated compression stockings if VTE history or risk factors.',
];

export const VTE_REFER_NOTE = '🔴 Refer for pharmacological VTE prophylaxis (e.g. apixaban, rivaroxaban, enoxaparin) – not initiated in this module.';

// ── Structured prescription record ──

export interface TravelPrescriptionItem {
  id: string;
  drug: string;
  strength: string;
  dosing: string;
  indication: string;
  notes: string;
}
