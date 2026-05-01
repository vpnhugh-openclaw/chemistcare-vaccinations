import { useState } from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Syringe, AlertTriangle, Thermometer, CheckCircle2, Clock } from 'lucide-react';

interface VaccineVial {
  id: string;
  brand: string;
  type: string;
  batchNumber: string;
  expiryDate: string;
  dosesRemaining: number;
  totalDoses: number;
  status: 'active' | 'low' | 'expired' | 'depleted';
  storageTemp: string;
  minAge: string;
  ndc: string; // National Drug Code / AUST R number
}

const INITIAL_VIALS: VaccineVial[] = [
  {
    id: '1',
    brand: 'Comirnaty (Pfizer)',
    type: 'COVID-19 mRNA',
    batchNumber: 'PF-2026-B78432',
    expiryDate: '2026-08-15',
    dosesRemaining: 24,
    totalDoses: 30,
    status: 'active',
    storageTemp: '-70°C to -10°C (ultra-cold)',
    minAge: '12+',
    ndc: 'AUST R 123456',
  },
  {
    id: '2',
    brand: 'Spikevax (Moderna)',
    type: 'COVID-19 mRNA',
    batchNumber: 'MOD-2026-A99102',
    expiryDate: '2026-07-22',
    dosesRemaining: 8,
    totalDoses: 20,
    status: 'low',
    storageTemp: '-50°C to -15°C',
    minAge: '12+',
    ndc: 'AUST R 234567',
  },
  {
    id: '3',
    brand: 'FluQuadri (Sanofi)',
    type: 'Influenza quadrivalent',
    batchNumber: 'SN-2026-F33491',
    expiryDate: '2026-06-01',
    dosesRemaining: 45,
    totalDoses: 50,
    status: 'active',
    storageTemp: '2°C to 8°C',
    minAge: '6 months+',
    ndc: 'AUST R 345678',
  },
  {
    id: '4',
    brand: 'Shingrix (GSK)',
    type: 'Shingles (HZ/su)',
    batchNumber: 'GSK-2026-S11029',
    expiryDate: '2026-09-30',
    dosesRemaining: 12,
    totalDoses: 15,
    status: 'active',
    storageTemp: '2°C to 8°C',
    minAge: '50+',
    ndc: 'AUST R 456789',
  },
  {
    id: '5',
    brand: 'Boostrix (GSK)',
    type: 'DTPa (dTpa booster)',
    batchNumber: 'GSK-2026-B55201',
    expiryDate: '2026-05-10',
    dosesRemaining: 2,
    totalDoses: 10,
    status: 'low',
    storageTemp: '2°C to 8°C',
    minAge: '10+',
    ndc: 'AUST R 567890',
  },
  {
    id: '6',
    brand: 'Vaxelis (Sanofi/MSD)',
    type: 'Hexavalent (DTPa-Hib-HepB-IPV)',
    batchNumber: 'SMSD-2026-V7721',
    expiryDate: '2026-04-20',
    dosesRemaining: 0,
    totalDoses: 10,
    status: 'depleted',
    storageTemp: '2°C to 8°C',
    minAge: '6 weeks+',
    ndc: 'AUST R 678901',
  },
  {
    id: '7',
    brand: 'Nimenrix (Pfizer)',
    type: 'Meningococcal ACWY',
    batchNumber: 'PF-2026-N4412',
    expiryDate: '2026-03-15',
    dosesRemaining: 18,
    totalDoses: 20,
    status: 'expired',
    storageTemp: '2°C to 8°C',
    minAge: '6 weeks+',
    ndc: 'AUST R 789012',
  },
  {
    id: '8',
    brand: 'Gardasil 9 (MSD)',
    type: 'HPV 9-valent',
    batchNumber: 'MSD-2026-G8819',
    expiryDate: '2026-11-01',
    dosesRemaining: 36,
    totalDoses: 40,
    status: 'active',
    storageTemp: '2°C to 8°C',
    minAge: '9+',
    ndc: 'AUST R 890123',
  },
];

const STATUS_CONFIG = {
  active: { label: 'Active', colour: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> },
  low: { label: 'Low Stock', colour: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> },
  expired: { label: 'Expired', colour: 'bg-red-50 text-red-700 border-red-200', icon: <Clock className="h-3.5 w-3.5 text-red-500" /> },
  depleted: { label: 'Depleted', colour: 'bg-slate-100 text-slate-500 border-slate-200', icon: <Syringe className="h-3.5 w-3.5 text-slate-400" /> },
};

export default function VaccinesSettings() {
  const [vials, setVials] = useState<VaccineVial[]>(INITIAL_VIALS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ brand: '', type: '', batchNumber: '', expiryDate: '', totalDoses: '10', storageTemp: '', minAge: '', ndc: '' });
  const [filter, setFilter] = useState<'active' | 'low' | 'expired' | 'depleted' | 'all'>('all');

  const stats = {
    total: vials.length,
    active: vials.filter(v => v.status === 'active').length,
    low: vials.filter(v => v.status === 'low').length,
    expired: vials.filter(v => v.status === 'expired').length,
    depleted: vials.filter(v => v.status === 'depleted').length,
    totalDoses: vials.reduce((sum, v) => sum + v.dosesRemaining, 0),
  };

  const filtered = filter === 'all' ? vials : vials.filter(v => v.status === filter);

  const addVial = () => {
    if (!form.brand.trim() || !form.batchNumber.trim()) return;
    const total = parseInt(form.totalDoses) || 10;
    const newVial: VaccineVial = {
      id: crypto.randomUUID(),
      brand: form.brand,
      type: form.type || 'Other',
      batchNumber: form.batchNumber,
      expiryDate: form.expiryDate || new Date().toISOString().slice(0, 10),
      dosesRemaining: total,
      totalDoses: total,
      status: 'active',
      storageTemp: form.storageTemp || '2°C to 8°C',
      minAge: form.minAge || 'All ages',
      ndc: form.ndc || 'Pending',
    };
    setVials(prev => [newVial, ...prev]);
    setForm({ brand: '', type: '', batchNumber: '', expiryDate: '', totalDoses: '10', storageTemp: '', minAge: '', ndc: '' });
    setShowAddForm(false);
  };

  const adjustDoses = (id: string, delta: number) => {
    setVials(prev => prev.map(v => {
      if (v.id !== id) return v;
      const newRemaining = Math.max(0, v.dosesRemaining + delta);
      let newStatus: VaccineVial['status'] = v.status;
      if (newRemaining === 0) newStatus = 'depleted';
      else if (newRemaining <= 3 && newRemaining > 0) newStatus = 'low';
      else if (v.status !== 'expired') newStatus = 'active';
      return { ...v, dosesRemaining: newRemaining, status: newStatus };
    }));
  };

  return (
    <SettingsLayout title="Vaccines">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total SKUs', value: stats.total },
            { label: 'Active', value: stats.active, colour: 'text-emerald-600' },
            { label: 'Low Stock', value: stats.low, colour: 'text-amber-600' },
            { label: 'Expired', value: stats.expired, colour: 'text-red-600' },
            { label: 'Depleted', value: stats.depleted, colour: 'text-slate-500' },
            { label: 'Total Doses', value: stats.totalDoses, colour: 'text-primary' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-semibold mt-1 ${stat.colour || ''}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Vial Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Vaccine Stock</CardTitle>
              <CardDescription>Record a new vaccine batch into inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Brand Name *</Label>
                  <Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Comirnaty (Pfizer)" />
                </div>
                <div className="space-y-1.5">
                  <Label>Vaccine Type</Label>
                  <Input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="e.g. COVID-19 mRNA" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Batch Number *</Label>
                  <Input value={form.batchNumber} onChange={e => setForm({ ...form, batchNumber: e.target.value })} placeholder="e.g. PF-2026-B12345" />
                </div>
                <div className="space-y-1.5">
                  <Label>Expiry Date</Label>
                  <Input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Total Doses</Label>
                  <Input type="number" value={form.totalDoses} onChange={e => setForm({ ...form, totalDoses: e.target.value })} min={1} />
                </div>
                <div className="space-y-1.5">
                  <Label>Storage Temp</Label>
                  <Input value={form.storageTemp} onChange={e => setForm({ ...form, storageTemp: e.target.value })} placeholder="2°C to 8°C" />
                </div>
                <div className="space-y-1.5">
                  <Label>Min Age</Label>
                  <Input value={form.minAge} onChange={e => setForm({ ...form, minAge: e.target.value })} placeholder="12+" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>AUST R / NDC Number</Label>
                <Input value={form.ndc} onChange={e => setForm({ ...form, ndc: e.target.value })} placeholder="AUST R XXXXXX" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={addVial}><Plus className="h-4 w-4 mr-1" /> Add Stock</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter + Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Vaccine Inventory</CardTitle>
              <CardDescription>Manage vaccine brands, batches, and stock levels</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-secondary/50 rounded-md p-0.5">
                {(['all', 'active', 'low', 'expired', 'depleted'] as const).map(f => (
                  <Button
                    key={f}
                    variant="ghost"
                    size="sm"
                    className={`h-7 text-xs capitalize ${filter === f ? 'bg-card shadow-sm' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </Button>
                ))}
              </div>
              <Button size="sm" onClick={() => setShowAddForm(true)}><Plus className="h-4 w-4 mr-1" /> Add Stock</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Vaccine</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Batch / AUST R</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Expiry</TableHead>
                    <TableHead className="text-xs">Stock</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Storage</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((vial) => {
                    const pct = Math.round((vial.dosesRemaining / vial.totalDoses) * 100);
                    const status = STATUS_CONFIG[vial.status];
                    const isExpired = new Date(vial.expiryDate) < new Date();
                    return (
                      <TableRow key={vial.id} className={vial.status === 'depleted' ? 'opacity-50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 shrink-0">
                              <Syringe className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{vial.brand}</p>
                              <p className="text-xs text-muted-foreground">{vial.type}</p>
                              <p className="text-[0.625rem] text-muted-foreground">Min age: {vial.minAge}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-xs font-mono">{vial.batchNumber}</p>
                          <p className="text-[0.625rem] text-muted-foreground">{vial.ndc}</p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <p className={`text-xs ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                            {new Date(vial.expiryDate).toLocaleDateString('en-AU')}
                          </p>
                          {isExpired && <p className="text-[0.625rem] text-red-500">EXPIRED</p>}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5 w-32">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">{vial.dosesRemaining}</span>
                              <span className="text-muted-foreground">/ {vial.totalDoses}</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                            <p className="text-[0.625rem] text-muted-foreground">{pct}% remaining</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{vial.storageTemp}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {status.icon}
                            <Badge variant="outline" className={`text-[0.625rem] ${status.colour}`}>{status.label}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => adjustDoses(vial.id, -1)}
                              disabled={vial.dosesRemaining <= 0}
                            >
                              -1
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => adjustDoses(vial.id, 1)}
                              disabled={vial.dosesRemaining >= vial.totalDoses}
                            >
                              +1
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No vaccines match the selected filter.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
