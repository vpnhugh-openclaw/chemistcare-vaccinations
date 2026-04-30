import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Brain,
  ChevronDown,
  CheckCircle,
  Circle,
  FileText,
  Lock,
  Pen,
  Pill,
  RotateCcw,
  Shield,
  Stethoscope,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FormPageSkeleton } from '@/components/PageSkeleton';
import { ConsultStatusBar } from '@/components/consult/ConsultStatusBar';
import { LiveNotePreview } from '@/components/consult/LiveNotePreview';
import { EvidenceDrawer } from '@/components/consult/EvidenceDrawer';
import { SafetyChecksCard } from '@/components/consult/SafetyChecksCard';
import { SafetyOverrideDialog } from '@/components/consult/SafetyOverrideDialog';
import { SketchPad } from '@/components/consult/SketchPad';
import { ScribeRecorder } from '@/components/scribe/ScribeRecorder';
import { StepChecklist } from '@/components/ConsultationValidation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ConditionPicker } from '@/components/consultation/ConditionPicker';
import { PatientStep } from '@/components/consultation/steps/PatientStep';
import { AssessmentStep } from '@/components/consultation/steps/AssessmentStep';
import { DifferentialsStep } from '@/components/consultation/steps/DifferentialsStep';
import { ScopeStep } from '@/components/consultation/steps/ScopeStep';
import { TreatmentStep } from '@/components/consultation/steps/TreatmentStep';
import { DocumentationStep } from '@/components/consultation/steps/DocumentationStep';
import { useConsultation } from '@/hooks/useConsultation';
import { useToast } from '@/hooks/use-toast';
import type { ConsultationStep } from '@/types/clinical';

function StepProgressPanel({
  steps,
  currentStep,
  getStepStatus,
  getStepValidation,
}: {
  steps: { key: ConsultationStep; label: string }[];
  currentStep: ConsultationStep;
  getStepStatus: (step: ConsultationStep) => 'complete' | 'active' | 'blocked' | 'pending';
  getStepValidation: (step: ConsultationStep) => { complete: boolean; total: number; filled: number };
}) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full group">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step Progress</h3>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2.5 mt-3 text-xs">
          {steps.map((step) => {
            const status = getStepStatus(step.key);
            const validation = getStepValidation(step.key);
            const pct = validation.total > 0 ? Math.round((validation.filled / validation.total) * 100) : (status === 'complete' ? 100 : 0);
            return (
              <div key={step.key} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {status === 'complete' ? (
                      <CheckCircle className="h-3.5 w-3.5" style={{ color: 'hsl(var(--clinical-safe))' }} />
                    ) : status === 'active' ? (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-primary pulse-ring" style={{ backgroundColor: 'hsl(var(--primary) / 0.15)' }} />
                    ) : status === 'blocked' ? (
                      <XCircle className="h-3.5 w-3.5 text-clinical-danger" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground/30" />
                    )}
                    <span className={status === 'active' ? 'font-medium text-foreground' : status === 'complete' ? 'text-foreground/70' : 'text-muted-foreground'}>{step.label}</span>
                  </div>
                  {validation.total > 0 && <span className={`tabular-nums ${validation.complete ? 'text-clinical-safe' : 'text-muted-foreground'}`}>{validation.filled}/{validation.total}</span>}
                </div>
                <div className="h-1 rounded-full bg-muted" style={{ marginLeft: '22px' }}>
                  <div className="h-full rounded-full step-progress-fill" style={{ width: `${pct}%`, backgroundColor: status === 'complete' ? 'hsl(var(--clinical-safe))' : pct > 0 ? 'hsl(var(--primary))' : 'transparent' }} />
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

const stepIcons: Record<ConsultationStep, typeof User> = {
  patient: User,
  assessment: Stethoscope,
  differentials: Brain,
  scope: Shield,
  treatment: Pill,
  documentation: FileText,
};

const NewConsultation = () => {
  const { conditionSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const consultation = useConsultation(conditionSlug);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [showSketchPad, setShowSketchPad] = useState(false);
  const [showChangeConditionWarning, setShowChangeConditionWarning] = useState(false);
  const [pendingConditionSlug, setPendingConditionSlug] = useState<string | null>(null);

  const error = useMemo(() => new URLSearchParams(location.search).get('error'), [location.search]);

  useEffect(() => {
    if (conditionSlug && !consultation.condition && consultation.isLoaded) {
      navigate('/consultations/new?error=invalid', { replace: true });
    }
  }, [conditionSlug, consultation.condition, consultation.isLoaded, navigate]);

  useEffect(() => {
    if (!consultation.isLoaded || !conditionSlug) return;
    if (!consultation.draft.conditionSlug || consultation.draft.conditionSlug === conditionSlug) return;

    if (consultation.canChangeCondition) {
      consultation.resetConsult();
      return;
    }

    setPendingConditionSlug(conditionSlug);
    setShowChangeConditionWarning(true);
    navigate(`/consultations/new/${consultation.draft.conditionSlug}`, { replace: true });
  }, [conditionSlug, consultation.canChangeCondition, consultation.draft.conditionSlug, consultation.isLoaded, consultation.resetConsult, navigate]);

  if (!consultation.isLoaded) {
    return <ClinicalLayout><FormPageSkeleton /></ClinicalLayout>;
  }

  if (!conditionSlug || !consultation.condition) {
    const legacyDraftPending = consultation.showDraftPrompt && !consultation.draft.conditionSlug;

    return (
      <ClinicalLayout>
        <div className="max-w-6xl mx-auto">
          {consultation.showDraftPrompt && (
            <div className="p-6 pb-0">
              <Card className="border-accent/40 bg-accent/5">
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">Unsaved consultation draft found</p>
                      <p className="text-xs text-muted-foreground">Restore it, then choose the consultation type to continue.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={consultation.discardDraft} className="gap-1.5"><Trash2 className="h-3.5 w-3.5" /> Discard</Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const restoredDraft = consultation.restoreDraft();
                        if (restoredDraft?.conditionSlug) navigate(`/consultations/new/${restoredDraft.conditionSlug}`);
                      }}
                      className="gap-1.5"
                    ><RotateCcw className="h-3.5 w-3.5" /> Restore Draft</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <ConditionPicker error={error} legacyDraftPending={legacyDraftPending} onStart={(slug) => navigate(`/consultations/new/${slug}`)} />
        </div>
      </ClinicalLayout>
    );
  }

  const { condition, currentStep, validationState } = consultation;
  const steps = condition.template.steps;
  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);
  const getStepValidation = (step: ConsultationStep) => consultation.getStepValidation(step);
  const getStepStatus = (step: ConsultationStep) => {
    const idx = steps.findIndex((item) => item.key === step);
    if (idx < currentStepIndex) return 'complete' as const;
    if (idx === currentStepIndex) return 'active' as const;
    if (step === 'assessment' && consultation.hasRedFlagTriggered) return 'blocked' as const;
    return 'pending' as const;
  };

  const validationBlockers = Object.values(validationState)
    .flatMap((value) => value.missing)
    .concat(consultation.hasSafetyBlock ? ['Safety blockers unresolved'] : []);

  const handlePatientContinue = () => {
    const validation = consultation.getStepValidation('patient');
    if (!validation.complete) {
      consultation.setAttemptedProgress(true);
      toast({ title: 'Required fields missing', description: validation.missing.join(', '), variant: 'destructive' });
      return;
    }
    consultation.setAttemptedProgress(false);
    consultation.setCurrentStep('assessment');
  };

  const handleTreatmentContinue = () => {
    if (consultation.hasSafetyBlock) {
      toast({ title: 'Safety blockers detected', description: 'Resolve safety blockers or apply a clinical override before proceeding.', variant: 'destructive' });
      return;
    }
    consultation.setCurrentStep('documentation');
  };

  return (
    <ClinicalLayout>
      <ConsultStatusBar
        status={consultation.draft.consultStatus}
        currentStep={currentStep}
        conditionName={condition.name}
        lastSaved={consultation.lastSaved}
        isSaving={consultation.isSaving}
        validationBlockers={validationBlockers}
        patientName={consultation.draft.stepData.patient.firstName && consultation.draft.stepData.patient.lastName ? `${consultation.draft.stepData.patient.firstName} ${consultation.draft.stepData.patient.lastName}` : undefined}
      />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6.5rem)]">
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <div key={currentStep} className="max-w-3xl space-y-5 slide-enter">
            {consultation.showDraftPrompt && (
              <Card className="border-accent/40 bg-accent/5">
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">Unsaved draft found</p>
                      <p className="text-xs text-muted-foreground">Restore the previous consultation draft for this workflow?</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={consultation.discardDraft} className="gap-1.5"><Trash2 className="h-3.5 w-3.5" /> Discard</Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const restoredDraft = consultation.restoreDraft();
                        if (restoredDraft?.conditionSlug && restoredDraft.conditionSlug !== conditionSlug) {
                          navigate(`/consultations/new/${restoredDraft.conditionSlug}`);
                        }
                      }}
                      className="gap-1.5"
                    ><RotateCcw className="h-3.5 w-3.5" /> Restore Draft</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {steps.map((step, index) => {
                  const status = getStepStatus(step.key);
                  const Icon = stepIcons[step.key];
                  const validation = getStepValidation(step.key);
                  return (
                    <div key={step.key} className="flex items-center">
                      <button
                        onClick={() => {
                          if (status === 'complete' || status === 'active') consultation.setCurrentStep(step.key);
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
                          {status === 'complete' ? <CheckCircle className="h-3.5 w-3.5" /> : status === 'blocked' ? <Lock className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                        </div>
                        <span className="hidden sm:inline">{step.label}</span>
                        {status === 'active' && validation.total > 0 && <StepChecklist validation={validation} compact />}
                      </button>
                      {index < steps.length - 1 && <span className="mx-1 text-muted-foreground/40">→</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <ScribeRecorder compact className="px-1" onTranscriptChange={(text) => { if (text) consultation.updateDocumentationField('clinicalNotes', text); }} />
              <div className="flex items-center gap-1.5 flex-wrap">
                <EvidenceDrawer conditionName={condition.name} onPinEvidence={consultation.addPinnedEvidence} />
                <Button variant="outline" size="sm" onClick={() => setShowSketchPad(true)} className="gap-1.5 text-xs"><Pen className="h-3.5 w-3.5" /> Sketch Pad</Button>
              </div>
            </div>

            {currentStep === 'patient' && (
              <PatientStep
                condition={condition}
                patient={consultation.draft.stepData.patient}
                attemptedProgress={consultation.attemptedProgress}
                validation={consultation.getStepValidation('patient')}
                onFieldChange={consultation.updatePatientField}
                onContinue={handlePatientContinue}
                onRequestChangeCondition={() => consultation.canChangeCondition ? navigate('/consultations/new') : setShowChangeConditionWarning(true)}
              />
            )}

            {currentStep === 'assessment' && (
              <AssessmentStep
                condition={condition}
                assessment={consultation.draft.stepData.assessment}
                redFlagsChecked={consultation.draft.redFlagsChecked}
                hasRedFlagTriggered={consultation.hasRedFlagTriggered}
                referralNotes={consultation.draft.stepData.documentation.referralNotes}
                validation={consultation.getStepValidation('assessment')}
                onAssessmentChange={consultation.updateAssessmentField}
                onReferralNotesChange={(value) => consultation.updateDocumentationField('referralNotes', value)}
                onToggleRedFlag={consultation.toggleRedFlag}
                onBack={() => consultation.setCurrentStep('patient')}
                onContinue={() => consultation.setCurrentStep(consultation.hasRedFlagTriggered ? 'documentation' : 'differentials')}
              />
            )}

            {currentStep === 'differentials' && (
              <DifferentialsStep
                workingDiagnosis={consultation.draft.stepData.differentials.workingDiagnosis}
                differentials={consultation.draft.stepData.differentials.items}
                validation={consultation.getStepValidation('differentials')}
                onWorkingDiagnosisChange={consultation.setWorkingDiagnosis}
                onDifferentialsChange={consultation.setDifferentials}
                onBack={() => consultation.setCurrentStep('assessment')}
                onContinue={() => consultation.setCurrentStep('scope')}
              />
            )}

            {currentStep === 'scope' && (
              <ScopeStep
                condition={condition}
                patient={consultation.draft.stepData.patient}
                validation={consultation.getStepValidation('scope')}
                onBack={() => consultation.setCurrentStep('differentials')}
                onContinue={() => consultation.setCurrentStep('treatment')}
              />
            )}

            {currentStep === 'treatment' && (
              <TreatmentStep
                condition={condition}
                treatment={consultation.draft.stepData.treatment}
                validation={consultation.getStepValidation('treatment')}
                hasSafetyBlock={consultation.hasSafetyBlock}
                onTreatmentChange={consultation.updateTreatmentField}
                onBack={() => consultation.setCurrentStep('scope')}
                onContinue={handleTreatmentContinue}
              />
            )}

            {currentStep === 'documentation' && (
              <DocumentationStep
                condition={condition}
                formData={consultation.formData}
                differentials={consultation.draft.stepData.differentials.items}
                hasRedFlagTriggered={consultation.hasRedFlagTriggered}
                consultStatus={consultation.draft.consultStatus}
                consultId={consultation.consultId}
                finalisedAt={consultation.finalisedAt}
                pinnedEvidence={consultation.pinnedEvidence}
                onFinalise={consultation.handleFinalise}
                onDiscard={consultation.resetConsult}
              />
            )}
          </div>
        </div>

        <div className="hidden lg:block w-80 border-l bg-muted/30 p-4 overflow-auto">
          <LiveNotePreview
            formData={consultation.formData}
            condition={condition}
            differentials={consultation.draft.stepData.differentials.items}
            hasRedFlagTriggered={consultation.hasRedFlagTriggered}
            redFlagsChecked={consultation.draft.redFlagsChecked}
            pinnedEvidence={consultation.pinnedEvidence}
            noteHeadings={consultation.noteHeadings}
            isGenerating={Object.keys(consultation.formData).length > 0 && currentStep !== 'documentation'}
          />

          <Separator className="my-4" />

          <SafetyChecksCard result={consultation.safetyResult} override={consultation.draft.safetyOverride} onRequestOverride={() => setShowOverrideDialog(true)} />

          <Separator className="my-4" />

          <StepProgressPanel steps={steps} currentStep={currentStep} getStepStatus={getStepStatus} getStepValidation={getStepValidation} />
        </div>
      </div>

      <SafetyOverrideDialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog} blockerCount={consultation.safetyResult.blockers.length} onApply={consultation.applySafetyOverride} />
      <SketchPad open={showSketchPad} onOpenChange={setShowSketchPad} onSave={() => undefined} />
      <AlertDialog open={showChangeConditionWarning} onOpenChange={setShowChangeConditionWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change consultation type?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingConditionSlug
                ? 'You tried to switch to a different consultation protocol while this consult already has patient data. Start over if you want to change protocol.'
                : 'This consult already has patient data. To avoid mixing protocols, go back to the picker only if you mean to start over.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingConditionSlug(null)}>Stay here</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              const targetSlug = pendingConditionSlug;
              setPendingConditionSlug(null);
              consultation.resetConsult();
              navigate(targetSlug ? `/consultations/new/${targetSlug}` : '/consultations/new');
            }}>Change consultation type</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClinicalLayout>
  );
};

export default NewConsultation;
