import { AlertTriangle, ChevronLeft, ChevronRight, FileText, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { StepChecklist, type ValidationResult } from '@/components/ConsultationValidation';
import type { ConsultationCondition } from '@/lib/conditionRegistry';

interface AssessmentStepProps {
  condition: ConsultationCondition;
  assessment: Record<string, string>;
  redFlagsChecked: Record<string, boolean>;
  hasRedFlagTriggered: boolean;
  referralNotes?: string;
  validation: ValidationResult;
  onAssessmentChange: (field: string, value: string) => void;
  onReferralNotesChange: (value: string) => void;
  onToggleRedFlag: (flagId: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function AssessmentStep({
  condition,
  assessment,
  redFlagsChecked,
  hasRedFlagTriggered,
  referralNotes,
  validation,
  onAssessmentChange,
  onReferralNotesChange,
  onToggleRedFlag,
  onBack,
  onContinue,
}: AssessmentStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{condition.template.steps.find((step) => step.key === 'assessment')?.label || `Structured Assessment — ${condition.name}`}</h2>
        <StepChecklist validation={validation} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Protocol Assessment for {condition.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {condition.template.assessmentFields.map((field) => (
            <div key={field.id}>
              <Label className="text-xs">{field.label} {field.required && <span className="text-clinical-danger">*</span>}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={assessment[field.id] || ''}
                  onChange={(event) => onAssessmentChange(field.id, event.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1"
                />
              ) : (
                <Input
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  value={assessment[field.id] || ''}
                  onChange={(event) => onAssessmentChange(field.id, event.target.value)}
                  placeholder={field.placeholder}
                />
              )}
              {field.helpText && <p className="text-[11px] text-muted-foreground mt-1">{field.helpText}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className={hasRedFlagTriggered ? 'border-clinical-danger bg-clinical-danger-bg' : ''}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${hasRedFlagTriggered ? 'text-clinical-danger' : 'text-clinical-warning'}`} />
            Red Flag Screening
            {hasRedFlagTriggered && <Badge variant="destructive" className="text-[10px]">PRESCRIBING BLOCKED</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Check any condition-specific red flags present in this patient:</p>
          {condition.template.redFlags.map((flag) => (
            <div key={flag.id} className="flex items-start gap-3">
              <Checkbox id={flag.id} checked={redFlagsChecked[flag.id] || false} onCheckedChange={() => onToggleRedFlag(flag.id)} />
              <label htmlFor={flag.id} className="text-xs leading-relaxed cursor-pointer">
                <span className="font-medium">{flag.description}</span>
                <span className="block text-muted-foreground capitalize mt-0.5">Action: {flag.action.replace(/_/g, ' ')}</span>
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
              <span className="text-sm font-semibold">Prescribing blocked until referral is documented</span>
            </div>
            <p className="text-xs text-muted-foreground">Document the referral if you need to exit to documentation for this consult.</p>
            <div>
              <Label className="text-xs">Referral Documentation <span className="text-clinical-danger">*</span></Label>
              <Textarea value={referralNotes || ''} onChange={(event) => onReferralNotesChange(event.target.value)} placeholder="Document referral details..." className="h-24" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {hasRedFlagTriggered ? (
          <Button variant="destructive" disabled={!referralNotes} onClick={onContinue} className="gap-2">
            Generate Referral Documentation <FileText className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={onContinue} className="gap-2">
            Continue to Differentials <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
