import { useState } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle2, FileText, Receipt, TrendingUp, Send } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CLAIMS_KEY = 'chemistcare_demo_claims';

interface DemoClaim {
  id: string;
  pharmacyId: string;
  medicare: string;
  service: string;
  status: string;
  rebate: string;
  timestamp: string;
  auditNote: string;
}

function loadClaims(): DemoClaim[] {
  try { return JSON.parse(localStorage.getItem(CLAIMS_KEY) || '[]'); } catch { return []; }
}

function saveClaims(c: DemoClaim[]) { localStorage.setItem(CLAIMS_KEY, JSON.stringify(c)); }

const rebates: Record<string, number> = { MedsCheck: 42.10, DMAP: 120.00, 'Vaccination': 18.85 };

export default function ClaimsDemo() {
  const [claims, setClaims] = useState<DemoClaim[]>(() => loadClaims());
  const [pharmacyId, setPharmacyId] = useState('');
  const [medicare, setMedicare] = useState('');
  const [service, setService] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successClaim, setSuccessClaim] = useState<DemoClaim | null>(null);

  const handleSubmit = () => {
    if (!pharmacyId || !medicare || !service) { toast.error('Please fill all fields'); return; }
    setSubmitting(true);
    setTimeout(() => {
      const claim: DemoClaim = {
        id: `DEMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        pharmacyId, medicare, service,
        status: 'Approved',
        rebate: `$${(rebates[service] ?? 42.10).toFixed(2)}`,
        timestamp: new Date().toISOString(),
        auditNote: `Demo claim submitted for ${service}. Auto-approved in demo mode.`,
      };
      const updated = [claim, ...claims];
      setClaims(updated);
      saveClaims(updated);
      setSuccessClaim(claim);
      setSubmitting(false);
      setPharmacyId(''); setMedicare(''); setService('');
      toast.success('Claim submitted (demo)');
    }, 1200);
  };

  const chartData = ['MedsCheck', 'DMAP', 'Vaccination'].map(s => ({
    service: s,
    count: claims.filter(c => c.service === s).length,
    rebate: claims.filter(c => c.service === s).reduce((sum, c) => sum + parseFloat(c.rebate.replace('$', '')), 0),
  }));

  const totalRebate = claims.reduce((s, c) => s + parseFloat(c.rebate.replace('$', '')), 0);

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 space-y-4 animate-fade-in max-w-6xl">
        <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 font-mono text-xs">DEMO – Mock PPA Claims</Badge>

        <h1 className="text-2xl font-bold">Claims Demo</h1>
        <p className="text-sm text-muted-foreground">Simulated PPA-style claims workflow. No real submissions.</p>

        <div className="grid md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-4 text-center">
            <Receipt className="h-6 w-6 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{claims.length}</div>
            <div className="text-xs text-muted-foreground">Total Claims</div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold">{claims.filter(c => c.status === 'Approved').length}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold">${totalRebate.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Total Rebates</div>
          </CardContent></Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Submit Claim</CardTitle><CardDescription>Fill in demo claim details</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Pharmacy ID</Label><Input placeholder="e.g. PH-12345" value={pharmacyId} onChange={e => setPharmacyId(e.target.value)} /></div>
              <div><Label>Medicare Number</Label><Input placeholder="e.g. 2345 67890 1" value={medicare} onChange={e => setMedicare(e.target.value)} /></div>
              <div>
                <Label>Service Type</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MedsCheck">MedsCheck ($42.10)</SelectItem>
                    <SelectItem value="DMAP">DMAP ($120.00)</SelectItem>
                    <SelectItem value="Vaccination">Vaccination ($18.85)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                <Send className="h-4 w-4 mr-2" />{submitting ? 'Submitting…' : 'Submit Claim'}
              </Button>
            </CardContent>
          </Card>

          {claims.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Claim Trends</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="service" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="rebate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Rebate ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {claims.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Claim History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead className="hidden sm:table-cell">Medicare</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Rebate</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.id}</TableCell>
                        <TableCell>{c.service}</TableCell>
                        <TableCell className="hidden sm:table-cell font-mono text-xs">{c.medicare}</TableCell>
                        <TableCell><Badge variant="default" className="bg-green-600 text-xs">{c.status}</Badge></TableCell>
                        <TableCell className="text-right font-mono">{c.rebate}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{new Date(c.timestamp).toLocaleDateString('en-AU')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={!!successClaim} onOpenChange={() => setSuccessClaim(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" />Claim Approved</DialogTitle>
              <DialogDescription>Demo claim processed successfully</DialogDescription>
            </DialogHeader>
            {successClaim && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Claim ID</span><span className="font-mono font-medium">{successClaim.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span>{successClaim.service}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rebate</span><span className="font-bold text-green-600">{successClaim.rebate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="default" className="bg-green-600">{successClaim.status}</Badge></div>
                <p className="text-xs text-muted-foreground mt-2">{successClaim.auditNote}</p>
                <Button variant="outline" className="w-full mt-2" onClick={() => toast.info('PDF download stub – demo mode')}>
                  <FileText className="h-4 w-4 mr-2" />Download PDF (stub)
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ClinicalLayout>
  );
}
