import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClinicalLayout } from "@/components/ClinicalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Download, Eye, Copy, Paperclip, ArrowLeft } from "lucide-react";
import { SERVICE_TYPE_LABELS, SERVICE_STATUS_LABELS, CLAIM_STATUS_LABELS, EightCpaServiceType, EightCpaServiceStatus, ClaimStatus } from "@/types/eightCpa";

interface ServiceRow {
  id: string;
  service_type: EightCpaServiceType;
  status: EightCpaServiceStatus;
  service_date: string;
  patient_name: string;
  claim_status: ClaimStatus;
  has_attachments: boolean;
}

export default function EightCpaServiceHistory() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', serviceType: 'ALL', status: 'ALL', claimStatus: 'ALL' });

  const load = async () => {
    setLoading(true);
    let q = supabase.from('eight_cpa_services').select('id, service_type, status, service_date').order('service_date', { ascending: false });
    if (filters.serviceType !== 'ALL') q = q.eq('service_type', filters.serviceType as EightCpaServiceType);
    if (filters.status !== 'ALL') q = q.eq('status', filters.status as EightCpaServiceStatus);
    if (filters.dateFrom) q = q.gte('service_date', filters.dateFrom);
    if (filters.dateTo) q = q.lte('service_date', filters.dateTo);

    const { data: svcs } = await q;
    if (!svcs) { setLoading(false); return; }

    const ids = svcs.map(s => s.id);
    const [{ data: patients }, { data: claims }, { data: attachments }] = await Promise.all([
      supabase.from('eight_cpa_patient_snapshots').select('service_id, full_name').in('service_id', ids),
      supabase.from('eight_cpa_claim_tracking').select('service_id, ppa_claim_status').in('service_id', ids),
      supabase.from('eight_cpa_attachments').select('service_id').in('service_id', ids).eq('is_deleted', false),
    ]);

    const patMap = new Map(patients?.map(p => [p.service_id, p.full_name]) || []);
    const claimMap = new Map(claims?.map(c => [c.service_id, c.ppa_claim_status as ClaimStatus]) || []);
    const attSet = new Set(attachments?.map(a => a.service_id) || []);

    let filtered = svcs.map(s => ({
      ...s,
      service_type: s.service_type as EightCpaServiceType,
      status: s.status as EightCpaServiceStatus,
      patient_name: patMap.get(s.id) || 'Unknown',
      claim_status: claimMap.get(s.id) || 'NOT_SUBMITTED' as ClaimStatus,
      has_attachments: attSet.has(s.id),
    }));

    if (filters.claimStatus !== 'ALL') filtered = filtered.filter(r => r.claim_status === filters.claimStatus);
    setRows(filtered);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);

  const exportCsv = () => {
    const header = 'Date,Patient,Service Type,Status,Claim Status\n';
    const csv = rows.map(r => `${r.service_date},"${r.patient_name}",${SERVICE_TYPE_LABELS[r.service_type]},${SERVICE_STATUS_LABELS[r.status]},${CLAIM_STATUS_LABELS[r.claim_status]}`).join('\n');
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `8cpa-services-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const statusColor = (s: EightCpaServiceStatus) => {
    switch (s) { case 'COMPLETED': return 'clinical-badge-safe'; case 'DRAFT': return 'clinical-badge-warning'; case 'INELIGIBLE': return 'clinical-badge-danger'; default: return 'clinical-badge-info'; }
  };

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/eight-cpa')}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-lg font-semibold">Service History</h1>
              <p className="text-xs text-muted-foreground">{rows.length} record{rows.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
        </div>

        <Card>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2">
              <Input type="date" className="w-36 h-8 text-xs" placeholder="From" value={filters.dateFrom} onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
              <Input type="date" className="w-36 h-8 text-xs" placeholder="To" value={filters.dateTo} onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
              <Select value={filters.serviceType} onValueChange={(v) => setFilters(f => ({ ...f, serviceType: v }))}>
                <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="MEDSCHECK">MedsCheck</SelectItem>
                  <SelectItem value="DIABETES_MEDSCHECK">Diabetes MedsCheck</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="INELIGIBLE">Ineligible</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.claimStatus} onValueChange={(v) => setFilters(f => ({ ...f, claimStatus: v }))}>
                <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Claim Statuses</SelectItem>
                  <SelectItem value="NOT_SUBMITTED">Not Submitted</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="MANUAL_ONLY">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Patient</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">PPA Claim</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : rows.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No services found</TableCell></TableRow>
                ) : rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="text-xs">{row.service_date}</TableCell>
                    <TableCell className="text-xs font-medium">{row.patient_name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{SERVICE_TYPE_LABELS[row.service_type]}</Badge></TableCell>
                    <TableCell><Badge className={`${statusColor(row.status)} text-[10px]`}>{SERVICE_STATUS_LABELS[row.status]}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{CLAIM_STATUS_LABELS[row.claim_status]}</Badge></TableCell>
                    <TableCell>{row.has_attachments && <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/eight-cpa/edit/${row.id}`)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/eight-cpa/new?duplicate=${row.id}`)}><Copy className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ClinicalLayout>
  );
}
