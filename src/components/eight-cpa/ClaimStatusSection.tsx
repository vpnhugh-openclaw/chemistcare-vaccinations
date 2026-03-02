import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EightCpaServiceType, MEDSCHECK_FEE, DIABETES_MEDSCHECK_FEE, SERVICE_TYPE_LABELS } from "@/types/eightCpa";

interface ClaimData {
  ppa_claim_required: boolean;
  ppa_claim_status: string;
  ppa_submission_date: string;
  ppa_rejection_reason: string;
  notes: string;
}

interface Props {
  serviceType: EightCpaServiceType;
  isEligible: boolean;
  claim: ClaimData;
  onChange: (data: Partial<ClaimData>) => void;
}

export function ClaimStatusSection({ serviceType, isEligible, claim, onChange }: Props) {
  const fee = serviceType === 'MEDSCHECK' ? MEDSCHECK_FEE : DIABETES_MEDSCHECK_FEE;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Claim & Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
          <div>
            <p className="text-xs text-muted-foreground">Service</p>
            <p className="text-sm font-medium">{SERVICE_TYPE_LABELS[serviceType]}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Eligibility</p>
            <Badge className={isEligible ? "clinical-badge-safe" : "clinical-badge-danger"}>
              {isEligible ? "Eligible" : "Not Eligible"}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fee (ex GST)</p>
            <p className="text-sm font-medium">${fee.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={claim.ppa_claim_required} onCheckedChange={(v) => onChange({ ppa_claim_required: v })} />
          <Label className="mb-0">PPA claim required</Label>
        </div>

        {claim.ppa_claim_required && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Claim Status</Label>
              <Select value={claim.ppa_claim_status} onValueChange={(v) => onChange({ ppa_claim_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_SUBMITTED">Not Submitted</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="MANUAL_ONLY">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Submission Date</Label>
              <Input type="date" value={claim.ppa_submission_date} onChange={(e) => onChange({ ppa_submission_date: e.target.value })} />
            </div>
            {claim.ppa_claim_status === 'REJECTED' && (
              <div>
                <Label className="text-xs">Rejection Reason</Label>
                <Input value={claim.ppa_rejection_reason} onChange={(e) => onChange({ ppa_rejection_reason: e.target.value })} />
              </div>
            )}
          </div>
        )}

        <div>
          <Label className="text-xs">Claim Notes</Label>
          <Textarea value={claim.notes} onChange={(e) => onChange({ notes: e.target.value })} rows={2} placeholder="Any notes about this claim" />
        </div>
      </CardContent>
    </Card>
  );
}
