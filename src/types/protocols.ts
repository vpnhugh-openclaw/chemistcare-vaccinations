export interface ProtocolAlert {
  level: 'red' | 'amber' | 'green';
  title: string;
  message: string;
  action?: string;
  blocksPrescribing?: boolean;
}

export interface PrescribingOption {
  id: string;
  name: string;
  line: 'first' | 'second' | 'third';
  dose: string;
  frequency: string;
  duration: string;
  notes?: string;
  safetyChecks?: { question: string; blockIf: boolean; blockMessage: string }[];
}

// UTI Protocol
export const UTI_PRESCRIBING: PrescribingOption[] = [
  {
    id: 'nitrofurantoin',
    name: 'Nitrofurantoin 100mg MR',
    line: 'first',
    dose: '100mg',
    frequency: 'Twice daily with food',
    duration: '5 days',
    notes: 'First-line. Contraindicated in eGFR <30 mL/min.',
  },
  {
    id: 'fosfomycin',
    name: 'Fosfomycin 3g sachet',
    line: 'second',
    dose: '3g',
    frequency: 'Single dose',
    duration: 'Single dose',
    notes: 'Second-line. Take on empty stomach.',
  },
  {
    id: 'trimethoprim',
    name: 'Trimethoprim 300mg',
    line: 'third',
    dose: '300mg',
    frequency: 'Once daily at night',
    duration: '3 days',
    notes: 'Third-line only.',
    safetyChecks: [
      { question: 'Has the patient used Trimethoprim in the last 3 months?', blockIf: true, blockMessage: 'Trimethoprim should not be prescribed if used within 3 months. Select Nitrofurantoin instead.' },
    ],
  },
];

// Shingles Protocol
export const SHINGLES_PRESCRIBING: PrescribingOption[] = [
  {
    id: 'valaciclovir',
    name: 'Valaciclovir 1g',
    line: 'first',
    dose: '1g',
    frequency: 'Every 8 hours',
    duration: '7 days',
    notes: 'Standard immunocompetent dosing.',
  },
  {
    id: 'famciclovir',
    name: 'Famciclovir 500mg',
    line: 'first',
    dose: '500mg',
    frequency: 'Every 8 hours',
    duration: '7 days (10 days if immunocompromised)',
    notes: 'Extend to 10 days for immunocompromised patients.',
  },
  {
    id: 'aciclovir',
    name: 'Aciclovir 800mg',
    line: 'second',
    dose: '800mg',
    frequency: '5 times daily',
    duration: '7 days',
    notes: 'Higher pill burden; use if others unavailable.',
  },
];

export const CONTRACEPTION_PRESCRIBING: PrescribingOption[] = [
  {
    id: 'levonorgestrel-ee',
    name: 'Levonorgestrel/Ethinylestradiol',
    line: 'first',
    dose: 'As per current prescription',
    frequency: 'Daily',
    duration: '4 months supply',
    notes: 'Resupply of current combined OCP only.',
  },
  {
    id: 'desogestrel',
    name: 'Desogestrel (POP)',
    line: 'first',
    dose: '75mcg',
    frequency: 'Daily, continuous',
    duration: '4 months supply',
    notes: 'Progestogen-only pill resupply.',
  },
];
