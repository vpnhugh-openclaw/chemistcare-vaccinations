import { useState } from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Stethoscope, Clock, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

interface PharmacyService {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number | null;
  bulkBill: boolean;
  active: boolean;
  description: string;
  requiresBooking: boolean;
}

const INITIAL_SERVICES: PharmacyService[] = [
  {
    id: '1',
    name: 'Vaccination Consultation',
    category: 'Immunisation',
    duration: 20,
    price: null,
    bulkBill: true,
    active: true,
    description: 'All NIP-funded and private vaccinations. Includes pre-screening, administration, and AIR reporting.',
    requiresBooking: true,
  },
  {
    id: '2',
    name: 'Travel Medicine Consult',
    category: 'Travel Health',
    duration: 30,
    price: 45,
    bulkBill: false,
    active: true,
    description: 'Destination-specific risk assessment, vaccination schedule, and malaria prophylaxis advice.',
    requiresBooking: true,
  },
  {
    id: '3',
    name: 'MedsCheck',
    category: '8CPA Program',
    duration: 30,
    price: null,
    bulkBill: true,
    active: true,
    description: 'Medication review for patients on 5+ medications. Funded under 8CPA.',
    requiresBooking: true,
  },
  {
    id: '4',
    name: 'Diabetes MedsCheck',
    category: '8CPA Program',
    duration: 45,
    price: null,
    bulkBill: true,
    active: true,
    description: 'Specialised medication review for Type 2 diabetes patients. Funded under 8CPA.',
    requiresBooking: true,
  },
  {
    id: '5',
    name: 'Dose Administration Aid',
    category: '8CPA Program',
    duration: 15,
    price: null,
    bulkBill: true,
    active: true,
    description: 'Webster-pak or sachet packaging for patients with compliance difficulties.',
    requiresBooking: false,
  },
  {
    id: '6',
    name: 'Minor Ailment Consult',
    category: 'Clinical',
    duration: 15,
    price: null,
    bulkBill: true,
    active: true,
    description: 'Assessment and treatment for 22 supported minor ailments under pharmacist prescribing scope.',
    requiresBooking: false,
  },
  {
    id: '7',
    name: 'OCP Resupply',
    category: 'Clinical',
    duration: 10,
    price: null,
    bulkBill: true,
    active: true,
    description: 'Oral contraceptive resupply for eligible patients with existing prescription history.',
    requiresBooking: false,
  },
  {
    id: '8',
    name: 'Emergency Contraception',
    category: 'Clinical',
    duration: 10,
    price: 25,
    bulkBill: false,
    active: true,
    description: 'Levonorgestrel (Postinor-1) or ulipristal (EllaOne) supply with counselling.',
    requiresBooking: false,
  },
  {
    id: '9',
    name: 'Strep A Testing',
    category: 'Point-of-Care',
    duration: 15,
    price: 15,
    bulkBill: false,
    active: false,
    description: 'Rapid antigen testing for Group A Streptococcus with antibiotic supply if positive.',
    requiresBooking: false,
  },
  {
    id: '10',
    name: 'UTI Consultation',
    category: 'Clinical',
    duration: 15,
    price: null,
    bulkBill: true,
    active: true,
    description: 'Uncomplicated UTI assessment and antibiotic supply for eligible female patients.',
    requiresBooking: false,
  },
];

const CATEGORY_COLOURS: Record<string, string> = {
  Immunisation: 'bg-blue-50 text-blue-700 border-blue-200',
  'Travel Health': 'bg-purple-50 text-purple-700 border-purple-200',
  '8CPA Program': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Clinical: 'bg-amber-50 text-amber-700 border-amber-200',
  'Point-of-Care': 'bg-pink-50 text-pink-700 border-pink-200',
};

export default function ServicesSettings() {
  const [services, setServices] = useState<PharmacyService[]>(INITIAL_SERVICES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Clinical', duration: '15', price: '', bulkBill: true, description: '', requiresBooking: true });

  const toggleActive = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const addService = () => {
    if (!form.name.trim()) return;
    const newService: PharmacyService = {
      id: crypto.randomUUID(),
      name: form.name,
      category: form.category,
      duration: parseInt(form.duration) || 15,
      price: form.price ? parseFloat(form.price) : null,
      bulkBill: form.bulkBill,
      active: true,
      description: form.description || 'New pharmacy service.',
      requiresBooking: form.requiresBooking,
    };
    setServices(prev => [newService, ...prev]);
    setForm({ name: '', category: 'Clinical', duration: '15', price: '', bulkBill: true, description: '', requiresBooking: true });
    setShowAddForm(false);
  };

  const stats = {
    total: services.length,
    active: services.filter(s => s.active).length,
    funded: services.filter(s => s.price === null && s.active).length,
    private: services.filter(s => s.price !== null && s.active).length,
  };

  return (
    <SettingsLayout title="Services">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Services', value: stats.total },
            { label: 'Active', value: stats.active },
            { label: 'Funded (8CPA/NIP)', value: stats.funded },
            { label: 'Private Fee', value: stats.private },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Service */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add New Service</CardTitle>
              <CardDescription>Configure a new pharmacy service offering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Service Name *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Skin Check Screening" />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Clinical" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Duration (min)</Label>
                  <Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} min={5} step={5} />
                </div>
                <div className="space-y-1.5">
                  <Label>Price ($)</Label>
                  <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Leave blank for funded" />
                </div>
                <div className="space-y-1.5">
                  <Label>Requires Booking</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch checked={form.requiresBooking} onCheckedChange={v => setForm({ ...form, requiresBooking: v })} />
                    <span className="text-sm">{form.requiresBooking ? 'Yes' : 'Walk-in'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief service description…" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={addService}><Plus className="h-4 w-4 mr-1" /> Add Service</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Pharmacy Services</CardTitle>
              <CardDescription>Configure available services and booking types</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowAddForm(true)}><Plus className="h-4 w-4 mr-1" /> Add Service</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {services.map((svc) => (
              <div
                key={svc.id}
                className={`rounded-lg border p-3.5 transition-all ${
                  svc.active ? 'bg-card' : 'bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 shrink-0 mt-0.5">
                      <Stethoscope className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{svc.name}</p>
                        <Badge variant="outline" className={`text-[0.625rem] ${CATEGORY_COLOURS[svc.category] || 'bg-slate-50 text-slate-700'}`}>
                          {svc.category}
                        </Badge>
                        {svc.bulkBill && svc.price === null && (
                          <Badge variant="secondary" className="text-[0.625rem]"><DollarSign className="h-3 w-3 mr-0.5 inline" />Funded</Badge>
                        )}
                        {svc.price !== null && (
                          <Badge variant="secondary" className="text-[0.625rem]">${svc.price}</Badge>
                        )}
                        {!svc.active && <Badge variant="destructive" className="text-[0.625rem]">Inactive</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{svc.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                          <Clock className="h-3 w-3" /> {svc.duration} min
                        </span>
                        <span className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                          {svc.requiresBooking ? (
                            <><CheckCircle2 className="h-3 w-3" /> Booking required</>
                          ) : (
                            <><AlertCircle className="h-3 w-3" /> Walk-in accepted</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Switch checked={svc.active} onCheckedChange={() => toggleActive(svc.id)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
