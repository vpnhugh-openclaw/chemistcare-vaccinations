import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import type { SafetyOverride } from '@/types/safety';

interface SafetyOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockerCount: number;
  onApply: (override: SafetyOverride) => void;
}

export function SafetyOverrideDialog({ open, onOpenChange, blockerCount, onApply }: SafetyOverrideDialogProps) {
  const [reason, setReason] = useState('');
  const [discussed, setDiscussed] = useState(false);

  const canApply = reason.trim().length >= 10 && discussed;

  const handleApply = () => {
    if (!canApply) return;
    onApply({
      reason: reason.trim(),
      discussed,
      at: new Date().toISOString(),
    });
    setReason('');
    setDiscussed(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-clinical-warning" />
            Safety Override
          </DialogTitle>
          <DialogDescription>
            {blockerCount} safety blocker{blockerCount !== 1 ? 's' : ''} detected. Provide clinical justification to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Clinical Justification <span className="text-clinical-danger">*</span></Label>
            <Textarea
              placeholder="Explain why it is clinically appropriate to proceed despite blockers (min 10 characters)..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="h-24 mt-1"
            />
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="discussed-risks"
              checked={discussed}
              onCheckedChange={v => setDiscussed(!!v)}
            />
            <label htmlFor="discussed-risks" className="text-xs leading-relaxed cursor-pointer">
              I confirm risks have been discussed with the patient and informed consent obtained. <span className="text-clinical-danger">*</span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!canApply} onClick={handleApply} variant="destructive">
            Apply Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
