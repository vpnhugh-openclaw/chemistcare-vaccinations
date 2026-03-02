import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

type ClaimCase = {
  id: string; encounter_reference: string; patient_initials: string | null;
  patient_age: number | null; patient_sex: string | null; condition_name: string;
  consult_date: string; status: string; fee_ex_gst: number; gst_amount: number;
  total_amount: number; claimed_at: string | null; override_justification: string | null;
  notes: string | null;
};

const statusLabels: Record<string, string> = {
  READY_FOR_CLAIM: 'Ready',
  ELIGIBLE_PENDING_REVIEW: 'Pending Review',
  NOT_ELIGIBLE: 'Not Eligible',
  CLAIMED: 'Claimed',
  REJECTED: 'Rejected',
};

export function ClaimHistory() {
  const [cases, setCases] = useState<ClaimCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from('claim_cases').select('*').order('consult_date', { ascending: false });
      if (data) setCases(data as ClaimCase[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = cases.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c.encounter_reference.toLowerCase().includes(s) || c.condition_name.toLowerCase().includes(s) || (c.patient_initials || '').toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Claim History</h2>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ref, condition, patient..." className="pl-8 h-8 text-xs" />
            </div>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} records</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Ref</TableHead>
                <TableHead className="text-xs">Consult Date</TableHead>
                <TableHead className="text-xs">Patient</TableHead>
                <TableHead className="text-xs">Condition</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs">Claimed At</TableHead>
                <TableHead className="text-xs">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No records found</TableCell></TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="text-xs font-mono">{c.encounter_reference}</TableCell>
                  <TableCell className="text-xs">{c.consult_date}</TableCell>
                  <TableCell className="text-xs">{c.patient_initials} ({c.patient_sex}, {c.patient_age}y)</TableCell>
                  <TableCell className="text-xs">{c.condition_name}</TableCell>
                  <TableCell className="text-xs">{statusLabels[c.status] || c.status}</TableCell>
                  <TableCell className="text-xs text-right font-mono">${Number(c.total_amount).toFixed(2)}</TableCell>
                  <TableCell className="text-xs">{c.claimed_at ? new Date(c.claimed_at).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-xs max-w-[150px] truncate">{c.override_justification || c.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
