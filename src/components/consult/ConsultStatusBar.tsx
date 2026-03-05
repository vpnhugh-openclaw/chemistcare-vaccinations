import { Badge } from '@/components/ui/badge';
import { SaveStatus } from '@/components/ConsultationValidation';
import { ConsultStatus } from '@/lib/consultStateMachine';
import { ConsultationStep, CONSULTATION_STEPS } from '@/types/clinical';
import { CheckCircle, Clock, Loader2, AlertTriangle, XCircle, User } from 'lucide-react';

interface ConsultStatusBarProps {
  status: ConsultStatus;
  currentStep: ConsultationStep;
  conditionName?: string;
  lastSaved: Date | null;
  isSaving: boolean;
  validationBlockers: string[];
  patientName?: string;
}

const STATUS_CONFIG: Record<ConsultStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', variant: 'secondary', className: 'bg-muted text-muted-foreground border-0', icon: Clock },
  validated: { label: 'Validated', variant: 'default', className: 'bg-clinical-safe text-white border-0', icon: CheckCircle },
  submitting: { label: 'Submitting', variant: 'default', className: 'bg-primary/10 text-primary border-0', icon: Loader2 },
  finalised: { label: 'Finalised', variant: 'default', className: 'bg-clinical-safe text-white border-0', icon: CheckCircle },
  discarded: { label: 'Discarded', variant: 'destructive', className: 'bg-clinical-danger-bg text-clinical-danger border-0', icon: XCircle },
};

export function ConsultStatusBar({
  status, currentStep, conditionName, lastSaved, isSaving, validationBlockers, patientName,
}: ConsultStatusBarProps) {
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  const stepIndex = CONSULTATION_STEPS.findIndex(s => s.key === currentStep);
  const totalSteps = CONSULTATION_STEPS.length;
  const stepInfo = CONSULTATION_STEPS[stepIndex];

  return (
    <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b shadow-sm px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-2.5 text-xs">
      {/* Status badge */}
      <Badge variant={config.variant} className={`gap-1.5 px-2.5 py-1 text-[0.6875rem] font-semibold ${config.className}`}>
        <StatusIcon className={`h-3 w-3 ${status === 'submitting' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>

      {/* Step counter — blue for in-progress */}
      <Badge variant="outline" className="gap-1 px-2.5 py-1 text-[0.6875rem] font-medium bg-primary/8 text-primary border-primary/20">
        Step {stepIndex + 1} of {totalSteps}
        <span className="text-primary/60">·</span>
        <span className="font-semibold">{stepInfo?.label}</span>
      </Badge>

      {/* Patient name */}
      {patientName && (
        <div className="flex items-center gap-1.5 text-foreground">
          <User className="h-3 w-3 text-primary" />
          <span className="font-semibold text-[0.8125rem]">{patientName}</span>
        </div>
      )}

      {/* Condition */}
      {conditionName && (
        <Badge variant="outline" className="text-[0.6875rem] font-medium text-muted-foreground border-border">
          {conditionName}
        </Badge>
      )}

      {/* Validation blockers — amber */}
      {validationBlockers.length > 0 && status === 'draft' && (
        <Badge variant="outline" className="gap-1 px-2.5 py-1 text-[0.6875rem] font-medium bg-clinical-warning-bg text-clinical-warning border-clinical-warning/20">
          <AlertTriangle className="h-3 w-3" />
          {validationBlockers.length} blocker{validationBlockers.length !== 1 ? 's' : ''}
        </Badge>
      )}

      {/* Autosave — far right */}
      <div className="ml-auto">
        <SaveStatus lastSaved={lastSaved} isSaving={isSaving} />
      </div>
    </div>
  );
}
