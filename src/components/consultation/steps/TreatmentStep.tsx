import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StepChecklist, type ValidationResult } from '@/components/ConsultationValidation';
import type { ConsultationCondition } from '@/lib/conditionRegistry';

interface TreatmentStepProps {
  condition: ConsultationCondition;
  treatment: Record<string, string>;
  validation: ValidationResult;
  hasSafetyBlock: boolean;
  onTreatmentChange: (field: string, value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function TreatmentStep({
  condition,
  treatment,
  validation,
  hasSafetyBlock,
  onTreatmentChange,
  onBack,
  onContinue,
}: TreatmentStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Condition-specific Treatment Plan</h2>
        <StepChecklist validation={validation} />
      </div>

      {condition.template.treatmentOptions.length > 0 ? (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recommended therapies for {condition.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {condition.template.treatmentOptions.map((therapy) => (
                <label
                  key={therapy.id}
                  className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                    treatment.selectedTherapy === therapy.id ? 'border-accent bg-accent/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="therapy"
                      value={therapy.id}
                      checked={treatment.selectedTherapy === therapy.id}
                      onChange={() => onTreatmentChange('selectedTherapy', therapy.id)}
                      className="accent-[hsl(var(--accent))]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{therapy.medicineName} {therapy.dose}</span>
                        <span className={`clinical-badge ${therapy.line === 'first' ? 'clinical-badge-safe' : 'clinical-badge-info'}`}>{therapy.line}-line</span>
                        {therapy.authorityRequired && <span className="clinical-badge clinical-badge-danger">Authority required</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{therapy.frequency} for {therapy.duration} — Qty: {therapy.maxQuantity}, Repeats: {therapy.repeats}</p>
                      {therapy.contraindications.length > 0 && <p className="text-xs text-clinical-danger mt-1">Contraindications: {therapy.contraindications.join(', ')}</p>}
                    </div>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          {treatment.selectedTherapy && condition.template.treatmentOptions.find((therapy) => therapy.id === treatment.selectedTherapy)?.line !== 'first' && (
            <Card className="border-clinical-warning">
              <CardContent className="pt-5">
                <Label className="text-xs font-semibold text-clinical-warning">Deviation Justification Required <span className="text-clinical-danger">*</span></Label>
                <Textarea value={treatment.deviationJustification || ''} onChange={(event) => onTreatmentChange('deviationJustification', event.target.value)} placeholder="Explain why first-line therapy is not being used..." className="mt-2 h-20" />
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="text-sm">Treatment options for this condition are being developed.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-5 space-y-3">
          <div>
            <Label className="text-xs">Follow-up Plan <span className="text-clinical-danger">*</span></Label>
            <Textarea value={treatment.followUpPlan || ''} onChange={(event) => onTreatmentChange('followUpPlan', event.target.value)} placeholder="Document follow-up plan..." className="h-20" />
          </div>
          <div>
            <Label className="text-xs">Safety Net Advice <span className="text-clinical-danger">*</span></Label>
            <Textarea value={treatment.safetyNet || ''} onChange={(event) => onTreatmentChange('safetyNet', event.target.value)} placeholder="Document safety net advice given to patient..." className="h-16" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onContinue} disabled={hasSafetyBlock} className="gap-2">
          Review & Finalise <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
