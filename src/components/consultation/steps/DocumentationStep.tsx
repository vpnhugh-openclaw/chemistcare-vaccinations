import { ReviewPanel } from '@/components/consult/ReviewPanel';
import type { ConsultationCondition } from '@/lib/conditionRegistry';
import type { ConsultStatus } from '@/lib/consultStateMachine';

interface DocumentationStepProps {
  condition?: ConsultationCondition;
  formData: Record<string, string>;
  differentials: { diagnosis: string; reasonExcluded: string }[];
  hasRedFlagTriggered: boolean;
  consultStatus: ConsultStatus;
  consultId?: string;
  finalisedAt?: string;
  pinnedEvidence: { question: string; answer: string; sources: string[] }[];
  onFinalise: () => Promise<{ success: boolean; consultId?: string; error?: string }>;
  onDiscard: () => void;
}

export function DocumentationStep(props: DocumentationStepProps) {
  return <ReviewPanel {...props} />;
}
