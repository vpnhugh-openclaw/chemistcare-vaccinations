import type { ConsultTemplate } from '@/types/templates';

export const CONSULT_TEMPLATES: ConsultTemplate[] = [
  {
    id: 'travellers-diarrhoea',
    name: "Traveller's Diarrhoea",
    condition: 'Acute gastroenteritis / travellers diarrhoea',
    jurisdiction: 'Victoria',
    prefill: {
      assessmentPrompts: ['Onset & duration', 'Frequency of stools', 'Blood or mucus in stool', 'Fever present', 'Recent travel destination', 'Oral hydration tolerance'],
      differentials: ['Viral gastroenteritis', 'Bacterial dysentery', 'Parasitic infection'],
      treatmentOptions: [
        { medication: 'Loperamide', dose: '2 mg initial then 1 mg after each loose stool (max 8 mg/day)', duration: '48 hours', notes: 'Symptomatic relief only; avoid if bloody stool or fever >38.5°C' },
        { medication: 'Azithromycin', dose: '500 mg daily', duration: '3 days (standby script)', notes: 'Standby antibiotic for moderate-severe symptoms' },
      ],
      noteHeadings: ['Travel History', 'Symptom Timeline', 'Hydration Assessment', 'Red Flags Screened', 'Treatment Plan', 'Return-to-pharmacist Advice'],
      documentationChecklist: ['Travel dates confirmed', 'Stool characteristics documented', 'ORS counselling provided', 'Standby script criteria explained'],
    },
  },
  {
    id: 'otitis-externa',
    name: 'Otitis Externa',
    condition: 'Otitis externa',
    jurisdiction: 'Victoria',
    prefill: {
      assessmentPrompts: ['Ear pain severity (0-10)', 'Duration of symptoms', 'Discharge present', 'Hearing changes', 'Recent swimming / water exposure', 'Previous episodes'],
      differentials: ['Otitis media', 'Foreign body', 'Fungal otitis externa', 'Furunculosis'],
      treatmentOptions: [
        { medication: 'Ciprofloxacin 0.3% / Dexamethasone 0.1% ear drops', dose: '4 drops to affected ear BD', duration: '7 days', notes: 'First-line for uncomplicated otitis externa' },
        { medication: 'Acetic acid 2% ear drops', dose: '5 drops TDS', duration: '7 days', notes: 'Mild cases or prophylaxis' },
      ],
      noteHeadings: ['Presenting Complaint', 'Otoscopic Findings', 'Red Flag Screen', 'Treatment Selection', 'Ear Care Advice', 'Follow-up Plan'],
      documentationChecklist: ['Tympanic membrane integrity confirmed', 'Otoscopy performed', 'Water avoidance counselled'],
    },
  },
  {
    id: 'uti-uncomplicated',
    name: 'Uncomplicated UTI (Female)',
    condition: 'Uncomplicated urinary tract infection',
    jurisdiction: 'Victoria',
    prefill: {
      assessmentPrompts: ['Dysuria', 'Frequency & urgency', 'Suprapubic pain', 'Haematuria', 'Fever / flank pain', 'Vaginal discharge', 'Number of UTIs in past 12 months'],
      differentials: ['Pyelonephritis', 'Vaginitis', 'STI', 'Interstitial cystitis'],
      treatmentOptions: [
        { medication: 'Trimethoprim', dose: '300 mg daily', duration: '3 days', notes: 'First-line uncomplicated UTI; check renal function' },
        { medication: 'Nitrofurantoin', dose: '100 mg BD', duration: '5 days', notes: 'Alternative first-line; avoid if eGFR <30' },
      ],
      noteHeadings: ['Urinary Symptoms', 'Exclusion Criteria Checked', 'Red Flags Screened', 'Antibiotic Selection Rationale', 'Hydration & Self-care Advice', 'Safety Net & Follow-up'],
      documentationChecklist: ['Confirmed female sex', 'No upper tract symptoms', 'Pregnancy excluded', 'Recurrence history noted'],
    },
  },
  {
    id: 'smoking-cessation',
    name: 'Smoking Cessation Consult',
    condition: 'Smoking cessation support',
    jurisdiction: 'Victoria',
    prefill: {
      assessmentPrompts: ['Cigarettes per day', 'Years smoking', 'Time to first cigarette after waking', 'Previous quit attempts', 'Current NRT or medication use', 'Readiness to quit (stage of change)'],
      differentials: [],
      treatmentOptions: [
        { medication: 'Nicotine patch 21 mg', dose: '1 patch daily', duration: '8-12 weeks step-down', notes: 'Combine with fast-acting NRT for breakthrough cravings' },
        { medication: 'Nicotine gum 4 mg', dose: 'PRN (max 15 pieces/day)', duration: '12 weeks', notes: 'For >20 cigs/day use 4 mg; <20 use 2 mg' },
      ],
      noteHeadings: ['Smoking History', 'Fagerström Score', 'Motivation Assessment', 'NRT Plan', 'Behavioural Support Discussed', 'Quitline Referral', 'Follow-up Schedule'],
      documentationChecklist: ['Fagerström completed', 'NRT counselling provided', 'Quitline referral offered', 'Follow-up booked'],
    },
  },
  {
    id: 'emergency-contraception',
    name: 'Emergency Contraception',
    condition: 'Emergency contraception',
    jurisdiction: 'Victoria',
    prefill: {
      assessmentPrompts: ['Time since UPSI (hours)', 'Contraceptive method normally used', 'Last menstrual period date', 'Regular cycle length', 'BMI/weight', 'Other UPSI this cycle', 'Current medications (enzyme inducers)'],
      differentials: [],
      treatmentOptions: [
        { medication: 'Levonorgestrel', dose: '1.5 mg single dose', duration: 'Single dose', notes: 'Most effective within 72h; efficacy decreases with time' },
        { medication: 'Ulipristal acetate', dose: '30 mg single dose', duration: 'Single dose', notes: 'Effective up to 120h; do not use with hormonal contraception for 5 days after' },
      ],
      noteHeadings: ['Timing of UPSI', 'Menstrual History', 'Contraindication Screen', 'Product Selection Rationale', 'Ongoing Contraception Plan', 'Follow-up Advice'],
      documentationChecklist: ['UPSI timing confirmed', 'Pregnancy excluded', 'Ongoing contraception discussed', 'Follow-up pregnancy test advised if period >7 days late'],
    },
  },
];
