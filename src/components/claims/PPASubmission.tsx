import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Send, AlertTriangle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ClaimCase = {
  id: string;
  encounter_reference: string;
  patient_initials: string | null;
  patient_age: number | null;
  patient_sex: string | null;
  condition_name: string;
  consult_date: string;
  status: string;
  fee_ex_gst: number;
  gst_amount: number;
  total_amount: number;
  protocol_completed: boolean;
  red_flags_negative: boolean;
  within_age_range: boolean;
};

type ClaimProgram = {
  id: string;
  code: string;
  name: string;
  is_api_supported?: boolean;
  ppa_program_code?: string | null;
  program_rules_url?: string | null;
};

interface Props {
  claimCase: ClaimCase;
  program: ClaimProgram | undefined;
  onComplete: () => void;
}

export function PPASubmitButton({ claimCase, program, onComplete }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (!program) return null;

  // Non-API program: show link to PPA portal
  if (!program.is_api_supported) {
    return (
      <div className="flex gap-1">
        {program.program_rules_url && (
          <a href={program.program_rules_url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              <ExternalLink className="h-3 w-3" /> PPA Portal
            </Button>
          </a>
        )}
      </div>
    );
  }

  // API-supported program
  if (claimCase.status !== 'READY_FOR_CLAIM') return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ppa-integration', {
        body: {
          action: 'submit_claim',
          claim_case_id: claimCase.id,
          program_registration_id: program.ppa_program_code || program.code,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Claim submitted to PPA',
        description: `PPA Claim ID: ${data.ppa_claim_id || 'Pending'}`,
      });
      setShowConfirm(false);
      onComplete();
    } catch (err: any) {
      toast({
        title: 'PPA submission failed',
        description: err.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs gap-1"
        onClick={() => setShowConfirm(true)}
      >
        <Send className="h-3 w-3" /> Submit to PPA
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" style={{ color: 'hsl(var(--clinical-warning))' }} />
              Confirm PPA Submission
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              You are about to submit this claim to the PPA API. Please review the details below.
            </p>

            <Card>
              <CardContent className="p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Program</span>
                  <span className="font-medium">{program.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient</span>
                  <span>{claimCase.patient_initials} ({claimCase.patient_sex}, {claimCase.patient_age}y)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Date</span>
                  <span>{claimCase.consult_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono">{claimCase.encounter_reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition</span>
                  <span>{claimCase.condition_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium font-mono">${Number(claimCase.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Badge variant={claimCase.protocol_completed ? 'default' : 'secondary'} className="text-[10px]">
                    Protocol {claimCase.protocol_completed ? '✓' : '✗'}
                  </Badge>
                  <Badge variant={claimCase.red_flags_negative ? 'default' : 'secondary'} className="text-[10px]">
                    Red Flags {claimCase.red_flags_negative ? 'Neg ✓' : '✗'}
                  </Badge>
                  <Badge variant={claimCase.within_age_range ? 'default' : 'secondary'} className="text-[10px]">
                    Age Range {claimCase.within_age_range ? '✓' : '✗'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
              This action cannot be undone. The claim will be submitted to the PPA API and marked as CLAIMED upon success.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-1.5">
              {submitting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {submitting ? 'Submitting...' : 'Confirm & Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
