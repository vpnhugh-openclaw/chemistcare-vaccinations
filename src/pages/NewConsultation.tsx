import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CONDITIONS, getConditionById } from '@/data/conditions';
import { CONSULTATION_STEPS, ConsultationStep } from '@/types/clinical';
import { useAutosave } from '@/hooks/useAutosave';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { validateStep, StepChecklist, SaveStatus } from '@/components/ConsultationValidation';
import { FormPageSkeleton } from '@/components/PageSkeleton';
import { ConsultStatusBar } from '@/components/consult/ConsultStatusBar';
import { LiveNotePreview } from '@/components/consult/LiveNotePreview';
import { EvidenceDrawer } from '@/components/consult/EvidenceDrawer';
import { ScribeRecorder } from '@/components/scribe/ScribeRecorder';
import { ReviewPanel } from '@/components/consult/ReviewPanel';
import { ConsultStatus, transitionConsult } from '@/lib/consultStateMachine';
import { useConsultAudit } from '@/hooks/useConsultAudit';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle, CheckCircle, XCircle, ChevronRight, ChevronLeft,
  Shield, Pill, FileText, User, Stethoscope, Brain, Lock, RotateCcw, Trash2,
} from 'lucide-react';
import { CalculatorsDialog } from '@/components/CalculatorsDialog';
import { AnatomyDialog } from '@/components/AnatomyDialog';

import { TagInput, parseTagString, tagsToString } from '@/components/ui/tag-input';

const DRAFT_KEY = 'chemistcare_consultation_draft';

interface DraftState {
  formData: Record<string, string>;
  selectedCondition: string;
  redFlagsChecked: Record<string, boolean>;
  differentials: { diagnosis: string; reasonExcluded: string }[];
  currentStep: ConsultationStep;
  pinnedEvidence: { question: string; answer: string; sources: string[] }[];
}

const NewConsultation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logEvent } = useConsultAudit();

  const [currentStep, setCurrentStep] = useState<ConsultationStep>('patient');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || '');
  const [redFlagsChecked, setRedFlagsChecked] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [differentials, setDifferentials] = useState([{ diagnosis: '', reasonExcluded: '' }]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [consultStatus, setConsultStatus] = useState<ConsultStatus>('draft');
  const [consultId, setConsultId] = useState<string | undefined>();
  const [finalisedAt, setFinalisedAt] = useState<string | undefined>();
  const [pinnedEvidence, setPinnedEvidence] = useState<{ question: string; answer: string; sources: string[] }[]>([]);
  const [attemptedProgress, setAttemptedProgress] = useState(false);

  const condition = useMemo(() => getConditionById(selectedCondition), [selectedCondition]);
  const stepIndex = CONSULTATION_STEPS.findIndex(s => s.key === currentStep);
  const hasRedFlagTriggered = Object.values(redFlagsChecked).some(Boolean);
  const canProceedFromAssessment = !hasRedFlagTriggered;

  // Draft state for autosave
  const draftState: DraftState = useMemo(() => ({
    formData, selectedCondition, redFlagsChecked, differentials, currentStep, pinnedEvidence,
  }), [formData, selectedCondition, redFlagsChecked, differentials, currentStep, pinnedEvidence]);

  const isDirty = useMemo(() => {
    return consultStatus !== 'finalised' && consultStatus !== 'discarded' &&
      (Object.keys(formData).length > 0 || selectedCondition !== '' || differentials.some(d => d.diagnosis.trim()));
  }, [formData, selectedCondition, differentials, consultStatus]);

  const { lastSaved, isSaving, loadDraft, clearDraft, hasDraft } = useAutosave(DRAFT_KEY, draftState, isLoaded && isDirty);

  // Navigation guard
  useNavigationGuard(isDirty, 'You have unsaved consultation data. Are you sure you want to leave?');

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleNextStep();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentStep, formData, selectedCondition]);

  // Load draft on mount
  useEffect(() => {
    if (hasDraft()) {
      setShowDraftPrompt(true);
    }
    setIsLoaded(true);
  }, []);

  const restoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (draft) {
      setFormData(draft.formData || {});
      setSelectedCondition(draft.selectedCondition || '');
      setRedFlagsChecked(draft.redFlagsChecked || {});
      setDifferentials(draft.differentials?.length ? draft.differentials : [{ diagnosis: '', reasonExcluded: '' }]);
      setCurrentStep(draft.currentStep || 'patient');
      setPinnedEvidence(draft.pinnedEvidence || []);
    }
    setShowDraftPrompt(false);
  }, [loadDraft]);

  const discardDraft = useCallback(() => {
    clearDraft();
    setShowDraftPrompt(false);
  }, [clearDraft]);

  const updateField = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));
  const toggleRedFlag = (id: string) => setRedFlagsChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const stepIcons: Record<ConsultationStep, typeof User> = {
    patient: User, assessment: Stethoscope, differentials: Brain,
    scope: Shield, treatment: Pill, documentation: FileText,
  };

  const getStepStatus = (step: ConsultationStep) => {
    const idx = CONSULTATION_STEPS.findIndex(s => s.key === step);
    if (idx < stepIndex) return 'complete';
    if (idx === stepIndex) return 'active';
    if (step === 'assessment' && hasRedFlagTriggered) return 'blocked';
    return 'pending';
  };

  const getStepValidation = (step: ConsultationStep) => {
    return validateStep(step, formData, condition, redFlagsChecked, differentials);
  };

  // Compute all validation blockers for status bar
  const validationBlockers = useMemo(() => {
    const blockers: string[] = [];
    CONSULTATION_STEPS.forEach(s => {
      const v = getStepValidation(s.key);
      blockers.push(...v.missing);
    });
    return blockers;
  }, [formData, condition, redFlagsChecked, differentials]);

  const handleNextStep = () => {
    const steps = CONSULTATION_STEPS;
    const currentIdx = steps.findIndex(s => s.key === currentStep);
    const validation = getStepValidation(currentStep);

    if (!validation.complete && currentStep === 'patient') {
      setAttemptedProgress(true);
      toast({
        title: 'Required fields missing',
        description: validation.missing.join(', '),
        variant: 'destructive',
      });
      return;
    }

    if (currentIdx < steps.length - 1) {
      // For assessment step, check red flag blocking
      if (currentStep === 'assessment' && hasRedFlagTriggered) {
        setCurrentStep('documentation');
        return;
      }
      setCurrentStep(steps[currentIdx + 1].key);
    }
  };

  const handlePinEvidence = (evidence: { question: string; answer: string; sources: string[] }) => {
    setPinnedEvidence(prev => [...prev, evidence]);
    toast({ title: 'Evidence pinned to consult' });
    if (consultId) {
      logEvent(consultId, 'evidence_pinned', { metadata: { question: evidence.question } });
    }
  };

  const handleFinalise = async (): Promise<{ success: boolean; consultId?: string; error?: string }> => {
    // Transition: draft/validated → submitting
    const nextStatus = transitionConsult(consultStatus, 'SUBMIT') || transitionConsult(consultStatus, 'VALIDATE');
    if (!nextStatus && consultStatus !== 'draft') {
      return { success: false, error: `Cannot finalise from status: ${consultStatus}` };
    }

    setConsultStatus('submitting');

    try {
      const consultData = {
        status: 'finalised',
        patient_first_name: formData.firstName || null,
        patient_last_name: formData.lastName || null,
        patient_dob: formData.dob || null,
        patient_sex: formData.sex || null,
        patient_pregnancy_status: formData.pregnancy || null,
        patient_allergies: formData.allergies || null,
        patient_medications: formData.medications || null,
        patient_comorbidities: formData.comorbidities || null,
        gp_name: formData.gpName || null,
        gp_clinic: formData.gpClinic || null,
        gp_phone: formData.gpPhone || null,
        condition_id: selectedCondition || null,
        condition_name: condition?.name || null,
        red_flags_checked: redFlagsChecked,
        red_flag_triggered: hasRedFlagTriggered,
        referral_notes: formData.referralNotes || null,
        assessment_data: Object.fromEntries(
          Object.entries(formData).filter(([k]) => k.startsWith('assess_'))
        ),
        working_diagnosis: formData.workingDiagnosis || null,
        differentials: differentials.filter(d => d.diagnosis.trim()),
        selected_therapy_id: formData.selectedTherapy || null,
        deviation_justification: formData.deviationJustification || null,
        follow_up_plan: formData.followUpPlan || null,
        safety_net_advice: formData.safetyNet || null,
        clinical_notes: formData.clinicalNotes || null,
        pinned_evidence: pinnedEvidence,
        finalised_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase.from('consultations') as any)
        .insert(consultData)
        .select('id, finalised_at')
        .single();

      if (error) throw error;

      const newId = data.id;
      setConsultId(newId);
      setFinalisedAt(data.finalised_at);
      setConsultStatus('finalised');

      // Audit
      await logEvent(newId, 'finalise_succeeded');

      // Clear draft
      clearDraft();

      return { success: true, consultId: newId };
    } catch (err: any) {
      setConsultStatus('validated');
      const errorMsg = err?.message || 'Unknown error';

      if (consultId) {
        await logEvent(consultId, 'finalise_failed', { errorReason: errorMsg });
      }

      return { success: false, error: errorMsg };
    }
  };

  const handleDiscard = () => {
    // Clear all state
    setFormData({});
    setSelectedCondition('');
    setRedFlagsChecked({});
    setDifferentials([{ diagnosis: '', reasonExcluded: '' }]);
    setCurrentStep('patient');
    setPinnedEvidence([]);
    setConsultStatus('draft');
    setConsultId(undefined);
    setFinalisedAt(undefined);
    setAttemptedProgress(false);
    clearDraft();

    if (consultId) {
      logEvent(consultId, 'draft_discarded');
    }
  };

  if (!isLoaded) return <ClinicalLayout><FormPageSkeleton /></ClinicalLayout>;

  return (
    <ClinicalLayout>
      {/* Sticky status bar */}
      <ConsultStatusBar
        status={consultStatus}
        currentStep={currentStep}
        conditionName={condition?.name}
        lastSaved={lastSaved}
        isSaving={isSaving}
        validationBlockers={validationBlockers}
      />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6.5rem)]">
        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-3xl space-y-5 animate-fade-in">

            {/* Draft restore prompt */}
            {showDraftPrompt && (
              <Card className="border-accent/40 bg-accent/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">Unsaved draft found</p>
                      <p className="text-xs text-muted-foreground">Would you like to resume your previous consultation?</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={discardDraft} className="gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" /> Discard
                    </Button>
                    <Button size="sm" onClick={restoreDraft} className="gap-1.5">
                      <RotateCcw className="h-3.5 w-3.5" /> Restore Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step indicator + tools */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {CONSULTATION_STEPS.map((step, i) => {
                  const status = getStepStatus(step.key);
                  const Icon = stepIcons[step.key];
                  const validation = getStepValidation(step.key);
                  return (
                    <div key={step.key} className="flex items-center">
                      <button
                        onClick={() => {
                          if (status === 'complete' || status === 'active') setCurrentStep(step.key);
                        }}
                        disabled={status === 'pending' || status === 'blocked'}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          status === 'active' ? 'bg-accent/10 text-accent' :
                          status === 'complete' ? 'text-clinical-safe hover:bg-muted' :
                          status === 'blocked' ? 'text-clinical-danger' :
                          'text-muted-foreground'
                        }`}
                      >
                        <div className={`step-indicator w-6 h-6 text-[10px] ${
                          status === 'active' ? 'step-active' :
                          status === 'complete' ? 'step-complete' :
                          status === 'blocked' ? 'step-blocked' : 'step-pending'
                        }`}>
                          {status === 'complete' ? <CheckCircle className="h-3.5 w-3.5" /> :
                           status === 'blocked' ? <Lock className="h-3.5 w-3.5" /> :
                           <Icon className="h-3.5 w-3.5" />}
                        </div>
                        <span className="hidden sm:inline">{step.label}</span>
                        {status === 'active' && validation.total > 0 && (
                          <StepChecklist validation={validation} compact />
                        )}
                      </button>
                      {i < CONSULTATION_STEPS.length - 1 && (
                        <ChevronRight className="h-3 w-3 text-muted-foreground/40 mx-0.5 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <EvidenceDrawer conditionName={condition?.name} onPinEvidence={handlePinEvidence} />
                <CalculatorsDialog />
                <AnatomyDialog />
                
              </div>
            </div>

            {/* Scribe recorder - compact mode inside consultation */}
            <ScribeRecorder compact className="px-1" onTranscriptChange={(text) => {
              if (text) setFormData(prev => ({ ...prev, clinicalNotes: text }));
            }} />

            {/* Step 1: Patient */}
            {currentStep === 'patient' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Patient Profile</h2>
                  <StepChecklist validation={getStepValidation('patient')} />
                </div>
                <Card>
                  <CardContent className="pt-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">First Name <span className="text-clinical-danger">*</span></Label>
                        <Input
                          placeholder="First name"
                          value={formData.firstName || ''}
                          onChange={e => updateField('firstName', e.target.value)}
                          className={attemptedProgress && !formData.firstName ? 'border-clinical-danger' : ''}
                        />
                        {attemptedProgress && !formData.firstName && <p className="text-xs mt-1 text-clinical-danger">Required</p>}
                      </div>
                      <div>
                        <Label className="text-xs">Last Name <span className="text-clinical-danger">*</span></Label>
                        <Input
                          placeholder="Last name"
                          value={formData.lastName || ''}
                          onChange={e => updateField('lastName', e.target.value)}
                          className={attemptedProgress && !formData.lastName ? 'border-clinical-danger' : ''}
                        />
                        {attemptedProgress && !formData.lastName && <p className="text-xs mt-1 text-clinical-danger">Required</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Date of Birth <span className="text-clinical-danger">*</span></Label>
                        <Input
                          type="date"
                          value={formData.dob || ''}
                          onChange={e => updateField('dob', e.target.value)}
                          className={attemptedProgress && !formData.dob ? 'border-clinical-danger' : ''}
                        />
                        {attemptedProgress && !formData.dob && <p className="text-xs mt-1 text-clinical-danger">Required</p>}
                      </div>
                      <div>
                        <Label className="text-xs">Sex <span className="text-clinical-danger">*</span></Label>
                        <Select value={formData.sex || ''} onValueChange={v => updateField('sex', v)}>
                          <SelectTrigger className={attemptedProgress && !formData.sex ? 'border-clinical-danger' : ''}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {attemptedProgress && !formData.sex && <p className="text-xs mt-1 text-clinical-danger">Required</p>}
                      </div>
                      <div>
                        <Label className="text-xs">Pregnancy Status</Label>
                        <Select value={formData.pregnancy || ''} onValueChange={v => updateField('pregnancy', v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_pregnant">Not pregnant</SelectItem>
                            <SelectItem value="pregnant">Pregnant</SelectItem>
                            <SelectItem value="possibly_pregnant">Possibly pregnant</SelectItem>
                            <SelectItem value="not_applicable">N/A</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div><Label className="text-xs">Known Allergies</Label><TagInput placeholder="Type allergy and press Enter…" value={parseTagString(formData.allergies)} onChange={tags => updateField('allergies', tagsToString(tags))} /></div>
                    <div><Label className="text-xs">Current Medications</Label><TagInput placeholder="Type medication and press Enter…" value={parseTagString(formData.medications)} onChange={tags => updateField('medications', tagsToString(tags))} /></div>
                    <div><Label className="text-xs">Comorbidities</Label><TagInput placeholder="Type comorbidity and press Enter…" value={parseTagString(formData.comorbidities)} onChange={tags => updateField('comorbidities', tagsToString(tags))} /></div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div><Label className="text-xs">GP Name</Label><Input placeholder="Dr." value={formData.gpName || ''} onChange={e => updateField('gpName', e.target.value)} /></div>
                      <div><Label className="text-xs">GP Clinic</Label><Input placeholder="Clinic name" value={formData.gpClinic || ''} onChange={e => updateField('gpClinic', e.target.value)} /></div>
                      <div><Label className="text-xs">GP Phone</Label><Input placeholder="Phone" value={formData.gpPhone || ''} onChange={e => updateField('gpPhone', e.target.value)} /></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Select Presenting Condition <span className="text-clinical-danger">*</span></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                      <SelectTrigger className={attemptedProgress && !selectedCondition ? 'border-clinical-danger' : ''}>
                        <SelectValue placeholder="Select a condition..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name} ({c.classification})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {attemptedProgress && !selectedCondition && <p className="text-xs mt-1 text-clinical-danger">Required — select a condition</p>}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      const v = getStepValidation('patient');
                      if (!v.complete || !selectedCondition) {
                        setAttemptedProgress(true);
                        toast({ title: 'Required fields missing', description: v.missing.concat(!selectedCondition ? ['Condition selection'] : []).join(', '), variant: 'destructive' });
                        return;
                      }
                      setAttemptedProgress(false);
                      setCurrentStep('assessment');
                    }}
                    className="gap-2"
                  >
                    Continue to Assessment <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Assessment */}
            {currentStep === 'assessment' && condition && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Structured Assessment — {condition.name}</h2>
                  <StepChecklist validation={getStepValidation('assessment')} />
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Presenting Symptoms & History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {condition.assessmentFields.map(field => (
                      <div key={field}>
                        <Label className="text-xs">{field} <span className="text-clinical-danger">*</span></Label>
                        <Input
                          placeholder={`Enter ${field.toLowerCase()}`}
                          value={formData[`assess_${field}`] || ''}
                          onChange={e => updateField(`assess_${field}`, e.target.value)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Red Flag Screening */}
                <Card className={hasRedFlagTriggered ? 'border-clinical-danger bg-clinical-danger-bg' : ''}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${hasRedFlagTriggered ? 'text-clinical-danger' : 'text-clinical-warning'}`} />
                      Red Flag Screening
                      {hasRedFlagTriggered && <Badge variant="destructive" className="text-[10px]">PRESCRIBING BLOCKED</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-2">Check any red flags present in this patient:</p>
                    {condition.redFlags.map(rf => (
                      <div key={rf.id} className="flex items-start gap-3">
                        <Checkbox
                          id={rf.id}
                          checked={redFlagsChecked[rf.id] || false}
                          onCheckedChange={() => toggleRedFlag(rf.id)}
                        />
                        <label htmlFor={rf.id} className="text-xs leading-relaxed cursor-pointer">
                          <span className="font-medium">{rf.description}</span>
                          <span className="block text-muted-foreground capitalize mt-0.5">Action: {rf.action.replace(/_/g, ' ')}</span>
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {hasRedFlagTriggered && (
                  <Card className="border-clinical-danger">
                    <CardContent className="pt-5 space-y-3">
                      <div className="flex items-center gap-2 text-clinical-danger">
                        <XCircle className="h-5 w-5" />
                        <span className="text-sm font-semibold">Prescribing Blocked — Red Flag Detected</span>
                      </div>
                      <p className="text-xs text-muted-foreground">A red flag has been identified. You must document a referral before proceeding.</p>
                      <div>
                        <Label className="text-xs">Referral Documentation (mandatory) <span className="text-clinical-danger">*</span></Label>
                        <Textarea
                          placeholder="Document referral details..."
                          value={formData.referralNotes || ''}
                          onChange={e => updateField('referralNotes', e.target.value)}
                          className="h-24"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('patient')} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  {canProceedFromAssessment ? (
                    <Button onClick={() => setCurrentStep('differentials')} className="gap-2">
                      Continue to Differentials <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="destructive" disabled={!formData.referralNotes} onClick={() => setCurrentStep('documentation')} className="gap-2">
                      Generate Referral Documentation <FileText className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Differentials */}
            {currentStep === 'differentials' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Differential Diagnosis</h2>
                  <StepChecklist validation={getStepValidation('differentials')} />
                </div>
                <Card>
                  <CardContent className="pt-5 space-y-4">
                    <div>
                      <Label className="text-xs font-semibold">Working Diagnosis <span className="text-clinical-danger">*</span></Label>
                      <Input
                        placeholder="State your working diagnosis"
                        value={formData.workingDiagnosis || ''}
                        onChange={e => updateField('workingDiagnosis', e.target.value)}
                      />
                    </div>
                    <Separator />
                    <Label className="text-xs font-semibold">Differentials Considered <span className="text-clinical-danger">*</span></Label>
                    <p className="text-xs text-muted-foreground">List each differential considered and the reason it was excluded.</p>
                    {differentials.map((d, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          placeholder="Differential diagnosis"
                          value={d.diagnosis}
                          onChange={e => {
                            const next = [...differentials];
                            next[i] = { ...next[i], diagnosis: e.target.value };
                            setDifferentials(next);
                          }}
                        />
                        <Input
                          placeholder="Reason excluded"
                          value={d.reasonExcluded}
                          onChange={e => {
                            const next = [...differentials];
                            next[i] = { ...next[i], reasonExcluded: e.target.value };
                            setDifferentials(next);
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDifferentials([...differentials, { diagnosis: '', reasonExcluded: '' }])}
                    >
                      + Add Differential
                    </Button>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('assessment')} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('scope')}
                    disabled={!getStepValidation('differentials').complete}
                    className="gap-2"
                  >
                    Continue to Scope Validation <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Scope Validation */}
            {currentStep === 'scope' && condition && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Legal Scope Validation</h2>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4 text-accent" /> Automated Scope Check
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Age within range', pass: true, detail: condition.scopeValidation.minAge ? `${condition.scopeValidation.minAge}${condition.scopeValidation.maxAge ? '–' + condition.scopeValidation.maxAge : '+'}` : 'No restriction' },
                      { label: 'Sex eligibility', pass: !condition.scopeValidation.sexRestriction || formData.sex === condition.scopeValidation.sexRestriction, detail: condition.scopeValidation.sexRestriction ? `${condition.scopeValidation.sexRestriction} only` : 'No restriction' },
                      { label: 'Pregnancy exclusion', pass: !condition.scopeValidation.pregnancyExcluded || formData.pregnancy === 'not_pregnant' || formData.pregnancy === 'not_applicable', detail: condition.scopeValidation.pregnancyExcluded ? 'Excluded' : 'Not excluded' },
                      { label: 'Jurisdiction authority', pass: true, detail: 'Victoria – Community Pharmacist Prescriber' },
                    ].map((check, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          {check.pass ? <CheckCircle className="h-4 w-4 text-clinical-safe" /> : <XCircle className="h-4 w-4 text-clinical-danger" />}
                          <span className="text-sm font-medium">{check.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{check.detail}</span>
                      </div>
                    ))}
                    {condition.scopeValidation.temporalConstraint && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-clinical-warning-bg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-clinical-warning" />
                          <span className="text-sm font-medium">Temporal Constraint</span>
                        </div>
                        <span className="text-xs font-medium">{condition.scopeValidation.temporalConstraint}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('differentials')} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep('treatment')} className="gap-2">
                    Continue to Treatment <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Treatment */}
            {currentStep === 'treatment' && condition && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Therapeutic Decision</h2>
                  <StepChecklist validation={getStepValidation('treatment')} />
                </div>
                {condition.therapyOptions.length > 0 ? (
                  <>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Recommended Therapies <span className="text-clinical-danger">*</span></CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {condition.therapyOptions.map(t => (
                          <label
                            key={t.id}
                            className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                              formData.selectedTherapy === t.id ? 'border-accent bg-accent/5' : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="therapy"
                                value={t.id}
                                checked={formData.selectedTherapy === t.id}
                                onChange={() => updateField('selectedTherapy', t.id)}
                                className="accent-[hsl(var(--accent))]"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold">{t.medicineName} {t.dose}</span>
                                  <span className={`clinical-badge ${t.line === 'first' ? 'clinical-badge-safe' : 'clinical-badge-info'}`}>{t.line}-line</span>
                                  {t.authorityRequired && <span className="clinical-badge clinical-badge-danger">PBS Authority</span>}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{t.frequency} for {t.duration} — Qty: {t.maxQuantity}, Repeats: {t.repeats}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </CardContent>
                    </Card>

                    {formData.selectedTherapy && condition.therapyOptions.find(t => t.id === formData.selectedTherapy)?.line !== 'first' && (
                      <Card className="border-clinical-warning">
                        <CardContent className="pt-5">
                          <Label className="text-xs font-semibold text-clinical-warning">Deviation Justification Required <span className="text-clinical-danger">*</span></Label>
                          <Textarea
                            placeholder="Explain why first-line therapy is not being used..."
                            value={formData.deviationJustification || ''}
                            onChange={e => updateField('deviationJustification', e.target.value)}
                            className="mt-2 h-20"
                          />
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardContent className="pt-5 space-y-3">
                        <div>
                          <Label className="text-xs">Follow-up Plan <span className="text-clinical-danger">*</span></Label>
                          <Textarea placeholder="Document follow-up plan..." value={formData.followUpPlan || ''} onChange={e => updateField('followUpPlan', e.target.value)} className="h-20" />
                        </div>
                        <div>
                          <Label className="text-xs">Safety Net Advice <span className="text-clinical-danger">*</span></Label>
                          <Textarea placeholder="Document safety net advice given to patient..." value={formData.safetyNet || ''} onChange={e => updateField('safetyNet', e.target.value)} className="h-16" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <p className="text-sm">Therapy options for this condition are being developed.</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('scope')} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep('documentation')} className="gap-2">
                    Review & Finalise <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Documentation / Review */}
            {currentStep === 'documentation' && (
              <ReviewPanel
                formData={formData}
                condition={condition}
                differentials={differentials}
                hasRedFlagTriggered={hasRedFlagTriggered}
                consultStatus={consultStatus}
                consultId={consultId}
                finalisedAt={finalisedAt}
                onFinalise={handleFinalise}
                onDiscard={handleDiscard}
                pinnedEvidence={pinnedEvidence}
              />
            )}
          </div>
        </div>

        {/* Right panel: Live Note Preview */}
        <div className="hidden lg:block w-80 border-l bg-muted/30 p-4 overflow-auto">
          <LiveNotePreview
            formData={formData}
            condition={condition}
            differentials={differentials}
            hasRedFlagTriggered={hasRedFlagTriggered}
            redFlagsChecked={redFlagsChecked}
            pinnedEvidence={pinnedEvidence}
          />

          <Separator className="my-4" />

          {/* Step Progress */}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Step Progress</h3>
          <div className="space-y-1 text-xs">
            {CONSULTATION_STEPS.map(s => {
              const status = getStepStatus(s.key);
              const validation = getStepValidation(s.key);
              return (
                <div key={s.key} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {status === 'complete' ? <CheckCircle className="h-3 w-3 text-clinical-safe" /> :
                     status === 'active' ? <div className="h-3 w-3 rounded-full bg-accent" /> :
                     status === 'blocked' ? <XCircle className="h-3 w-3 text-clinical-danger" /> :
                     <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />}
                    <span className={status === 'active' ? 'font-medium' : 'text-muted-foreground'}>{s.label}</span>
                  </div>
                  {validation.total > 0 && <StepChecklist validation={validation} compact />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ClinicalLayout>
  );
};

export default NewConsultation;
