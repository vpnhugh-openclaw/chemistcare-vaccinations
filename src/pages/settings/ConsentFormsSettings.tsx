import { useState } from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, FileText, Pencil, Eye, Copy, Check } from 'lucide-react';

interface ConsentForm {
  id: string;
  name: string;
  version: string;
  description: string;
  required: boolean;
  active: boolean;
  lastUpdated: string;
  fields: string[];
}

const INITIAL_FORMS: ConsentForm[] = [
  {
    id: '1',
    name: 'Vaccination Consent',
    version: 'v2.3',
    description: 'Standard consent for all vaccination services. Covers risks, benefits, and emergency procedures.',
    required: true,
    active: true,
    lastUpdated: '2026-03-15',
    fields: ['Patient acknowledgement', 'Risk disclosure', 'Emergency contact', 'Allergies declaration'],
  },
  {
    id: '2',
    name: 'Travel Medicine Consent',
    version: 'v1.8',
    description: 'Consent for travel vaccination and prophylaxis. Includes destination-specific risk disclosure.',
    required: true,
    active: true,
    lastUpdated: '2026-02-28',
    fields: ['Destination disclosure', 'Medical history', 'Pregnancy status', 'Previous reactions'],
  },
  {
    id: '3',
    name: 'Minor Ailment Consultation',
    version: 'v1.5',
    description: 'Consent for pharmacist-led minor ailment consultation and prescribing.',
    required: true,
    active: true,
    lastUpdated: '2026-01-10',
    fields: ['Symptom confirmation', 'Red flag acknowledgement', 'Follow-up agreement'],
  },
  {
    id: '4',
    name: 'SMS Communication Opt-in',
    version: 'v1.2',
    description: 'Patient consent to receive SMS reminders, follow-ups, and health campaigns.',
    required: false,
    active: true,
    lastUpdated: '2026-03-01',
    fields: ['SMS opt-in', 'STOP instructions', 'Privacy notice'],
  },
  {
    id: '5',
    name: '8CPA Service Consent',
    version: 'v2.0',
    description: 'Consent for 8th Community Pharmacy Agreement funded services (Dose Admin Aids, MedsCheck, etc.).',
    required: true,
    active: false,
    lastUpdated: '2025-12-20',
    fields: ['Service description', 'Eligibility confirmation', 'Medicare consent'],
  },
];

export default function ConsentFormsSettings() {
  const [forms, setForms] = useState<ConsentForm[]>(INITIAL_FORMS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', fields: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleActive = (id: string) => {
    setForms(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  const toggleRequired = (id: string) => {
    setForms(prev => prev.map(f => f.id === id ? { ...f, required: !f.required } : f));
  };

  const duplicateForm = (original: ConsentForm) => {
    const copy: ConsentForm = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (Copy)`,
      version: 'v1.0',
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setForms(prev => [copy, ...prev]);
    setCopiedId(copy.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const addForm = () => {
    if (!form.name.trim()) return;
    const newForm: ConsentForm = {
      id: crypto.randomUUID(),
      name: form.name,
      version: 'v1.0',
      description: form.description || 'New consent form template.',
      required: false,
      active: true,
      lastUpdated: new Date().toISOString().slice(0, 10),
      fields: form.fields.split(',').map(f => f.trim()).filter(Boolean) || ['Patient acknowledgement'],
    };
    setForms(prev => [newForm, ...prev]);
    setForm({ name: '', description: '', fields: '' });
    setShowAddForm(false);
  };

  return (
    <SettingsLayout title="Consent Forms">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Forms', value: forms.length },
            { label: 'Active', value: forms.filter(f => f.active).length },
            { label: 'Required', value: forms.filter(f => f.required).length },
            { label: 'Inactive', value: forms.filter(f => !f.active).length },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create New Consent Form</CardTitle>
              <CardDescription>Design a new consent form template for your services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Form Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. COVID-19 Booster Consent" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the purpose and scope of this consent form…" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Fields (comma-separated)</Label>
                <Input value={form.fields} onChange={e => setForm({ ...form, fields: e.target.value })} placeholder="e.g. Risk disclosure, Medical history, Emergency contact" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={addForm}><Plus className="h-4 w-4 mr-1" /> Create Form</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Forms List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Consent Form Templates</CardTitle>
              <CardDescription>Manage consent form templates and version control</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowAddForm(true)}><Plus className="h-4 w-4 mr-1" /> New Form</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {forms.map((f) => (
              <div
                key={f.id}
                className={`rounded-lg border p-3.5 transition-all ${
                  f.active ? 'bg-card' : 'bg-muted/30 opacity-70'
                } ${copiedId === f.id ? 'ring-2 ring-primary/30' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{f.name}</p>
                        <Badge variant="outline" className="text-[0.625rem] font-mono">{f.version}</Badge>
                        {f.required && <Badge variant="destructive" className="text-[0.625rem]">Required</Badge>}
                        {!f.active && <Badge variant="secondary" className="text-[0.625rem]">Inactive</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateForm(f)}>
                      {copiedId === f.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <Separator className="my-2.5" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {f.fields.map(field => (
                      <Badge key={field} variant="secondary" className="text-[0.625rem]">{field}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Switch checked={f.required} onCheckedChange={() => toggleRequired(f.id)} />
                      <span className="text-xs text-muted-foreground">Required</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Switch checked={f.active} onCheckedChange={() => toggleActive(f.id)} />
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                    <span className="text-[0.625rem] text-muted-foreground">Updated {f.lastUpdated}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
