import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { transitionConsult, type ConsultStatus } from '@/lib/consultStateMachine';
import { useAutosave } from '@/hooks/useAutosave';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useConsultAudit } from '@/hooks/useConsultAudit';
import { evaluateSafety } from '@/lib/safetyEngine';
import { supabase } from '@/integrations/supabase/client';
import type { SafetyOverride, SafetyResult } from '@/types/safety';
import type { ConsultationStep } from '@/types/clinical';
import type { ValidationResult } from '@/components/ConsultationValidation';
import { evaluateScopeChecks, getConditionById, getConditionBySlug, type ConsultationCondition } from '@/lib/conditionRegistry';

const DRAFT_KEY = 'chemistcare_consultation_draft';
export const RECENT_CONDITIONS_KEY = 'chemistcare_recent_conditions';

export interface ConsultationStepData {
  patient: Record<string, string>;
  assessment: Record<string, string>;
  differentials: {
    workingDiagnosis: string;
    items: { diagnosis: string; reasonExcluded: string }[];
  };
  treatment: Record<string, string>;
  documentation: Record<string, string>;
}

export interface ConsultationDraft {
  version: 2;
  legacy: boolean;
  conditionSlug: string;
  templateVersion: string;
  currentStep: ConsultationStep;
  consultStatus: ConsultStatus;
  stepData: ConsultationStepData;
  redFlagsChecked: Record<string, boolean>;
  pinnedEvidence: { question: string; answer: string; sources: string[] }[];
  noteHeadings: string[];
  validationState: Partial<Record<ConsultationStep, ValidationResult>>;
  auditTrail: { type: string; at: string; metadata?: Record<string, unknown> }[];
  safetyOverride?: SafetyOverride;
}

function createEmptyDraft(conditionSlug = ''): ConsultationDraft {
  return {
    version: 2,
    legacy: false,
    conditionSlug,
    templateVersion: 'condition-protocol-v1',
    currentStep: 'patient',
    consultStatus: 'draft',
    stepData: {
      patient: {},
      assessment: {},
      differentials: { workingDiagnosis: '', items: [{ diagnosis: '', reasonExcluded: '' }] },
      treatment: {},
      documentation: {},
    },
    redFlagsChecked: {},
    pinnedEvidence: [],
    noteHeadings: [],
    validationState: {},
    auditTrail: [],
  };
}

function normalizeLegacyDraft(value: any): ConsultationDraft {
  if (value?.version === 2) return value as ConsultationDraft;

  const resolvedCondition = value?.selectedCondition ? getConditionById(value.selectedCondition) : undefined;
  const resolvedSlug = resolvedCondition?.slug || value?.selectedCondition || '';

  return {
    ...createEmptyDraft(resolvedSlug),
    legacy: !resolvedSlug,
    conditionSlug: resolvedSlug,
    currentStep: value?.currentStep || 'patient',
    stepData: {
      patient: Object.fromEntries(Object.entries(value?.formData || {}).filter(([key]) => [
        'firstName', 'lastName', 'dob', 'sex', 'pregnancy', 'allergies', 'medications', 'comorbidities', 'gpName', 'gpClinic', 'gpPhone',
      ].includes(key))),
      assessment: Object.fromEntries(
        Object.entries(value?.formData || {})
          .filter(([key]) => key.startsWith('assess_'))
          .map(([key, entryValue]) => [key.replace(/^assess_/, ''), entryValue]),
      ),
      differentials: {
        workingDiagnosis: value?.formData?.workingDiagnosis || '',
        items: value?.differentials?.length ? value.differentials : [{ diagnosis: '', reasonExcluded: '' }],
      },
      treatment: {
        selectedTherapy: value?.formData?.selectedTherapy || '',
        deviationJustification: value?.formData?.deviationJustification || '',
        followUpPlan: value?.formData?.followUpPlan || '',
        safetyNet: value?.formData?.safetyNet || '',
      },
      documentation: {
        clinicalNotes: value?.formData?.clinicalNotes || '',
        referralNotes: value?.formData?.referralNotes || '',
      },
    },
    redFlagsChecked: value?.redFlagsChecked || {},
    pinnedEvidence: value?.pinnedEvidence || [],
    noteHeadings: value?.noteHeadings || [],
    safetyOverride: value?.safetyOverride,
  };
}

function flattenStepData(stepData: ConsultationStepData) {
  const formData: Record<string, string> = { ...stepData.patient, ...stepData.treatment, ...stepData.documentation };
  Object.entries(stepData.assessment).forEach(([key, value]) => {
    formData[`assess_${key}`] = value;
  });
  formData.workingDiagnosis = stepData.differentials.workingDiagnosis;
  return formData;
}

function isPatientDataEntered(patient: Record<string, string>) {
  return ['firstName', 'lastName', 'dob', 'sex'].some((key) => !!patient[key]);
}

function getMissingIssuesForStep(step: ConsultationStep, condition: ConsultationCondition | undefined, draft: ConsultationDraft): ValidationResult {
  if (!condition) return { complete: false, missing: ['Condition selection'], total: 1, filled: 0 };

  const payload = {
    conditionSlug: draft.conditionSlug,
    patient: {
      firstName: draft.stepData.patient.firstName || '',
      lastName: draft.stepData.patient.lastName || '',
      dob: draft.stepData.patient.dob || '',
      sex: draft.stepData.patient.sex || '',
      pregnancy: draft.stepData.patient.pregnancy || '',
      allergies: draft.stepData.patient.allergies || '',
      medications: draft.stepData.patient.medications || '',
      comorbidities: draft.stepData.patient.comorbidities || '',
      gpName: draft.stepData.patient.gpName || '',
      gpClinic: draft.stepData.patient.gpClinic || '',
      gpPhone: draft.stepData.patient.gpPhone || '',
    },
    assessment: draft.stepData.assessment,
    redFlagsChecked: draft.redFlagsChecked,
    differentials: {
      workingDiagnosis: draft.stepData.differentials.workingDiagnosis || '',
      items: draft.stepData.differentials.items.filter((item) => item.diagnosis.trim()),
    },
    treatment: {
      selectedTherapy: draft.stepData.treatment.selectedTherapy || '',
      deviationJustification: draft.stepData.treatment.deviationJustification || '',
      followUpPlan: draft.stepData.treatment.followUpPlan || '',
      safetyNet: draft.stepData.treatment.safetyNet || '',
    },
    documentation: {
      clinicalNotes: draft.stepData.documentation.clinicalNotes || '',
      referralNotes: draft.stepData.documentation.referralNotes || '',
    },
  };

  const result = condition.template.validationSchema.safeParse(payload);
  const issues = result.success ? [] : result.error.issues;
  const filterIssuePaths = (paths: string[]) => issues.filter((issue) => paths.includes(issue.path[0]?.toString() || ''));

  switch (step) {
    case 'patient': {
      const required = ['firstName', 'lastName', 'dob', 'sex'];
      const missing = required.filter((field) => !draft.stepData.patient[field]);
      return { complete: missing.length === 0, missing: missing.map((field) => field.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())), total: required.length, filled: required.length - missing.length };
    }
    case 'assessment': {
      const missing = condition.template.assessmentFields
        .filter((field) => field.required && !draft.stepData.assessment[field.id])
        .map((field) => field.label);
      if (Object.values(draft.redFlagsChecked).some(Boolean) && !draft.stepData.documentation.referralNotes) missing.push('Referral documentation');
      return {
        complete: missing.length === 0,
        missing,
        total: condition.template.assessmentFields.filter((field) => field.required).length + (Object.values(draft.redFlagsChecked).some(Boolean) ? 1 : 0),
        filled: condition.template.assessmentFields.filter((field) => field.required && draft.stepData.assessment[field.id]).length + (draft.stepData.documentation.referralNotes ? 1 : 0),
      };
    }
    case 'differentials': {
      const missing: string[] = [];
      if (!draft.stepData.differentials.workingDiagnosis) missing.push('Working diagnosis');
      if (!draft.stepData.differentials.items.some((item) => item.diagnosis.trim())) missing.push('At least one differential');
      return { complete: missing.length === 0, missing, total: 2, filled: 2 - missing.length };
    }
    case 'scope': {
      const scopeIssues = filterIssuePaths(['patient']);
      const scopeChecks = evaluateScopeChecks(condition, draft.stepData.patient);
      const missing = [
        ...scopeIssues.map((issue) => issue.message),
        ...scopeChecks.filter((check) => !check.pass).map((check) => check.label),
      ];
      return { complete: missing.length === 0, missing, total: scopeChecks.length, filled: scopeChecks.filter((check) => check.pass).length };
    }
    case 'treatment': {
      const treatmentIssues = filterIssuePaths(['treatment']);
      const missing = treatmentIssues.map((issue) => issue.message);
      return { complete: missing.length === 0, missing, total: condition.therapyOptions.length > 0 ? 3 : 2, filled: (condition.therapyOptions.length > 0 ? 3 : 2) - missing.length };
    }
    case 'documentation':
      return { complete: true, missing: [], total: 0, filled: 0 };
    default:
      return { complete: false, missing: [], total: 0, filled: 0 };
  }
}

export function getRecentConditionSlugs() {
  if (typeof window === 'undefined') return [] as string[];
  try {
    return JSON.parse(localStorage.getItem(RECENT_CONDITIONS_KEY) || '[]') as string[];
  } catch {
    return [] as string[];
  }
}

function saveRecentConditionSlug(slug: string) {
  if (typeof window === 'undefined' || !slug) return;
  const next = [slug, ...getRecentConditionSlugs().filter((entry) => entry !== slug)].slice(0, 5);
  localStorage.setItem(RECENT_CONDITIONS_KEY, JSON.stringify(next));
}

export function useConsultation(conditionSlug?: string) {
  const condition = useMemo(() => getConditionBySlug(conditionSlug), [conditionSlug]);
  const [draft, setDraft] = useState<ConsultationDraft>(() => createEmptyDraft(conditionSlug || ''));
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [consultId, setConsultId] = useState<string | undefined>();
  const [finalisedAt, setFinalisedAt] = useState<string | undefined>();
  const [attemptedProgress, setAttemptedProgress] = useState(false);
  const [safetyResult, setSafetyResult] = useState<SafetyResult>({ score: 100, alerts: [], blockers: [] });
  const { logEvent } = useConsultAudit();
  const prevBlockerCount = useRef(0);

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      conditionSlug: conditionSlug || current.conditionSlug || '',
      templateVersion: condition ? `${condition.slug}-v1` : current.templateVersion,
    }));
  }, [conditionSlug, condition]);

  const formData = useMemo(() => flattenStepData(draft.stepData), [draft.stepData]);
  const hasRedFlagTriggered = useMemo(() => Object.values(draft.redFlagsChecked).some(Boolean), [draft.redFlagsChecked]);

  const isDirty = useMemo(() => draft.consultStatus !== 'finalised' && draft.consultStatus !== 'discarded' && (
    isPatientDataEntered(draft.stepData.patient)
    || !!draft.conditionSlug
    || draft.stepData.differentials.items.some((item) => item.diagnosis.trim())
    || draft.stepData.documentation.clinicalNotes?.trim()
  ), [draft]);

  const { lastSaved, isSaving, loadDraft, clearDraft, hasDraft } = useAutosave(DRAFT_KEY, draft, isLoaded && isDirty);
  useNavigationGuard(isDirty, 'You have unsaved consultation data. Are you sure you want to leave?');

  useEffect(() => {
    if (hasDraft()) setShowDraftPrompt(true);
    setIsLoaded(true);
  }, [hasDraft]);

  useEffect(() => {
    const allergies = formData.allergies ? formData.allergies.split(',').map((item) => item.trim()).filter(Boolean) : [];
    const currentMeds = formData.medications ? formData.medications.split(',').map((item) => item.trim()).filter(Boolean) : [];
    const selectedTreatments = [] as string[];
    if (condition && draft.stepData.treatment.selectedTherapy) {
      const therapy = condition.therapyOptions.find((item) => item.id === draft.stepData.treatment.selectedTherapy);
      if (therapy) selectedTreatments.push(therapy.medicineName);
    }

    const result = evaluateSafety({ allergies, currentMeds, selectedTreatments, sex: formData.sex, pregnancyStatus: formData.pregnancy });
    setSafetyResult(result);

    if (result.blockers.length > 0 && prevBlockerCount.current === 0) {
      logEvent(consultId || 'draft', 'safety_blocker_triggered', { metadata: { blockerCount: result.blockers.length, blockerTitles: result.blockers.map((blocker) => blocker.title) } });
    }
    prevBlockerCount.current = result.blockers.length;

    if (result.blockers.length === 0 && draft.safetyOverride) {
      setDraft((current) => ({ ...current, safetyOverride: undefined }));
    }
  }, [consultId, condition, draft.safetyOverride, draft.stepData.treatment.selectedTherapy, formData.allergies, formData.medications, formData.pregnancy, formData.sex, logEvent]);

  const getStepValidation = useCallback((step: ConsultationStep) => getMissingIssuesForStep(step, condition, draft), [condition, draft]);

  const validationState = useMemo(() => ({
    patient: getStepValidation('patient'),
    assessment: getStepValidation('assessment'),
    differentials: getStepValidation('differentials'),
    scope: getStepValidation('scope'),
    treatment: getStepValidation('treatment'),
    documentation: getStepValidation('documentation'),
  }), [getStepValidation]);

  const updateDraft = useCallback((updater: (current: ConsultationDraft) => ConsultationDraft) => {
    setDraft((current) => {
      const next = updater(current);
      return {
        ...next,
        auditTrail: [...next.auditTrail, { type: 'draft_saved', at: new Date().toISOString() }].slice(-50),
      };
    });
  }, []);

  const updatePatientField = useCallback((field: string, value: string) => {
    updateDraft((current) => ({
      ...current,
      stepData: { ...current.stepData, patient: { ...current.stepData.patient, [field]: value } },
    }));
  }, [updateDraft]);

  const updateAssessmentField = useCallback((field: string, value: string) => {
    updateDraft((current) => ({
      ...current,
      stepData: { ...current.stepData, assessment: { ...current.stepData.assessment, [field]: value } },
    }));
  }, [updateDraft]);

  const updateTreatmentField = useCallback((field: string, value: string) => {
    updateDraft((current) => ({
      ...current,
      stepData: { ...current.stepData, treatment: { ...current.stepData.treatment, [field]: value } },
    }));
  }, [updateDraft]);

  const updateDocumentationField = useCallback((field: string, value: string) => {
    updateDraft((current) => ({
      ...current,
      stepData: { ...current.stepData, documentation: { ...current.stepData.documentation, [field]: value } },
    }));
  }, [updateDraft]);

  const setWorkingDiagnosis = useCallback((value: string) => {
    updateDraft((current) => ({
      ...current,
      stepData: { ...current.stepData, differentials: { ...current.stepData.differentials, workingDiagnosis: value } },
    }));
  }, [updateDraft]);

  const setDifferentials = useCallback((items: { diagnosis: string; reasonExcluded: string }[]) => {
    updateDraft((current) => ({
      ...current,
      stepData: { ...current.stepData, differentials: { ...current.stepData.differentials, items } },
    }));
  }, [updateDraft]);

  const toggleRedFlag = useCallback((flagId: string) => {
    updateDraft((current) => ({
      ...current,
      redFlagsChecked: { ...current.redFlagsChecked, [flagId]: !current.redFlagsChecked[flagId] },
    }));
  }, [updateDraft]);

  const setCurrentStep = useCallback((step: ConsultationStep) => {
    setDraft((current) => ({ ...current, currentStep: step }));
  }, []);

  const restoreDraft = useCallback(() => {
    const saved = loadDraft();
    const normalized = saved ? normalizeLegacyDraft(saved) : undefined;
    if (normalized) setDraft(normalized);
    setShowDraftPrompt(false);
    return normalized;
  }, [loadDraft]);

  const discardDraft = useCallback(() => {
    clearDraft();
    setShowDraftPrompt(false);
    setDraft(createEmptyDraft(conditionSlug || ''));
  }, [clearDraft, conditionSlug]);

  const resetConsult = useCallback(() => {
    clearDraft();
    setConsultId(undefined);
    setFinalisedAt(undefined);
    setAttemptedProgress(false);
    setDraft(createEmptyDraft(conditionSlug || ''));
  }, [clearDraft, conditionSlug]);

  const applySafetyOverride = useCallback((override: SafetyOverride) => {
    setDraft((current) => ({ ...current, safetyOverride: override }));
    logEvent(consultId || 'draft', 'safety_override_applied', { metadata: { reason: override.reason, blockerCount: safetyResult.blockers.length } });
  }, [consultId, logEvent, safetyResult.blockers.length]);

  const addPinnedEvidence = useCallback((evidence: { question: string; answer: string; sources: string[] }) => {
    setDraft((current) => ({ ...current, pinnedEvidence: [...current.pinnedEvidence, evidence] }));
    if (consultId) logEvent(consultId, 'evidence_pinned', { metadata: { question: evidence.question } });
  }, [consultId, logEvent]);

  const addNoteHeading = useCallback((heading: string) => {
    setDraft((current) => ({
      ...current,
      noteHeadings: current.noteHeadings.includes(heading) ? current.noteHeadings : [...current.noteHeadings, heading],
    }));
  }, []);

  const hasSafetyBlock = safetyResult.blockers.length > 0 && !draft.safetyOverride;
  const canChangeCondition = !isPatientDataEntered(draft.stepData.patient);

  const handleFinalise = useCallback(async () => {
    if (!condition) return { success: false, error: 'No consultation type selected.' };
    if (hasSafetyBlock) return { success: false, error: 'Safety blockers must be resolved or overridden before finalising.' };

    const nextStatus = transitionConsult(draft.consultStatus, 'SUBMIT') || transitionConsult(draft.consultStatus, 'VALIDATE');
    if (!nextStatus && draft.consultStatus !== 'draft') {
      return { success: false, error: `Cannot finalise from status: ${draft.consultStatus}` };
    }

    setDraft((current) => ({ ...current, consultStatus: 'submitting' }));

    try {
      const consultData = {
        status: 'finalised',
        patient_first_name: draft.stepData.patient.firstName || null,
        patient_last_name: draft.stepData.patient.lastName || null,
        patient_dob: draft.stepData.patient.dob || null,
        patient_sex: draft.stepData.patient.sex || null,
        patient_pregnancy_status: draft.stepData.patient.pregnancy || null,
        patient_allergies: draft.stepData.patient.allergies || null,
        patient_medications: draft.stepData.patient.medications || null,
        patient_comorbidities: draft.stepData.patient.comorbidities || null,
        gp_name: draft.stepData.patient.gpName || null,
        gp_clinic: draft.stepData.patient.gpClinic || null,
        gp_phone: draft.stepData.patient.gpPhone || null,
        condition_id: condition.id,
        condition_name: condition.name,
        red_flags_checked: draft.redFlagsChecked,
        red_flag_triggered: hasRedFlagTriggered,
        referral_notes: draft.stepData.documentation.referralNotes || null,
        assessment_data: {
          ...draft.stepData.assessment,
          __conditionSlug: draft.conditionSlug,
          __templateVersion: draft.templateVersion,
        },
        working_diagnosis: draft.stepData.differentials.workingDiagnosis || null,
        differentials: draft.stepData.differentials.items.filter((item) => item.diagnosis.trim()),
        selected_therapy_id: draft.stepData.treatment.selectedTherapy || null,
        deviation_justification: draft.stepData.treatment.deviationJustification || null,
        follow_up_plan: draft.stepData.treatment.followUpPlan || null,
        safety_net_advice: draft.stepData.treatment.safetyNet || null,
        clinical_notes: draft.stepData.documentation.clinicalNotes || null,
        pinned_evidence: draft.pinnedEvidence,
        finalised_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase.from('consultations') as any).insert(consultData).select('id, finalised_at').single();
      if (error) throw error;

      setConsultId(data.id);
      setFinalisedAt(data.finalised_at);
      saveRecentConditionSlug(condition.slug);
      setDraft((current) => ({ ...current, consultStatus: 'finalised' }));
      await logEvent(data.id, 'finalise_succeeded');
      clearDraft();
      return { success: true, consultId: data.id };
    } catch (error: any) {
      setDraft((current) => ({ ...current, consultStatus: 'validated' }));
      if (consultId) await logEvent(consultId, 'finalise_failed', { errorReason: error?.message || 'Unknown error' });
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }, [clearDraft, condition, consultId, draft, hasRedFlagTriggered, hasSafetyBlock, logEvent]);

  return {
    consultId,
    finalisedAt,
    condition,
    draft: { ...draft, validationState },
    formData,
    isLoaded,
    isSaving,
    lastSaved,
    attemptedProgress,
    setAttemptedProgress,
    showDraftPrompt,
    setShowDraftPrompt,
    restoreDraft,
    discardDraft,
    resetConsult,
    currentStep: draft.currentStep,
    setCurrentStep,
    updatePatientField,
    updateAssessmentField,
    updateTreatmentField,
    updateDocumentationField,
    setWorkingDiagnosis,
    setDifferentials,
    toggleRedFlag,
    hasRedFlagTriggered,
    validationState,
    getStepValidation,
    safetyResult,
    hasSafetyBlock,
    applySafetyOverride,
    addPinnedEvidence,
    addNoteHeading,
    canChangeCondition,
    handleFinalise,
    pinnedEvidence: draft.pinnedEvidence,
    noteHeadings: draft.noteHeadings,
  };
}
