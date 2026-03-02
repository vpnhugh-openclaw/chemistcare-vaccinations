import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import {
  AlertTriangle, CheckCircle, XCircle, ChevronRight, ChevronLeft,
  Shield, Pill, FileText, User, Stethoscope, Brain, Lock, RotateCcw, Trash2,
} from 'lucide-react';

const DRAFT_KEY = 'chemistcare_consultation_draft';

interface DraftState {
  formData: Record<string, string>;
  selectedCondition: string;
  redFlagsChecked: Record<string, boolean>;
  differentials: { diagnosis: string; reasonExcluded: string }[];
  currentStep: ConsultationStep;
}

const NewConsultation = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<ConsultationStep>('patient');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || '');
  const [redFlagsChecked, setRedFlagsChecked] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [differentials, setDifferentials] = useState([{ diagnosis: '', reasonExcluded: '' }]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  const condition = useMemo(() => getConditionById(selectedCondition), [selectedCondition]);
  const stepIndex = CONSULTATION_STEPS.findIndex(s => s.key === currentStep);
  const hasRedFlagTriggered = Object.values(redFlagsChecked).some(Boolean);
  const canProceedFromAssessment = !hasRedFlagTriggered;

  // Draft state for autosave
  const draftState: DraftState = useMemo(() => ({
    formData, selectedCondition, redFlagsChecked, differentials, currentStep,
  }), [formData, selectedCondition, redFlagsChecked, differentials, currentStep]);

  const isDirty = useMemo(() => {
    return Object.keys(formData).length > 0 || selectedCondition !== '' || differentials.some(d => d.diagnosis.trim());
  }, [formData, selectedCondition, differentials]);

  const { lastSaved, isSaving, loadDraft, clearDraft, hasDraft } = useAutosave(DRAFT_KEY, draftState, isLoaded && isDirty);

  // Navigation guard
  useNavigationGuard(isDirty, 'You have unsaved consultation data. Are you sure you want to leave?');

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

  if (!isLoaded) return <ClinicalLayout><FormPageSkeleton /></ClinicalLayout>;

  return (
    <ClinicalLayout>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)]">
        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl space-y-6 animate-fade-in">

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

            {/* Save status + step indicator */}
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
              <SaveStatus lastSaved={lastSaved} isSaving={isSaving} />
            </div>

            {/* Step 1: Patient */}
            {currentStep === 'patient' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Patient Profile</h2>
                  <StepChecklist validation={getStepValidation('patient')} />
                </div>
                <Card>
                  <CardContent className="pt-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">First Name <span className="text-clinical-danger">*</span></Label>
                        <Input placeholder="First name" value={formData.firstName || ''} onChange={e => updateField('firstName', e.target.value)} />
                        {!formData.firstName && formData.lastName && <p className="text-xs mt-1" style={{ color: 'hsl(var(--clinical-warning))' }}>Required</p>}
                      </div>
                      <div>
                        <Label className="text-xs">Last Name <span className="text-clinical-danger">*</span></Label>
                        <Input placeholder="Last name" value={formData.lastName || ''} onChange={e => updateField('lastName', e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Date of Birth <span className="text-clinical-danger">*</span></Label>
                        <Input type="date" value={formData.dob || ''} onChange={e => updateField('dob', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Sex <span className="text-clinical-danger">*</span></Label>
                        <Select value={formData.sex || ''} onValueChange={v => updateField('sex', v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
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
                    <div><Label className="text-xs">Known Allergies</Label><Textarea placeholder="List all known allergies (drug and non-drug)" value={formData.allergies || ''} onChange={e => updateField('allergies', e.target.value)} className="h-20" /></div>
                    <div><Label className="text-xs">Current Medications</Label><Textarea placeholder="List all current medications including OTC and supplements" value={formData.medications || ''} onChange={e => updateField('medications', e.target.value)} className="h-20" /></div>
                    <div><Label className="text-xs">Comorbidities</Label><Textarea placeholder="List relevant comorbidities" value={formData.comorbidities || ''} onChange={e => updateField('comorbidities', e.target.value)} className="h-16" /></div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
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
                      <SelectTrigger><SelectValue placeholder="Select a condition..." /></SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name} ({c.classification})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep('assessment')}
                    disabled={!getStepValidation('patient').complete || !selectedCondition}
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
                      <p className="text-xs text-muted-foreground">A red flag has been identified. You must document a referral before proceeding. Prescribing is not permitted for this consultation.</p>
                      <div>
                        <Label className="text-xs">Referral Documentation (mandatory) <span className="text-clinical-danger">*</span></Label>
                        <Textarea
                          placeholder="Document referral details: who referred to, reason, urgency, communication method..."
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
                      <div key={i} className="grid grid-cols-2 gap-3">
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
                                <div className="flex items-center gap-2">
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
                      <p className="text-sm">Therapy options for this condition are being developed. Proceed to documentation for non-pharmacological management.</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('scope')} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep('documentation')} className="gap-2">
                    Generate Documentation <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Documentation */}
            {currentStep === 'documentation' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Clinical Documentation</h2>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">OSCE-Style Structured Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    <div>
                      <p className="clinical-section-title">Patient</p>
                      <p className="font-medium">{formData.firstName} {formData.lastName} · DOB: {formData.dob} · Sex: {formData.sex}</p>
                      {formData.allergies && <p className="text-clinical-danger mt-1">Allergies: {formData.allergies}</p>}
                    </div>
                    <Separator />
                    <div>
                      <p className="clinical-section-title">Presenting Condition</p>
                      <p className="font-medium">{condition?.name || selectedCondition}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="clinical-section-title">Assessment Findings</p>
                      {condition?.assessmentFields.map(f => formData[`assess_${f}`] && (
                        <p key={f}><span className="text-muted-foreground">{f}:</span> {formData[`assess_${f}`]}</p>
                      ))}
                    </div>
                    <Separator />
                    <div>
                      <p className="clinical-section-title">Clinical Reasoning</p>
                      <p><span className="text-muted-foreground">Working Diagnosis:</span> <span className="font-medium">{formData.workingDiagnosis || '—'}</span></p>
                      {differentials.filter(d => d.diagnosis).map((d, i) => (
                        <p key={i}><span className="text-muted-foreground">Differential {i + 1}:</span> {d.diagnosis} — <span className="italic">Excluded: {d.reasonExcluded}</span></p>
                      ))}
                    </div>
                    {formData.selectedTherapy && condition && (
                      <>
                        <Separator />
                        <div>
                          <p className="clinical-section-title">Treatment</p>
                          {(() => {
                            const t = condition.therapyOptions.find(t => t.id === formData.selectedTherapy);
                            return t ? (
                              <div>
                                <p className="font-medium">{t.medicineName} {t.dose} — {t.frequency} for {t.duration}</p>
                                <p className="text-muted-foreground">Qty: {t.maxQuantity} | Repeats: {t.repeats} | PBS: {t.pbsRestriction || 'N/A'}</p>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </>
                    )}
                    {formData.followUpPlan && (
                      <>
                        <Separator />
                        <div>
                          <p className="clinical-section-title">Follow-up Plan</p>
                          <p>{formData.followUpPlan}</p>
                        </div>
                      </>
                    )}
                    {formData.safetyNet && (
                      <>
                        <Separator />
                        <div>
                          <p className="clinical-section-title">Safety Net Advice</p>
                          <p>{formData.safetyNet}</p>
                        </div>
                      </>
                    )}
                    {hasRedFlagTriggered && formData.referralNotes && (
                      <>
                        <Separator />
                        <div>
                          <p className="clinical-section-title text-clinical-danger">Referral (Red Flag Triggered)</p>
                          <p>{formData.referralNotes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-5 space-y-3">
                    <Label className="text-xs font-semibold">Additional Clinical Notes</Label>
                    <Textarea
                      placeholder="Any additional clinical notes for the encounter record..."
                      value={formData.clinicalNotes || ''}
                      onChange={e => updateField('clinicalNotes', e.target.value)}
                      className="h-24"
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(hasRedFlagTriggered ? 'assessment' : 'treatment')} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" /> Export GP Letter
                    </Button>
                    <Button className="gap-2" onClick={() => clearDraft()}>
                      <CheckCircle className="h-4 w-4" /> Finalise Consultation
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel: Clinical reasoning summary */}
        <div className="hidden lg:block w-80 border-l bg-muted/30 p-4 overflow-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Clinical Reasoning Summary</h3>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-medium text-muted-foreground mb-1">Patient</p>
              <p className="font-semibold">{formData.firstName || '—'} {formData.lastName || ''}</p>
              {formData.sex && <p className="text-muted-foreground capitalize">{formData.sex}{formData.dob ? ` · DOB: ${formData.dob}` : ''}</p>}
            </div>

            <Separator />

            <div>
              <p className="font-medium text-muted-foreground mb-1">Condition</p>
              <p className="font-semibold">{condition?.name || 'Not selected'}</p>
              {condition && <span className={`clinical-badge mt-1 ${
                condition.classification === 'acute' ? 'clinical-badge-danger' :
                condition.classification === 'chronic' ? 'clinical-badge-info' :
                condition.classification === 'preventive' ? 'clinical-badge-safe' : 'clinical-badge-warning'
              }`}>{condition.classification}</span>}
            </div>

            <Separator />

            <div>
              <p className="font-medium text-muted-foreground mb-1">Red Flags</p>
              {hasRedFlagTriggered ? (
                <div className="p-2 rounded bg-clinical-danger-bg">
                  <p className="font-semibold text-clinical-danger flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> TRIGGERED — Prescribing Blocked
                  </p>
                  {Object.entries(redFlagsChecked).filter(([, v]) => v).map(([id]) => {
                    const rf = condition?.redFlags.find(r => r.id === id);
                    return rf ? <p key={id} className="text-clinical-danger mt-1">• {rf.description}</p> : null;
                  })}
                </div>
              ) : (
                <p className="text-clinical-safe flex items-center gap-1"><CheckCircle className="h-3 w-3" /> No red flags</p>
              )}
            </div>

            <Separator />

            <div>
              <p className="font-medium text-muted-foreground mb-1">Diagnosis</p>
              <p className="font-semibold">{formData.workingDiagnosis || '—'}</p>
            </div>

            {formData.selectedTherapy && condition && (
              <>
                <Separator />
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Selected Therapy</p>
                  {(() => {
                    const t = condition.therapyOptions.find(t => t.id === formData.selectedTherapy);
                    return t ? <p className="font-semibold">{t.medicineName} {t.dose}</p> : <p>—</p>;
                  })()}
                </div>
              </>
            )}

            <Separator />

            <div>
              <p className="font-medium text-muted-foreground mb-1">Step Progress</p>
              <div className="space-y-1">
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
        </div>
      </div>
    </ClinicalLayout>
  );
};

export default NewConsultation;
