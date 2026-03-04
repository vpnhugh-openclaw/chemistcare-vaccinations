import { Badge } from '@/components/ui/badge';
import { SaveStatus } from '@/components/ConsultationValidation';
import { ConsultStatus } from '@/lib/consultStateMachine';
import { ConsultationStep, CONSULTATION_STEPS } from '@/types/clinical';
import { CheckCircle, Clock, Loader2, AlertCircle, XCircle } from 'lucide-react';

interface ConsultStatusBarProps {
  status: ConsultStatus;
  currentStep: ConsultationStep;
  conditionName?: string;
  lastSaved: Date | null;
  isSaving: boolean;
  validationBlockers: string[];
}

const STATUS_DISPLAY: Record<ConsultStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
  validated: { label: 'Validated', color: 'bg-clinical-safe-bg text-clinical-safe', icon: CheckCircle },
  submitting: { label: 'Submitting...', color: 'bg-accent/10 text-accent', icon: Loader2 },
  finalised: { label: 'Finalised', color: 'bg-clinical-safe text-white', icon: CheckCircle },
  discarded: { label: 'Discarded', color: 'bg-clinical-danger-bg text-clinical-danger', icon: XCircle },
};

export function ConsultStatusBar({
  status, currentStep, conditionName, lastSaved, isSaving, validationBlockers,
}: ConsultStatusBarProps) {
  const statusInfo = STATUS_DISPLAY[status];
  const StatusIcon = statusInfo.icon;
  const stepInfo = CONSULTATION_STEPS.find(s => s.key === currentStep);

  return (
    <div className="sticky top-0 z-10 bg-card border-b px-4 py-2 flex flex-wrap items-center gap-3 text-xs">
      {/* Status badge */}
      <Badge variant="outline" className={`gap-1 ${statusInfo.color}`}>
        <StatusIcon className={`h-3 w-3 ${status === 'submitting' ? 'animate-spin' : ''}`} />
        {statusInfo.label}
      </Badge>

      {/* Condition template */}
      {conditionName && (
        <span className="text-muted-foreground">
          Template: <span className="font-medium text-foreground">{conditionName}</span>
        </span>
      )}

      {/* Current step */}
      <span className="text-muted-foreground">
        Step: <span className="font-medium text-foreground">{stepInfo?.label}</span>
      </span>

      {/* Validation blockers */}
      {validationBlockers.length > 0 && status === 'draft' && (
        <span className="flex items-center gap-1 text-clinical-warning">
          <AlertCircle className="h-3 w-3" />
          {validationBlockers.length} blocker{validationBlockers.length !== 1 ? 's' : ''}
        </span>
      )}

      {/* Autosave */}
      <div className="ml-auto">
        <SaveStatus lastSaved={lastSaved} isSaving={isSaving} />
      </div>
    </div>
  );
}
