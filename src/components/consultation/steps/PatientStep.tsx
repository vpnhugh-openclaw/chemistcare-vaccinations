import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FloatingInput, FloatingSelectWrapper } from '@/components/ui/floating-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TagInput, parseTagString, tagsToString } from '@/components/ui/tag-input';
import type { ConsultationCondition } from '@/lib/conditionRegistry';
import type { ValidationResult } from '@/components/ConsultationValidation';

interface PatientStepProps {
  condition: ConsultationCondition;
  patient: Record<string, string>;
  attemptedProgress: boolean;
  validation: ValidationResult;
  onFieldChange: (field: string, value: string) => void;
  onContinue: () => void;
  onRequestChangeCondition: () => void;
}

export function PatientStep({
  condition,
  patient,
  attemptedProgress,
  validation,
  onFieldChange,
  onContinue,
  onRequestChangeCondition,
}: PatientStepProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Patient Profile</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Consultation type: <span className="font-medium text-foreground">{condition.name}</span></span>
          <Button variant="outline" size="sm" onClick={onRequestChangeCondition}>Change</Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Patient Identity</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingInput label="First Name" required value={patient.firstName || ''} onChange={(event) => onFieldChange('firstName', event.target.value)} error={attemptedProgress && !patient.firstName} valid={!!patient.firstName} />
            <FloatingInput label="Last Name" required value={patient.lastName || ''} onChange={(event) => onFieldChange('lastName', event.target.value)} error={attemptedProgress && !patient.lastName} valid={!!patient.lastName} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FloatingInput label="Date of Birth" required type="date" value={patient.dob || ''} onChange={(event) => onFieldChange('dob', event.target.value)} error={attemptedProgress && !patient.dob} valid={!!patient.dob} />
            <FloatingSelectWrapper label="Sex" required hasValue={!!patient.sex} valid={!!patient.sex} error={attemptedProgress && !patient.sex}>
              <Select value={patient.sex || ''} onValueChange={(value) => onFieldChange('sex', value)}>
                <SelectTrigger className="border-0 shadow-none focus:ring-0 h-auto py-0 px-3">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FloatingSelectWrapper>
            <FloatingSelectWrapper label="Pregnancy Status" hasValue={!!patient.pregnancy} valid={!!patient.pregnancy}>
              <Select value={patient.pregnancy || ''} onValueChange={(value) => onFieldChange('pregnancy', value)}>
                <SelectTrigger className="border-0 shadow-none focus:ring-0 h-auto py-0 px-3">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_pregnant">Not pregnant</SelectItem>
                  <SelectItem value="pregnant">Pregnant</SelectItem>
                  <SelectItem value="possibly_pregnant">Possibly pregnant</SelectItem>
                  <SelectItem value="not_applicable">N/A</SelectItem>
                </SelectContent>
              </Select>
            </FloatingSelectWrapper>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Clinical Background</p>
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Known Allergies</Label>
            <TagInput placeholder="Type allergy and press Enter…" value={parseTagString(patient.allergies)} onChange={(tags) => onFieldChange('allergies', tagsToString(tags))} />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Current Medications</Label>
            <TagInput placeholder="Type medication and press Enter…" value={parseTagString(patient.medications)} onChange={(tags) => onFieldChange('medications', tagsToString(tags))} />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Comorbidities</Label>
            <TagInput placeholder="Type comorbidity and press Enter…" value={parseTagString(patient.comorbidities)} onChange={(tags) => onFieldChange('comorbidities', tagsToString(tags))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Referring Clinician</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FloatingInput label="GP Name" value={patient.gpName || ''} onChange={(event) => onFieldChange('gpName', event.target.value)} valid={!!patient.gpName} />
            <FloatingInput label="GP Clinic" value={patient.gpClinic || ''} onChange={(event) => onFieldChange('gpClinic', event.target.value)} valid={!!patient.gpClinic} />
            <FloatingInput label="GP Phone" value={patient.gpPhone || ''} onChange={(event) => onFieldChange('gpPhone', event.target.value)} valid={!!patient.gpPhone} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {validation.complete ? 'Patient profile complete.' : `${validation.filled}/${validation.total} core patient fields complete.`}
        </div>
        <Button onClick={onContinue} className="gap-2">
          Continue to {condition.template.steps[1]?.label || 'Assessment'} <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
