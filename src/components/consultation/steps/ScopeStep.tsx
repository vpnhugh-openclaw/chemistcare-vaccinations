import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Shield, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { evaluateScopeChecks, type ConsultationCondition } from '@/lib/conditionRegistry';
import type { ValidationResult } from '@/components/ConsultationValidation';

interface ScopeStepProps {
  condition: ConsultationCondition;
  patient: Record<string, string>;
  validation: ValidationResult;
  onBack: () => void;
  onContinue: () => void;
}

export function ScopeStep({ condition, patient, validation, onBack, onContinue }: ScopeStepProps) {
  const checks = evaluateScopeChecks(condition, patient);
  const canContinue = validation.complete && checks.every((check) => check.pass);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Protocol Scope Validation</h2>
        <span className={`text-xs font-medium ${canContinue ? 'text-clinical-safe' : 'text-clinical-danger'}`}>
          {canContinue ? 'Eligible to proceed' : 'Eligibility issue detected'}
        </span>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" /> Condition-bound protocol checks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-3">
              <div className="flex items-center gap-2">
                {check.pass ? <CheckCircle className="h-4 w-4 text-clinical-safe" /> : <XCircle className="h-4 w-4 text-clinical-danger" />}
                <span className="text-sm font-medium">{check.label}</span>
              </div>
              <span className="text-xs text-muted-foreground text-right">{check.detail}</span>
            </div>
          ))}

          {condition.scopeValidation.temporalConstraint && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-clinical-warning-bg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-clinical-warning" />
                <span className="text-sm font-medium">Temporal constraint</span>
              </div>
              <span className="text-xs font-medium">{condition.scopeValidation.temporalConstraint}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {!validation.complete && validation.missing.length > 0 && (
        <Card className="border-clinical-danger">
          <CardContent className="pt-5 text-sm text-clinical-danger space-y-1">
            {validation.missing.map((message) => <p key={message}>• {message}</p>)}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onContinue} disabled={!canContinue} className="gap-2">
          Continue to Treatment <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
