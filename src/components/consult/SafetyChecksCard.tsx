import { Shield, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { SafetyResult, SafetyOverride } from '@/types/safety';

interface SafetyChecksCardProps {
  result: SafetyResult;
  override?: SafetyOverride;
  onRequestOverride: () => void;
}

export function SafetyChecksCard({ result, override, onRequestOverride }: SafetyChecksCardProps) {
  const scoreColor = result.score >= 80 ? 'text-clinical-safe' : result.score >= 50 ? 'text-clinical-warning' : 'text-clinical-danger';

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Shield className="h-3.5 w-3.5" /> Safety Checks
      </h3>
      <Card className={result.blockers.length > 0 && !override ? 'border-clinical-danger' : ''}>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Safety Score</span>
            <span className={`text-lg font-bold tabular-nums ${scoreColor}`}>{result.score}/100</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          {result.alerts.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-clinical-safe">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>No safety concerns detected</span>
            </div>
          )}

          {result.blockers.length > 0 && (
            <>
              <div className="flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-clinical-danger" />
                <span className="text-xs font-bold text-clinical-danger uppercase">Blockers ({result.blockers.length})</span>
              </div>
              {result.blockers.map(a => (
                <div key={a.id} className="text-xs p-2 rounded border bg-clinical-danger-bg border-clinical-danger/30">
                  <p className="font-semibold text-clinical-danger">{a.title}</p>
                  <p className="text-muted-foreground mt-0.5">{a.details}</p>
                  {a.recommendedAction && <p className="text-clinical-danger mt-1 font-medium">→ {a.recommendedAction}</p>}
                </div>
              ))}
              {override ? (
                <div className="text-xs p-2 rounded border bg-clinical-warning-bg border-clinical-warning/30">
                  <p className="font-semibold text-clinical-warning">Override applied</p>
                  <p className="text-muted-foreground mt-0.5">Reason: {override.reason}</p>
                  <p className="text-muted-foreground">At: {new Date(override.at).toLocaleTimeString('en-AU')}</p>
                </div>
              ) : (
                <button
                  onClick={onRequestOverride}
                  className="text-xs font-medium text-clinical-warning hover:underline cursor-pointer"
                >
                  Apply clinical override →
                </button>
              )}
            </>
          )}

          {result.alerts.filter(a => !a.blocker && a.severity === 'warn').length > 0 && (
            <>
              <Separator />
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-clinical-warning" />
                <span className="text-xs font-semibold text-clinical-warning">Warnings</span>
              </div>
              {result.alerts.filter(a => !a.blocker && a.severity === 'warn').map(a => (
                <div key={a.id} className="text-xs p-2 rounded border bg-clinical-warning-bg border-clinical-warning/20">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-muted-foreground mt-0.5">{a.details}</p>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
