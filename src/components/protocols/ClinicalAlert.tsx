import { AlertCircle, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ProtocolAlert } from '@/types/protocols';

interface ClinicalAlertProps {
  alert: ProtocolAlert;
}

export function ClinicalAlert({ alert }: ClinicalAlertProps) {
  const config = {
    red: {
      bg: 'hsl(var(--clinical-danger-bg))',
      border: 'hsl(var(--clinical-danger))',
      text: 'hsl(var(--clinical-danger))',
      Icon: XCircle,
      label: 'IMMEDIATE REFERRAL',
    },
    amber: {
      bg: 'hsl(var(--clinical-warning-bg))',
      border: 'hsl(var(--clinical-warning))',
      text: 'hsl(var(--clinical-warning))',
      Icon: AlertTriangle,
      label: 'WARNING',
    },
    green: {
      bg: 'hsl(var(--clinical-safe-bg))',
      border: 'hsl(var(--clinical-safe))',
      text: 'hsl(var(--clinical-safe))',
      Icon: CheckCircle,
      label: 'PROCEED',
    },
  }[alert.level];

  return (
    <div
      className="rounded-lg border-2 p-4"
      style={{ backgroundColor: config.bg, borderColor: config.border }}
    >
      <div className="flex items-start gap-3">
        <config.Icon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: config.text }} />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: config.text }}>{config.label}</span>
            {alert.blocksPrescribing && (
              <span className="text-[0.625rem] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: config.border, color: 'white' }}>
                PRESCRIBING BLOCKED
              </span>
            )}
          </div>
          <p className="font-semibold text-sm text-foreground">{alert.title}</p>
          <p className="text-xs text-muted-foreground">{alert.message}</p>
          {alert.action && <p className="text-xs font-medium mt-1" style={{ color: config.text }}>Action: {alert.action}</p>}
        </div>
      </div>
    </div>
  );
}
