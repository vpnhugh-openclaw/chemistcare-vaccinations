import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AuditEventType =
  | 'draft_saved'
  | 'step_validated'
  | 'finalise_started'
  | 'finalise_succeeded'
  | 'finalise_failed'
  | 'draft_discarded'
  | 'evidence_pinned';

export function useConsultAudit() {
  const logEvent = useCallback(async (
    consultId: string,
    eventType: AuditEventType,
    options?: {
      step?: string;
      validationResult?: Record<string, unknown>;
      errorReason?: string;
      metadata?: Record<string, unknown>;
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await (supabase.from('consult_audit_events') as any).insert({
        consult_id: consultId,
        user_id: user?.id ?? null,
        event_type: eventType,
        step: options?.step ?? null,
        validation_result: options?.validationResult ?? null,
        error_reason: options?.errorReason ?? null,
        metadata: options?.metadata ?? {},
      });
    } catch {
      // Audit logging should never break the UI
      console.warn('[Audit] Failed to log event:', eventType);
    }
  }, []);

  return { logEvent };
}
