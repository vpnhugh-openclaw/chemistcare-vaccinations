/**
 * Consultation state machine: Draft → Validated → Submitting → Finalised
 * Also supports: Draft → Discarded
 */

export type ConsultStatus = 'draft' | 'validated' | 'submitting' | 'finalised' | 'discarded';

export type ConsultEvent =
  | 'VALIDATE'
  | 'SUBMIT'
  | 'FINALISE_SUCCESS'
  | 'FINALISE_FAIL'
  | 'DISCARD'
  | 'RESET_TO_DRAFT';

const transitions: Record<ConsultStatus, Partial<Record<ConsultEvent, ConsultStatus>>> = {
  draft: {
    VALIDATE: 'validated',
    DISCARD: 'discarded',
  },
  validated: {
    SUBMIT: 'submitting',
    RESET_TO_DRAFT: 'draft',
    DISCARD: 'discarded',
  },
  submitting: {
    FINALISE_SUCCESS: 'finalised',
    FINALISE_FAIL: 'validated',
  },
  finalised: {},
  discarded: {},
};

export function transitionConsult(current: ConsultStatus, event: ConsultEvent): ConsultStatus | null {
  const next = transitions[current]?.[event];
  return next ?? null;
}

export function canTransition(current: ConsultStatus, event: ConsultEvent): boolean {
  return transitionConsult(current, event) !== null;
}
