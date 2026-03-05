export type SafetySeverity = 'ok' | 'warn' | 'danger';

export interface SafetyAlert {
  id: string;
  severity: SafetySeverity;
  title: string;
  details: string;
  blocker: boolean;
  source: 'interaction' | 'allergy' | 'pregnancy' | 'duplicate' | 'jurisdiction';
  recommendedAction?: string;
}

export interface SafetyResult {
  score: number;
  alerts: SafetyAlert[];
  blockers: SafetyAlert[];
}

export interface SafetyOverride {
  reason: string;
  discussed: boolean;
  at: string;
}
