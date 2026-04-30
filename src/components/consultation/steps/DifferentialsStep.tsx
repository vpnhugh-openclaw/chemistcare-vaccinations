import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { StepChecklist, type ValidationResult } from '@/components/ConsultationValidation';

interface DifferentialsStepProps {
  workingDiagnosis: string;
  differentials: { diagnosis: string; reasonExcluded: string }[];
  validation: ValidationResult;
  onWorkingDiagnosisChange: (value: string) => void;
  onDifferentialsChange: (items: { diagnosis: string; reasonExcluded: string }[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function DifferentialsStep({
  workingDiagnosis,
  differentials,
  validation,
  onWorkingDiagnosisChange,
  onDifferentialsChange,
  onBack,
  onContinue,
}: DifferentialsStepProps) {
  const updateDifferential = (index: number, next: Partial<{ diagnosis: string; reasonExcluded: string }>) => {
    const updated = [...differentials];
    updated[index] = { ...updated[index], ...next };
    onDifferentialsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Differential Diagnosis</h2>
        <StepChecklist validation={validation} />
      </div>
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div>
            <Label className="text-xs font-semibold">Working Diagnosis <span className="text-clinical-danger">*</span></Label>
            <Input placeholder="State your working diagnosis" value={workingDiagnosis} onChange={(event) => onWorkingDiagnosisChange(event.target.value)} />
          </div>
          <Separator />
          <Label className="text-xs font-semibold">Differentials Considered <span className="text-clinical-danger">*</span></Label>
          <p className="text-xs text-muted-foreground">List each differential considered and why it was excluded for this condition.</p>
          {differentials.map((item, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Differential diagnosis" value={item.diagnosis} onChange={(event) => updateDifferential(index, { diagnosis: event.target.value })} />
              <Input placeholder="Reason excluded" value={item.reasonExcluded} onChange={(event) => updateDifferential(index, { reasonExcluded: event.target.value })} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => onDifferentialsChange([...differentials, { diagnosis: '', reasonExcluded: '' }])}>+ Add Differential</Button>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onContinue} disabled={!validation.complete} className="gap-2">
          Continue to Scope Validation <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
