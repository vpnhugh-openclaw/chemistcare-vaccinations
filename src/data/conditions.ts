import { Condition } from '@/types/clinical';

export const CONDITIONS: Condition[] = [
  {
    id: 'uti',
    name: 'Uncomplicated UTI',
    classification: 'acute',
    description: 'Uncomplicated lower urinary tract infection in non-pregnant women aged 18–65',
    scopeValidation: {
      minAge: 18,
      maxAge: 65,
      sexRestriction: 'female',
      pregnancyExcluded: true,
      breastfeedingExcluded: false,
      jurisdictionNotes: 'Victorian Community Pharmacist Prescriber program',
    },
    redFlags: [
      { id: 'uti-rf1', description: 'Fever >38°C or systemic symptoms', action: 'referral_required' },
      { id: 'uti-rf2', description: 'Flank pain or costovertebral angle tenderness', action: 'urgent_referral' },
      { id: 'uti-rf3', description: 'Haematuria (visible)', action: 'referral_required' },
      { id: 'uti-rf4', description: 'Recurrent UTI (≥3 in 12 months)', action: 'referral_required' },
      { id: 'uti-rf5', description: 'Symptoms >7 days', action: 'referral_required' },
      { id: 'uti-rf6', description: 'Immunocompromised patient', action: 'referral_required' },
      { id: 'uti-rf7', description: 'Recent urinary tract procedure', action: 'referral_required' },
    ],
    exclusionCriteria: [
      { id: 'uti-ex1', description: 'Male patient', type: 'sex' },
      { id: 'uti-ex2', description: 'Pregnant or possibly pregnant', type: 'pregnancy' },
      { id: 'uti-ex3', description: 'Age <18 or >65', type: 'age' },
      { id: 'uti-ex4', description: 'Known urinary tract abnormality', type: 'comorbidity' },
      { id: 'uti-ex5', description: 'Indwelling catheter', type: 'other' },
    ],
    assessmentFields: ['Dysuria', 'Frequency', 'Urgency', 'Suprapubic pain', 'Duration of symptoms', 'Previous UTI history', 'Last menstrual period', 'Vaginal discharge'],
    therapyOptions: [
      {
        id: 'uti-t1', medicineName: 'Trimethoprim', dose: '300mg', frequency: 'Once daily', duration: '3 days',
        maxQuantity: 3, repeats: 0, pbsRestriction: 'Restricted benefit', authorityRequired: false,
        line: 'first', contraindications: ['Folate deficiency', 'Blood dyscrasia', 'Trimethoprim allergy'],
        interactions: ['Methotrexate', 'Warfarin', 'Phenytoin'], monitoringRequired: 'Symptom review at 48hrs',
      },
      {
        id: 'uti-t2', medicineName: 'Nitrofurantoin', dose: '100mg', frequency: 'Twice daily (modified release)', duration: '5 days',
        maxQuantity: 10, repeats: 0, pbsRestriction: 'Restricted benefit', authorityRequired: false,
        line: 'second', contraindications: ['eGFR <30', 'G6PD deficiency', 'Nitrofurantoin allergy'],
        interactions: ['Antacids containing magnesium'], specialPopulations: 'Avoid if eGFR <30 mL/min',
      },
    ],
    guidelineReference: 'Therapeutic Guidelines: Antibiotic – Urinary tract infections',
    followUpInterval: '48 hours if no improvement, 7 days for resolution',
  },
  {
    id: 'ocp-resupply',
    name: 'OCP Resupply + Hormonal Contraception',
    classification: 'resupply',
    description: 'Continued supply of oral contraceptive pill for women with established therapy',
    scopeValidation: {
      minAge: 16, sexRestriction: 'female', pregnancyExcluded: true, breastfeedingExcluded: false,
      jurisdictionNotes: 'Must have been on same OCP for ≥6 months with no change in health status',
    },
    redFlags: [
      { id: 'ocp-rf1', description: 'New onset severe headache or migraine with aura', action: 'urgent_referral' },
      { id: 'ocp-rf2', description: 'Calf pain, swelling, or signs of DVT', action: 'urgent_referral' },
      { id: 'ocp-rf3', description: 'Chest pain or shortness of breath', action: 'urgent_referral' },
      { id: 'ocp-rf4', description: 'Significant BP elevation (>140/90)', action: 'referral_required' },
      { id: 'ocp-rf5', description: 'New diagnosis of breast cancer or BRCA+', action: 'referral_required' },
    ],
    exclusionCriteria: [
      { id: 'ocp-ex1', description: 'New to OCP (not established therapy)', type: 'other' },
      { id: 'ocp-ex2', description: 'Change in health status since last GP review', type: 'comorbidity' },
      { id: 'ocp-ex3', description: 'Not reviewed by GP in past 12 months', type: 'other' },
      { id: 'ocp-ex4', description: 'Pregnant', type: 'pregnancy' },
    ],
    assessmentFields: ['Current OCP name & strength', 'Duration on current OCP', 'Last GP review date', 'Blood pressure', 'Smoking status', 'BMI', 'Any new medications', 'Breakthrough bleeding'],
    therapyOptions: [
      {
        id: 'ocp-t1', medicineName: 'Continue current OCP', dose: 'As per current prescription', frequency: 'As directed', duration: 'Up to 6 months supply',
        maxQuantity: 6, repeats: 0, authorityRequired: false,
        line: 'first', contraindications: ['History of VTE', 'Active liver disease', 'Migraine with aura'],
        interactions: ['Rifampicin', 'Carbamazepine', 'St Johns Wort', 'Phenytoin'],
      },
    ],
    guidelineReference: 'Therapeutic Guidelines: Sexual & Reproductive Health',
    followUpInterval: '12 months – refer to GP for comprehensive review',
  },
  {
    id: 'herpes-zoster',
    name: 'Herpes Zoster',
    classification: 'acute',
    description: 'Shingles – reactivation of varicella-zoster virus presenting as unilateral dermatomal vesicular rash',
    scopeValidation: {
      minAge: 18, pregnancyExcluded: true, breastfeedingExcluded: true,
      temporalConstraint: 'Must present within 72 hours of rash onset for antiviral benefit',
    },
    redFlags: [
      { id: 'hz-rf1', description: 'Ophthalmic involvement (forehead, nose tip – Hutchinson sign)', action: 'urgent_referral' },
      { id: 'hz-rf2', description: 'Immunocompromised patient', action: 'urgent_referral' },
      { id: 'hz-rf3', description: 'Disseminated rash (>2 dermatomes)', action: 'urgent_referral' },
      { id: 'hz-rf4', description: 'Ramsay Hunt syndrome (ear involvement, facial palsy)', action: 'urgent_referral' },
      { id: 'hz-rf5', description: 'Neurological complications', action: 'urgent_referral' },
    ],
    exclusionCriteria: [
      { id: 'hz-ex1', description: 'Rash onset >72 hours ago', type: 'temporal' },
      { id: 'hz-ex2', description: 'Pregnant or breastfeeding', type: 'pregnancy' },
      { id: 'hz-ex3', description: 'Age <18', type: 'age' },
    ],
    assessmentFields: ['Rash onset date/time', 'Dermatomal distribution', 'Pain severity (0-10)', 'Vesicle stage', 'Fever', 'Prior varicella/zoster history', 'Vaccination status'],
    therapyOptions: [
      {
        id: 'hz-t1', medicineName: 'Valaciclovir', dose: '1000mg', frequency: 'Three times daily', duration: '7 days',
        maxQuantity: 21, repeats: 0, pbsRestriction: 'Authority required', authorityRequired: true,
        line: 'first', contraindications: ['Valaciclovir/aciclovir allergy'], interactions: ['Nephrotoxic drugs'],
        specialPopulations: 'Dose adjustment if eGFR <30', monitoringRequired: 'Renal function if elderly',
      },
      {
        id: 'hz-t2', medicineName: 'Famciclovir', dose: '500mg', frequency: 'Three times daily', duration: '7 days',
        maxQuantity: 21, repeats: 0, pbsRestriction: 'Authority required', authorityRequired: true,
        line: 'second', contraindications: ['Famciclovir allergy'], interactions: ['Probenecid'],
        specialPopulations: 'Dose adjustment if eGFR <40',
      },
    ],
    guidelineReference: 'Therapeutic Guidelines: Antibiotic – Herpes zoster',
    followUpInterval: '7 days for treatment response; ongoing for post-herpetic neuralgia risk',
  },
  {
    id: 'hypertension',
    name: 'Hypertension',
    classification: 'chronic',
    description: 'Management of essential hypertension in adults',
    scopeValidation: { minAge: 18, pregnancyExcluded: true, breastfeedingExcluded: true },
    redFlags: [
      { id: 'htn-rf1', description: 'BP >180/120 – hypertensive urgency/emergency', action: 'urgent_referral' },
      { id: 'htn-rf2', description: 'Signs of end-organ damage', action: 'urgent_referral' },
      { id: 'htn-rf3', description: 'Secondary hypertension suspected', action: 'referral_required' },
    ],
    exclusionCriteria: [
      { id: 'htn-ex1', description: 'Pregnant or planning pregnancy', type: 'pregnancy' },
      { id: 'htn-ex2', description: 'Age <18', type: 'age' },
    ],
    assessmentFields: ['BP reading (seated, both arms)', 'Home BP readings', 'CVD risk assessment', 'Smoking status', 'Diabetes status', 'Kidney function', 'Lipid profile', 'BMI', 'Family history'],
    therapyOptions: [
      {
        id: 'htn-t1', medicineName: 'Perindopril', dose: '4–8mg', frequency: 'Once daily', duration: 'Ongoing',
        maxQuantity: 30, repeats: 5, authorityRequired: false, line: 'first',
        contraindications: ['Bilateral renal artery stenosis', 'Angioedema history', 'Hyperkalaemia'],
        interactions: ['NSAIDs', 'Potassium-sparing diuretics', 'Lithium'], monitoringRequired: 'Renal function + K+ at 1–2 weeks',
      },
      {
        id: 'htn-t2', medicineName: 'Amlodipine', dose: '5–10mg', frequency: 'Once daily', duration: 'Ongoing',
        maxQuantity: 30, repeats: 5, authorityRequired: false, line: 'first',
        contraindications: ['Severe aortic stenosis'], interactions: ['Simvastatin >20mg'],
      },
    ],
    guidelineReference: 'Therapeutic Guidelines: Cardiovascular – Hypertension',
    followUpInterval: '2–4 weeks initially, then 3–6 monthly once stable',
    monitoringChecklist: ['Blood pressure', 'Renal function', 'Electrolytes', 'CVD risk reassessment'],
  },
  {
    id: 't2dm',
    name: 'Type 2 Diabetes',
    classification: 'chronic',
    description: 'Management of type 2 diabetes mellitus in adults',
    scopeValidation: { minAge: 18, pregnancyExcluded: true, breastfeedingExcluded: true },
    redFlags: [
      { id: 't2d-rf1', description: 'HbA1c >10% or symptomatic hyperglycaemia', action: 'referral_required' },
      { id: 't2d-rf2', description: 'DKA or HHS features', action: 'urgent_referral' },
      { id: 't2d-rf3', description: 'Active foot ulcer or infection', action: 'urgent_referral' },
    ],
    exclusionCriteria: [
      { id: 't2d-ex1', description: 'Type 1 diabetes', type: 'comorbidity' },
      { id: 't2d-ex2', description: 'Pregnant', type: 'pregnancy' },
    ],
    assessmentFields: ['HbA1c', 'Fasting glucose', 'BMI', 'Renal function', 'Lipid profile', 'BP', 'Foot examination', 'Eye review date', 'Smoking status'],
    therapyOptions: [
      {
        id: 't2d-t1', medicineName: 'Metformin', dose: '500–2000mg', frequency: 'Twice daily with meals', duration: 'Ongoing',
        maxQuantity: 60, repeats: 5, authorityRequired: false, line: 'first',
        contraindications: ['eGFR <30', 'Metabolic acidosis'], interactions: ['Contrast media', 'Alcohol excess'],
        monitoringRequired: 'Renal function 3–6 monthly, HbA1c 3 monthly initially',
      },
    ],
    guidelineReference: 'Therapeutic Guidelines: Endocrinology – Type 2 diabetes',
    followUpInterval: '3 months initially, then 3–6 monthly',
    monitoringChecklist: ['HbA1c', 'Renal function', 'Lipids', 'Blood pressure', 'Weight', 'Foot check'],
  },
  // Remaining conditions with essential data
  ...[
    { id: 'nausea', name: 'Acute Nausea and Vomiting', classification: 'acute' as const, description: 'Short-term management of acute nausea and vomiting in adults' },
    { id: 'rhinitis', name: 'Allergic and Non-allergic Rhinitis', classification: 'chronic' as const, description: 'Management of allergic and non-allergic rhinitis' },
    { id: 'asthma', name: 'Asthma & Exercise-induced Bronchoconstriction', classification: 'chronic' as const, description: 'Asthma management and exercise-induced bronchoconstriction' },
    { id: 'atopic-dermatitis', name: 'Atopic Dermatitis', classification: 'chronic' as const, description: 'Management of mild-moderate atopic dermatitis/eczema' },
    { id: 'copd', name: 'COPD', classification: 'chronic' as const, description: 'Chronic obstructive pulmonary disease management' },
    { id: 'dyslipidaemia', name: 'Dyslipidaemia', classification: 'chronic' as const, description: 'Management of elevated cholesterol and lipids' },
    { id: 'ear-infections', name: 'Ear Infections (AOE, AOM)', classification: 'acute' as const, description: 'Acute otitis externa and acute otitis media' },
    { id: 'gord', name: 'GORD', classification: 'chronic' as const, description: 'Gastro-oesophageal reflux disease management' },
    { id: 'impetigo', name: 'Impetigo', classification: 'acute' as const, description: 'Superficial bacterial skin infection management' },
    { id: 'acne', name: 'Mild–Moderate Acne', classification: 'chronic' as const, description: 'Acne vulgaris – mild to moderate severity' },
    { id: 'msk-pain', name: 'Mild Acute Musculoskeletal Pain', classification: 'acute' as const, description: 'Short-term management of acute musculoskeletal pain' },
    { id: 'wound', name: 'Minor Wound Management', classification: 'acute' as const, description: 'Management of minor wounds, abrasions, and lacerations' },
    { id: 'oral-health', name: 'Oral Health Screening + Fluoride', classification: 'preventive' as const, description: 'Oral health assessment and fluoride application' },
    { id: 'psoriasis', name: 'Psoriasis', classification: 'chronic' as const, description: 'Management of mild plaque psoriasis' },
    { id: 'smoking-cessation', name: 'Smoking Cessation', classification: 'preventive' as const, description: 'Pharmacological and behavioural support for smoking cessation' },
    { id: 'travel-medicine', name: 'Travel Medicine', classification: 'preventive' as const, description: 'Pre-travel health assessment and vaccination/prophylaxis' },
    { id: 'weight-management', name: 'Weight Management (Obesity)', classification: 'chronic' as const, description: 'Pharmacological management of obesity in adults' },
  ].map(c => ({
    ...c,
    scopeValidation: { minAge: 18, pregnancyExcluded: true, breastfeedingExcluded: false },
    redFlags: [{ id: `${c.id}-rf1`, description: 'Severe or systemic symptoms requiring medical review', action: 'referral_required' as const }],
    exclusionCriteria: [{ id: `${c.id}-ex1`, description: 'Outside pharmacist prescriber scope', type: 'other' as const }],
    assessmentFields: ['Presenting symptoms', 'Duration', 'Severity', 'Previous treatment', 'Relevant history'],
    therapyOptions: [],
    guidelineReference: 'Australian Therapeutic Guidelines',
    followUpInterval: 'As clinically indicated',
  })),
];

export const getConditionById = (id: string): Condition | undefined =>
  CONDITIONS.find(c => c.id === id);

export const getConditionsByClassification = (classification: Condition['classification']) =>
  CONDITIONS.filter(c => c.classification === classification);
