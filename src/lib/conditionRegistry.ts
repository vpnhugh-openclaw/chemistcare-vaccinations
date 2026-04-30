import { z } from 'zod';
import { CONDITIONS as BASE_CONDITIONS } from '@/data/conditions';
import type { Condition, ConsultationStep, RedFlag, TherapyOption } from '@/types/clinical';

export type ConditionCategory = 'acute' | 'chronic' | 'preventive' | 'resupply' | 'travel';
export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: FieldOption[];
}

export interface StepDefinition {
  key: ConsultationStep;
  label: string;
  description: string;
}

export interface ScopeCheckResult {
  label: string;
  detail: string;
  pass: boolean;
}

export interface ConsultationValidationPayload {
  conditionSlug: string;
  patient: Record<string, string>;
  assessment: Record<string, string>;
  redFlagsChecked: Record<string, boolean>;
  differentials: {
    workingDiagnosis: string;
    items: { diagnosis: string; reasonExcluded: string }[];
  };
  treatment: Record<string, string>;
  documentation: Record<string, string>;
}

export interface ConditionTemplate {
  steps: StepDefinition[];
  validationSchema: z.ZodType<ConsultationValidationPayload>;
  redFlags: RedFlag[];
  assessmentFields: FieldDefinition[];
  treatmentOptions: TherapyOption[];
  documentationTemplate: string;
}

export interface ConsultationCondition extends Omit<Condition, 'redFlags' | 'assessmentFields' | 'therapyOptions'> {
  slug: string;
  category: ConditionCategory;
  classification: ConditionCategory;
  redFlags: RedFlag[];
  assessmentFields: string[];
  therapyOptions: TherapyOption[];
  redFlagCount: number;
  treatmentOptionCount: number;
  template: ConditionTemplate;
  enabled: boolean;
  pinned: boolean;
  sortOrder: number;
}

const DEFAULT_STEPS: StepDefinition[] = [
  { key: 'patient', label: 'Patient Profile', description: 'Identity, demographics, and background' },
  { key: 'assessment', label: 'Assessment', description: 'Condition-specific protocol assessment' },
  { key: 'differentials', label: 'Differentials', description: 'Working diagnosis and exclusions' },
  { key: 'scope', label: 'Scope Validation', description: 'Protocol and prescribing eligibility' },
  { key: 'treatment', label: 'Treatment', description: 'Condition-bound treatment plan' },
  { key: 'documentation', label: 'Documentation', description: 'Condition-specific consult note' },
];

const SLUG_OVERRIDES: Record<string, string> = {
  uti: 'uncomplicated-uti',
  wound: 'minor-wound',
};

const PINNED_CONDITIONS = new Set(['travel-medicine', 'uti', 'ocp-resupply', 'herpes-zoster', 'wound']);

const FIELD_DEFINITIONS: Record<string, FieldDefinition[]> = {
  uti: [
    { id: 'dysuria', label: 'Dysuria', type: 'text', required: true, placeholder: 'Burning, severity, when it occurs' },
    { id: 'frequency', label: 'Frequency', type: 'text', required: true, placeholder: 'Describe urinary frequency' },
    { id: 'urgency', label: 'Urgency', type: 'text', required: true, placeholder: 'Urgency and accidents if any' },
    { id: 'suprapubic_pain', label: 'Suprapubic pain', type: 'text', required: true, placeholder: 'Pain, pressure, tenderness' },
    { id: 'duration', label: 'Duration of symptoms', type: 'text', required: true, placeholder: 'When did this start?' },
    { id: 'previous_uti_history', label: 'Previous UTI history', type: 'textarea', required: true, placeholder: 'Recurrence history and past treatment' },
    { id: 'last_menstrual_period', label: 'Last menstrual period', type: 'date', required: true },
    { id: 'vaginal_discharge', label: 'Vaginal discharge', type: 'text', required: true, placeholder: 'Presence, colour, odour, associated symptoms' },
  ],
  'herpes-zoster': [
    { id: 'rash_onset', label: 'Rash onset date/time', type: 'text', required: true, placeholder: 'When did the rash begin?' },
    { id: 'dermatomal_distribution', label: 'Dermatomal distribution', type: 'text', required: true, placeholder: 'Affected dermatome(s)' },
    { id: 'pain_severity', label: 'Pain severity (0-10)', type: 'number', required: true, placeholder: '0-10' },
    { id: 'vesicle_stage', label: 'Vesicle stage', type: 'text', required: true, placeholder: 'Papules, vesicles, crusting' },
    { id: 'fever', label: 'Fever', type: 'text', required: true, placeholder: 'Temperature or fever symptoms' },
    { id: 'prior_history', label: 'Prior varicella/zoster history', type: 'textarea', required: true, placeholder: 'Chickenpox, shingles, prior antivirals' },
    { id: 'vaccination_status', label: 'Vaccination status', type: 'text', required: true, placeholder: 'Shingrix / varicella history' },
  ],
  'ocp-resupply': [
    { id: 'current_ocp', label: 'Current OCP name & strength', type: 'text', required: true, placeholder: 'Current pill and strength' },
    { id: 'duration_on_current_ocp', label: 'Duration on current OCP', type: 'text', required: true, placeholder: 'How long on this pill?' },
    { id: 'last_gp_review', label: 'Last GP review date', type: 'date', required: true },
    { id: 'blood_pressure', label: 'Blood pressure', type: 'text', required: true, placeholder: 'e.g. 118/74' },
    { id: 'smoking_status', label: 'Smoking status', type: 'text', required: true, placeholder: 'Current, former, never' },
    { id: 'bmi', label: 'BMI', type: 'number', required: true, placeholder: 'BMI value' },
    { id: 'new_medications', label: 'Any new medications', type: 'textarea', required: true, placeholder: 'Recent medication changes' },
    { id: 'breakthrough_bleeding', label: 'Breakthrough bleeding', type: 'text', required: true, placeholder: 'Any new bleeding concerns?' },
  ],
  'travel-medicine': [
    { id: 'destinations', label: 'Destination(s) and regions', type: 'textarea', required: true, placeholder: 'Countries, regions, layovers' },
    { id: 'travel_dates', label: 'Travel dates and duration', type: 'text', required: true, placeholder: 'Departure, return, length of stay' },
    { id: 'travel_type', label: 'Type of travel', type: 'text', required: true, placeholder: 'Urban, rural, trekking, VFR' },
    { id: 'accommodation', label: 'Accommodation type', type: 'text', required: true, placeholder: 'Hotels, hostels, homestay, camping' },
    { id: 'vaccination_history', label: 'Vaccination history', type: 'textarea', required: true, placeholder: 'Routine and travel vaccines' },
    { id: 'current_medications', label: 'Current medications', type: 'textarea', required: true, placeholder: 'Regular medicines and PRN use' },
    { id: 'allergies', label: 'Allergies', type: 'textarea', required: true, placeholder: 'Drug and vaccine allergies' },
    { id: 'pregnancy_status', label: 'Pregnancy status', type: 'text', required: true, placeholder: 'Pregnant, planning, not applicable' },
    { id: 'medical_history', label: 'Relevant medical history', type: 'textarea', required: true, placeholder: 'Cardiac, seizure, psychiatric, immune conditions' },
    { id: 'previous_malaria_prophylaxis', label: 'Previous malaria prophylaxis', type: 'text', required: true, placeholder: 'Agents used, tolerance, adherence' },
  ],
  wound: [
    { id: 'wound_type', label: 'Wound type', type: 'text', required: true, placeholder: 'Laceration, abrasion, burn, etc.' },
    { id: 'location', label: 'Location', type: 'text', required: true, placeholder: 'Body site' },
    { id: 'size_depth', label: 'Size and depth', type: 'text', required: true, placeholder: 'Approximate dimensions and depth' },
    { id: 'time_since_injury', label: 'Time since injury', type: 'text', required: true, placeholder: 'When did it happen?' },
    { id: 'contamination', label: 'Contamination level', type: 'text', required: true, placeholder: 'Clean, dirty, debris present?' },
    { id: 'bleeding_controlled', label: 'Bleeding controlled', type: 'text', required: true, placeholder: 'Yes/no and how controlled' },
    { id: 'tetanus_status', label: 'Tetanus vaccination status', type: 'text', required: true, placeholder: 'Up to date?' },
    { id: 'vascular_risk', label: 'Diabetes or vascular disease', type: 'text', required: true, placeholder: 'Relevant healing risks' },
    { id: 'anticoagulants', label: 'Current medications (anticoagulants)', type: 'text', required: true, placeholder: 'Anticoagulants or antiplatelets' },
  ],
};

const DOCUMENTATION_TEMPLATES: Record<string, string> = {
  uti: [
    'Presentation consistent with uncomplicated UTI in a non-pregnant female.',
    'Symptoms: {{assessment.dysuria}}, frequency {{assessment.frequency}}, urgency {{assessment.urgency}}, suprapubic pain {{assessment.suprapubic_pain}}.',
    'Duration: {{assessment.duration}}. Previous UTI history: {{assessment.previous_uti_history}}.',
    'Exclusions checked: LMP {{assessment.last_menstrual_period}}, vaginal discharge {{assessment.vaginal_discharge}}, sex {{patient.sex}}, pregnancy {{patient.pregnancy}}.',
    'Working diagnosis: {{differentials.workingDiagnosis}}.',
    'Treatment plan: {{treatment.selectedTherapyLabel}}.',
    'Follow-up: {{treatment.followUpPlan}}. Safety net: {{treatment.safetyNet}}.',
  ].join('\n'),
  'herpes-zoster': [
    'Presentation consistent with herpes zoster involving {{assessment.dermatomal_distribution}}.',
    'Rash onset: {{assessment.rash_onset}}. Vesicle stage: {{assessment.vesicle_stage}}. Pain score: {{assessment.pain_severity}}/10.',
    'Fever/systemic features: {{assessment.fever}}. Prior history: {{assessment.prior_history}}. Vaccination: {{assessment.vaccination_status}}.',
    'Working diagnosis: {{differentials.workingDiagnosis}}.',
    'Treatment plan: {{treatment.selectedTherapyLabel}}.',
    'Follow-up: {{treatment.followUpPlan}}. Safety net: {{treatment.safetyNet}}.',
  ].join('\n'),
  'ocp-resupply': [
    'Patient requested OCP resupply for established hormonal contraception.',
    'Current OCP: {{assessment.current_ocp}} for {{assessment.duration_on_current_ocp}}.',
    'Last GP review: {{assessment.last_gp_review}}. BP: {{assessment.blood_pressure}}. BMI: {{assessment.bmi}}. Smoking: {{assessment.smoking_status}}.',
    'Medication changes: {{assessment.new_medications}}. Breakthrough bleeding: {{assessment.breakthrough_bleeding}}.',
    'Working diagnosis / intent: {{differentials.workingDiagnosis}}.',
    'Supply plan: {{treatment.selectedTherapyLabel}}.',
    'Follow-up: {{treatment.followUpPlan}}. Safety net: {{treatment.safetyNet}}.',
  ].join('\n'),
  'travel-medicine': [
    'Travel consultation covering itinerary {{assessment.destinations}} across {{assessment.travel_dates}}.',
    'Travel style: {{assessment.travel_type}}. Accommodation: {{assessment.accommodation}}.',
    'Immunisation history: {{assessment.vaccination_history}}. Medical history: {{assessment.medical_history}}.',
    'Prior malaria prophylaxis: {{assessment.previous_malaria_prophylaxis}}.',
    'Working assessment: {{differentials.workingDiagnosis}}.',
    'Recommended prophylaxis / treatment: {{treatment.selectedTherapyLabel}}.',
    'Follow-up: {{treatment.followUpPlan}}. Safety net: {{treatment.safetyNet}}.',
  ].join('\n'),
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function humanizeFieldId(id: string) {
  return id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeFieldId(label: string) {
  return slugify(label).replace(/-/g, '_');
}

function getFieldType(label: string): FieldType {
  const value = label.toLowerCase();
  if (value.includes('date')) return 'date';
  if (value.includes('pressure') || value.includes('score') || value.includes('bmi') || value.includes('age')) return 'number';
  if (value.includes('history') || value.includes('medications') || value.includes('allergies') || value.includes('destination') || value.includes('notes')) return 'textarea';
  return 'text';
}

function getFieldDefinitions(condition: Condition): FieldDefinition[] {
  const explicit = FIELD_DEFINITIONS[condition.id];
  if (explicit) return explicit;

  return condition.assessmentFields.map((label) => ({
    id: normalizeFieldId(label),
    label,
    type: getFieldType(label),
    required: true,
    placeholder: `Enter ${label.toLowerCase()}`,
  }));
}

function calculateAge(dob?: string) {
  if (!dob) return null;
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) age -= 1;
  return age;
}

function buildValidationSchema(condition: Condition, fields: FieldDefinition[]) {
  const assessmentShape = Object.fromEntries(
    fields.map((field) => [
      field.id,
      field.required ? z.string().trim().min(1, `${field.label} is required`) : z.string().optional().default(''),
    ]),
  );

  return z.object({
    conditionSlug: z.string().min(1),
    patient: z.object({
      firstName: z.string().trim().min(1, 'First name is required'),
      lastName: z.string().trim().min(1, 'Last name is required'),
      dob: z.string().trim().min(1, 'Date of birth is required'),
      sex: z.string().trim().min(1, 'Sex is required'),
      pregnancy: z.string().optional().default(''),
      allergies: z.string().optional().default(''),
      medications: z.string().optional().default(''),
      comorbidities: z.string().optional().default(''),
      gpName: z.string().optional().default(''),
      gpClinic: z.string().optional().default(''),
      gpPhone: z.string().optional().default(''),
    }),
    assessment: z.object(assessmentShape),
    redFlagsChecked: z.record(z.boolean()).default({}),
    differentials: z.object({
      workingDiagnosis: z.string().trim().min(1, 'Working diagnosis is required'),
      items: z.array(z.object({
        diagnosis: z.string().trim().min(1, 'Differential diagnosis is required'),
        reasonExcluded: z.string().trim().optional().default(''),
      })).min(1, 'At least one differential is required'),
    }),
    treatment: z.object({
      selectedTherapy: condition.therapyOptions.length > 0 ? z.string().trim().min(1, 'Selected therapy is required') : z.string().optional().default(''),
      deviationJustification: z.string().optional().default(''),
      followUpPlan: z.string().trim().min(1, 'Follow-up plan is required'),
      safetyNet: z.string().trim().min(1, 'Safety net advice is required'),
    }).superRefine((treatment, ctx) => {
      const selected = condition.therapyOptions.find((option) => option.id === treatment.selectedTherapy);
      if (selected && selected.line !== 'first' && !treatment.deviationJustification.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['deviationJustification'], message: 'Deviation justification is required for non-first-line therapy' });
      }
    }),
    documentation: z.object({
      clinicalNotes: z.string().optional().default(''),
      referralNotes: z.string().optional().default(''),
    }),
  }).superRefine((data, ctx) => {
    const age = calculateAge(data.patient.dob);

    if (condition.scopeValidation.sexRestriction && data.patient.sex !== condition.scopeValidation.sexRestriction) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['patient', 'sex'], message: `${condition.name} is limited to ${condition.scopeValidation.sexRestriction} patients` });
    }

    if (condition.scopeValidation.pregnancyExcluded && ['pregnant', 'possibly_pregnant'].includes(data.patient.pregnancy || '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['patient', 'pregnancy'], message: 'Pregnancy excludes this protocol' });
    }

    if (condition.scopeValidation.minAge && age !== null && age < condition.scopeValidation.minAge) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['patient', 'dob'], message: `Minimum age is ${condition.scopeValidation.minAge}` });
    }

    if (condition.scopeValidation.maxAge && age !== null && age > condition.scopeValidation.maxAge) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['patient', 'dob'], message: `Maximum age is ${condition.scopeValidation.maxAge}` });
    }

    if (condition.id === 'uti') {
      if (data.patient.sex && data.patient.sex !== 'female') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['patient', 'sex'], message: 'UTI protocol excludes male patients' });
      }
    }

    if (condition.id === 'ocp-resupply' && !data.assessment.blood_pressure?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['assessment', 'blood_pressure'], message: 'Blood pressure is required before OCP resupply' });
    }
  });
}

function getDocumentationTemplate(condition: Condition) {
  return DOCUMENTATION_TEMPLATES[condition.id] || [
    `Consultation for ${condition.name}.`,
    'Assessment summary: {{assessmentSummary}}.',
    'Working diagnosis: {{differentials.workingDiagnosis}}.',
    'Treatment: {{treatment.selectedTherapyLabel}}.',
    'Follow-up: {{treatment.followUpPlan}}. Safety net: {{treatment.safetyNet}}.',
  ].join('\n');
}

function getCategory(condition: Condition): ConditionCategory {
  return condition.classification as ConditionCategory;
}

export function evaluateScopeChecks(condition: ConsultationCondition, patient: Record<string, string>) {
  const age = calculateAge(patient.dob);
  return [
    {
      label: 'Age within range',
      pass: age === null ? true : (!condition.scopeValidation.minAge || age >= condition.scopeValidation.minAge) && (!condition.scopeValidation.maxAge || age <= condition.scopeValidation.maxAge),
      detail: condition.scopeValidation.minAge
        ? `${condition.scopeValidation.minAge}${condition.scopeValidation.maxAge ? `–${condition.scopeValidation.maxAge}` : '+'}`
        : 'No restriction',
    },
    {
      label: 'Sex eligibility',
      pass: !condition.scopeValidation.sexRestriction || patient.sex === condition.scopeValidation.sexRestriction,
      detail: condition.scopeValidation.sexRestriction ? `${condition.scopeValidation.sexRestriction} only` : 'No restriction',
    },
    {
      label: 'Pregnancy exclusion',
      pass: !condition.scopeValidation.pregnancyExcluded || ['not_pregnant', 'not_applicable', ''].includes(patient.pregnancy || ''),
      detail: condition.scopeValidation.pregnancyExcluded ? 'Excluded' : 'Not excluded',
    },
    {
      label: 'Jurisdiction authority',
      pass: true,
      detail: condition.scopeValidation.jurisdictionNotes || 'Victorian Community Pharmacist Prescriber',
    },
  ] as ScopeCheckResult[];
}

export function getAssessmentFieldLabel(condition: ConsultationCondition, fieldId: string) {
  return condition.template.assessmentFields.find((field) => field.id === fieldId)?.label || humanizeFieldId(fieldId);
}

export function renderDocumentationTemplate(
  condition: ConsultationCondition,
  values: {
    patient: Record<string, string>;
    assessment: Record<string, string>;
    differentials: { workingDiagnosis: string; items: { diagnosis: string; reasonExcluded: string }[] };
    treatment: Record<string, string>;
    selectedTherapyLabel?: string;
    assessmentSummary?: string;
  },
) {
  const assessmentSummary = values.assessmentSummary || condition.template.assessmentFields
    .map((field) => `${field.label}: ${values.assessment[field.id] || 'Not documented'}`)
    .join('; ');

  const replacementMap: Record<string, string> = {
    assessmentSummary,
    'differentials.workingDiagnosis': values.differentials.workingDiagnosis || 'Not documented',
    'treatment.selectedTherapyLabel': values.selectedTherapyLabel || 'No therapy selected',
    'treatment.followUpPlan': values.treatment.followUpPlan || 'Not documented',
    'treatment.safetyNet': values.treatment.safetyNet || 'Not documented',
  };

  for (const [key, value] of Object.entries(values.patient)) replacementMap[`patient.${key}`] = value || 'Not documented';
  for (const [key, value] of Object.entries(values.assessment)) replacementMap[`assessment.${key}`] = value || 'Not documented';
  for (const [key, value] of Object.entries(values.treatment)) replacementMap[`treatment.${key}`] = value || 'Not documented';

  return condition.template.documentationTemplate.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, token) => replacementMap[token] || 'Not documented');
}

export const CONDITION_REGISTRY: ConsultationCondition[] = BASE_CONDITIONS.map((condition, index) => {
  const assessmentFields = getFieldDefinitions(condition);
  const slug = SLUG_OVERRIDES[condition.id] || slugify(condition.id);
  const category = getCategory(condition);

  return {
    ...condition,
    slug,
    category,
    classification: category,
    redFlagCount: condition.redFlags.length,
    treatmentOptionCount: condition.therapyOptions.length,
    template: {
      steps: DEFAULT_STEPS.map((step) => {
        if (step.key === 'assessment' && condition.id === 'travel-medicine') return { ...step, label: 'Itinerary & Risk Review' };
        if (step.key === 'treatment' && condition.id === 'travel-medicine') return { ...step, label: 'Prophylaxis & Plan' };
        if (step.key === 'assessment' && condition.id === 'uti') return { ...step, label: 'UTI Assessment' };
        if (step.key === 'treatment' && condition.id === 'uti') return { ...step, label: 'Antibiotic Plan' };
        return step;
      }),
      validationSchema: buildValidationSchema(condition, assessmentFields),
      redFlags: condition.redFlags,
      assessmentFields,
      treatmentOptions: condition.therapyOptions,
      documentationTemplate: getDocumentationTemplate(condition),
    },
    enabled: true,
    pinned: PINNED_CONDITIONS.has(condition.id),
    sortOrder: PINNED_CONDITIONS.has(condition.id) ? index : index + 100,
  };
}).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

export function getConditionBySlug(slug?: string | null) {
  return CONDITION_REGISTRY.find((condition) => condition.slug === slug);
}

export function getConditionById(id: string) {
  return CONDITION_REGISTRY.find((condition) => condition.id === id || condition.slug === id);
}

export function getConditionsByCategory(category: ConditionCategory) {
  return CONDITION_REGISTRY.filter((condition) => condition.category === category);
}

export function getPinnedConditions() {
  return CONDITION_REGISTRY.filter((condition) => condition.pinned);
}
