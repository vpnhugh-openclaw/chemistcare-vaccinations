import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, AlertTriangle, ArrowUpCircle, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ClaimCase = {
  id: string;
  encounter_reference: string;
  patient_initials: string | null;
  patient_age: number | null;
  patient_sex: string | null;
  condition_name: string;
  consult_date: string;
  claim_program_id: string;
  status: string;
  hard_fail_count: number;
  warn_count: number;
  fee_ex_gst: number;
  gst_amount: number;
  total_amount: number;
  protocol_completed: boolean;
  red_flags_negative: boolean;
  within_age_range: boolean;
  within_onset_window: boolean | null;
  override_justification: string | null;
  notes: string | null;
};

type ClaimProgram = {
  id: string;
  code: string;
  name: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  READY_FOR_CLAIM: { label: 'Ready', color: 'clinical-badge-safe', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  ELIGIBLE_PENDING_REVIEW: { label: 'Pending Review', color: 'clinical-badge-warning', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  NOT_ELIGIBLE: { label: 'Not Eligible', color: 'clinical-badge-danger', icon: <XCircle className="h-3.5 w-3.5" /> },
  CLAIMED: { label: 'Claimed', color: 'clinical-badge-info', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  REJECTED: { label: 'Rejected', color: 'clinical-badge-danger', icon: <XCircle className="h-3.5 w-3.5" /> },
};

export function EligibleCases() {
  const [cases, setCases] = useState<ClaimCase[]>([]);
  const [programs, setPrograms] = useState<ClaimProgram[]>([]);
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [overrideCase, setOverrideCase] = useState<ClaimCase | null>(null);
  const [justification, setJustification] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [casesRes, progsRes] = await Promise.all([
      supabase.from('claim_cases').select('*').order('consult_date', { ascending: false }),
      supabase.from('claim_programs').select('id, code, name').eq('is_active', true),
    ]);
    if (casesRes.data) setCases(casesRes.data as ClaimCase[]);
    if (progsRes.data) setPrograms(progsRes.data as ClaimProgram[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = cases.filter(c => {
    if (filterProgram !== 'all' && c.claim_program_id !== filterProgram) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const handleOverride = async () => {
    if (!overrideCase || !justification.trim()) return;
    const { error } = await supabase.from('claim_cases').update({
      status: 'READY_FOR_CLAIM',
      override_justification: justification,
      fee_ex_gst: 20.00,
      gst_amount: 2.00,
      total_amount: 22.00,
    } as any).eq('id', overrideCase.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Override applied', description: `${overrideCase.encounter_reference} promoted to Ready for Claim.` });
      setOverrideCase(null);
      setJustification('');
      fetchData();
    }
  };

  const counts = {
    ready: cases.filter(c => c.status === 'READY_FOR_CLAIM').length,
    pending: cases.filter(c => c.status === 'ELIGIBLE_PENDING_REVIEW').length,
    notEligible: cases.filter(c => c.status === 'NOT_ELIGIBLE').length,
    totalFee: cases.filter(c => c.status === 'READY_FOR_CLAIM').reduce((a, c) => a + Number(c.total_amount), 0),
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4" style={{ borderLeftColor: 'hsl(var(--clinical-safe))' }}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Ready for Claim</p>
            <p className="text-2xl font-bold">{counts.ready}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: 'hsl(var(--clinical-warning))' }}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold">{counts.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: 'hsl(var(--clinical-danger))' }}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Not Eligible</p>
            <p className="text-2xl font-bold">{counts.notEligible}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: 'hsl(var(--clinical-info))' }}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Claimable</p>
            <p className="text-2xl font-bold">${counts.totalFee.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="w-48">
              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All programs" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All programs</SelectItem>
                  {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name.replace('Vic Community Pharmacist Program – ', '')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="READY_FOR_CLAIM">Ready for Claim</SelectItem>
                  <SelectItem value="ELIGIBLE_PENDING_REVIEW">Pending Review</SelectItem>
                  <SelectItem value="NOT_ELIGIBLE">Not Eligible</SelectItem>
                  <SelectItem value="CLAIMED">Claimed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} cases</span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Ref</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Patient</TableHead>
                <TableHead className="text-xs">Condition</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Fails</TableHead>
                <TableHead className="text-xs">Warns</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No cases found</TableCell></TableRow>
              ) : filtered.map(c => {
                const cfg = statusConfig[c.status] || statusConfig.NOT_ELIGIBLE;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs font-mono">{c.encounter_reference}</TableCell>
                    <TableCell className="text-xs">{c.consult_date}</TableCell>
                    <TableCell className="text-xs">{c.patient_initials} ({c.patient_sex}, {c.patient_age}y)</TableCell>
                    <TableCell className="text-xs">{c.condition_name}</TableCell>
                    <TableCell>
                      <span className={`clinical-badge ${cfg.color} gap-1`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-center">{c.hard_fail_count}</TableCell>
                    <TableCell className="text-xs text-center">{c.warn_count}</TableCell>
                    <TableCell className="text-xs text-right font-mono">${Number(c.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      {c.status === 'ELIGIBLE_PENDING_REVIEW' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => { setOverrideCase(c); setJustification(''); }}>
                          <ArrowUpCircle className="h-3.5 w-3.5" /> Override
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Override dialog */}
      <Dialog open={!!overrideCase} onOpenChange={() => setOverrideCase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override to Ready for Claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Promoting <strong>{overrideCase?.encounter_reference}</strong> ({overrideCase?.condition_name}) from Pending Review to Ready for Claim.
            </p>
            <div>
              <Label className="text-sm">Justification (required)</Label>
              <Textarea value={justification} onChange={e => setJustification(e.target.value)} placeholder="Clinical rationale for overriding warnings..." className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideCase(null)}>Cancel</Button>
            <Button onClick={handleOverride} disabled={!justification.trim()}>Confirm Override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
