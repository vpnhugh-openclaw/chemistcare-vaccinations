import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, FileDown, Plus, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateClaimPDF } from '@/lib/claimPdf';

type ClaimProgram = { id: string; code: string; name: string; standard_fee_ex_gst: number; gst_rate: number };
type ClaimBatch = {
  id: string; pharmacy_name: string; pharmacy_address: string | null; pharmacy_abn: string | null;
  claim_program_id: string; period_start: string; period_end: string; status: string;
  total_cases: number; total_amount_ex_gst: number; total_gst: number; total_amount: number;
  generated_by: string | null; created_at: string; finalized_at: string | null;
};
type ClaimCase = {
  id: string; encounter_reference: string; patient_initials: string | null; patient_age: number | null;
  patient_sex: string | null; condition_name: string; consult_date: string; status: string;
  hard_fail_count: number; warn_count: number; fee_ex_gst: number; gst_amount: number;
  total_amount: number; protocol_completed: boolean; red_flags_negative: boolean;
  within_age_range: boolean; within_onset_window: boolean | null; notes: string | null;
};

const batchStatusColors: Record<string, string> = {
  DRAFT: 'clinical-badge-warning',
  FINALIZED: 'clinical-badge-safe',
  EXPORTED: 'clinical-badge-info',
};

export function ClaimBatches() {
  const [programs, setPrograms] = useState<ClaimProgram[]>([]);
  const [batches, setBatches] = useState<ClaimBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ programId: '', pharmacyName: 'My Pharmacy', pharmacyAbn: '', periodStart: '', periodEnd: '' });
  const [previewCases, setPreviewCases] = useState<ClaimCase[]>([]);
  const [previewBatch, setPreviewBatch] = useState<ClaimBatch | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [bRes, pRes] = await Promise.all([
      supabase.from('claim_batches').select('*').order('created_at', { ascending: false }),
      supabase.from('claim_programs').select('id, code, name, standard_fee_ex_gst, gst_rate').eq('is_active', true),
    ]);
    if (bRes.data) setBatches(bRes.data as ClaimBatch[]);
    if (pRes.data) setPrograms(pRes.data as ClaimProgram[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerateBatch = async () => {
    if (!form.programId || !form.periodStart || !form.periodEnd) return;
    // Find eligible cases
    const { data: eligibleCases } = await supabase.from('claim_cases')
      .select('*')
      .eq('claim_program_id', form.programId)
      .eq('status', 'READY_FOR_CLAIM')
      .gte('consult_date', form.periodStart)
      .lte('consult_date', form.periodEnd);

    if (!eligibleCases || eligibleCases.length === 0) {
      toast({ title: 'No eligible cases', description: 'No Ready for Claim cases found in the selected period.', variant: 'destructive' });
      return;
    }

    const totalExGst = eligibleCases.reduce((a, c) => a + Number(c.fee_ex_gst), 0);
    const totalGst = eligibleCases.reduce((a, c) => a + Number(c.gst_amount), 0);
    const totalAmount = eligibleCases.reduce((a, c) => a + Number(c.total_amount), 0);

    const { data: batch, error } = await supabase.from('claim_batches').insert({
      pharmacy_name: form.pharmacyName,
      pharmacy_abn: form.pharmacyAbn || null,
      claim_program_id: form.programId,
      period_start: form.periodStart,
      period_end: form.periodEnd,
      status: 'DRAFT',
      total_cases: eligibleCases.length,
      total_amount_ex_gst: totalExGst,
      total_gst: totalGst,
      total_amount: totalAmount,
    } as any).select().single();

    if (error || !batch) {
      toast({ title: 'Error', description: error?.message || 'Failed to create batch', variant: 'destructive' });
      return;
    }

    // Link cases to batch
    const links = eligibleCases.map((c, i) => ({
      batch_id: batch.id,
      claim_case_id: c.id,
      order_index: i + 1,
    }));
    await supabase.from('claim_batch_case_links').insert(links as any);

    toast({ title: 'Batch created', description: `${eligibleCases.length} cases linked to batch.` });
    setShowCreate(false);
    fetchData();
  };

  const handleFinalize = async (batch: ClaimBatch) => {
    await supabase.from('claim_batches').update({ status: 'FINALIZED', finalized_at: new Date().toISOString() } as any).eq('id', batch.id);
    // Update linked cases to CLAIMED
    const { data: links } = await supabase.from('claim_batch_case_links').select('claim_case_id').eq('batch_id', batch.id);
    if (links) {
      const ids = links.map(l => l.claim_case_id);
      await supabase.from('claim_cases').update({ status: 'CLAIMED', claimed_at: new Date().toISOString() } as any).in('id', ids);
    }
    toast({ title: 'Batch finalized' });
    fetchData();
  };

  const handleExportPDF = async (batch: ClaimBatch) => {
    const program = programs.find(p => p.id === batch.claim_program_id);
    const { data: links } = await supabase.from('claim_batch_case_links').select('claim_case_id, order_index').eq('batch_id', batch.id).order('order_index');
    if (!links) return;
    const caseIds = links.map(l => l.claim_case_id);
    const { data: cases } = await supabase.from('claim_cases').select('*').in('id', caseIds);
    if (!cases) return;
    // Sort by link order
    const orderedCases = links.map(l => cases.find(c => c.id === l.claim_case_id)!).filter(Boolean);
    generateClaimPDF(batch, program!, orderedCases as ClaimCase[]);
    await supabase.from('claim_batches').update({ status: 'EXPORTED' } as any).eq('id', batch.id);
    toast({ title: 'PDF generated and downloaded' });
    fetchData();
  };

  const handlePreview = async (batch: ClaimBatch) => {
    const { data: links } = await supabase.from('claim_batch_case_links').select('claim_case_id, order_index').eq('batch_id', batch.id).order('order_index');
    if (!links) return;
    const caseIds = links.map(l => l.claim_case_id);
    const { data: cases } = await supabase.from('claim_cases').select('*').in('id', caseIds);
    if (cases) {
      const ordered = links.map(l => cases.find(c => c.id === l.claim_case_id)!).filter(Boolean);
      setPreviewCases(ordered as ClaimCase[]);
      setPreviewBatch(batch);
    }
  };

  const getProgramName = (id: string) => {
    const p = programs.find(p => p.id === id);
    return p ? p.name.replace('Vic Community Pharmacist Program – ', '') : 'Unknown';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Claim Batches</h2>
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" /> New Batch
        </Button>
      </div>

      {/* Batches table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Program</TableHead>
                <TableHead className="text-xs">Period</TableHead>
                <TableHead className="text-xs">Cases</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : batches.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No batches yet. Create one to get started.</TableCell></TableRow>
              ) : batches.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="text-xs">{getProgramName(b.claim_program_id)}</TableCell>
                  <TableCell className="text-xs">{b.period_start} – {b.period_end}</TableCell>
                  <TableCell className="text-xs text-center">{b.total_cases}</TableCell>
                  <TableCell>
                    <span className={`clinical-badge ${batchStatusColors[b.status] || 'clinical-badge-info'}`}>{b.status}</span>
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono">${Number(b.total_amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handlePreview(b)}>View</Button>
                      {b.status === 'DRAFT' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleFinalize(b)}>
                          <CheckCircle2 className="h-3 w-3" /> Finalize
                        </Button>
                      )}
                      {(b.status === 'FINALIZED' || b.status === 'EXPORTED') && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleExportPDF(b)}>
                          <FileDown className="h-3 w-3" /> PDF
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create batch dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate New Claim Batch</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Claim Program</Label>
              <Select value={form.programId} onValueChange={v => setForm(f => ({ ...f, programId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select program" /></SelectTrigger>
                <SelectContent>
                  {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name.replace('Vic Community Pharmacist Program – ', '')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Pharmacy Name</Label>
              <Input value={form.pharmacyName} onChange={e => setForm(f => ({ ...f, pharmacyName: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">ABN (optional)</Label>
              <Input value={form.pharmacyAbn} onChange={e => setForm(f => ({ ...f, pharmacyAbn: e.target.value }))} className="mt-1" placeholder="12 345 678 901" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Period Start</Label>
                <Input type="date" value={form.periodStart} onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Period End</Label>
                <Input type="date" value={form.periodEnd} onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))} className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleGenerateBatch} disabled={!form.programId || !form.periodStart || !form.periodEnd}>Generate Batch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview batch dialog */}
      <Dialog open={!!previewBatch} onOpenChange={() => setPreviewBatch(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Batch Preview — {previewBatch && getProgramName(previewBatch.claim_program_id)}</DialogTitle>
          </DialogHeader>
          {previewBatch && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Period:</span> {previewBatch.period_start} – {previewBatch.period_end}</div>
                <div><span className="text-muted-foreground">Pharmacy:</span> {previewBatch.pharmacy_name}</div>
                <div><span className="text-muted-foreground">Total cases:</span> {previewBatch.total_cases}</div>
                <div><span className="text-muted-foreground">Total (inc GST):</span> <strong>${Number(previewBatch.total_amount).toFixed(2)}</strong></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Ref</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Patient</TableHead>
                    <TableHead className="text-xs">Condition</TableHead>
                    <TableHead className="text-xs">Protocol</TableHead>
                    <TableHead className="text-xs">Red Flags</TableHead>
                    <TableHead className="text-xs text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewCases.map((c, i) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs">{i + 1}</TableCell>
                      <TableCell className="text-xs font-mono">{c.encounter_reference}</TableCell>
                      <TableCell className="text-xs">{c.consult_date}</TableCell>
                      <TableCell className="text-xs">{c.patient_initials} ({c.patient_sex}, {c.patient_age}y)</TableCell>
                      <TableCell className="text-xs">{c.condition_name}</TableCell>
                      <TableCell className="text-xs">{c.protocol_completed ? '✓' : '✗'}</TableCell>
                      <TableCell className="text-xs">{c.red_flags_negative ? '✓ Neg' : '✗'}</TableCell>
                      <TableCell className="text-xs text-right font-mono">${Number(c.total_amount).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
