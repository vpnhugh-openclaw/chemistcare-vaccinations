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
import { Plus, MessageSquare, Send, Pencil, Trash2, Clock, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface MessageTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  active: boolean;
  autoSend: boolean;
  delayMinutes: number;
}

const INITIAL_TEMPLATES: MessageTemplate[] = [
  {
    id: '1',
    name: 'Appointment Reminder',
    type: 'SMS',
    subject: '',
    body: 'Hi {patientName}, this is a reminder of your appointment at ChemistCare tomorrow at {appointmentTime}. Reply CONFIRM to confirm or CALL to reschedule.',
    active: true,
    autoSend: true,
    delayMinutes: 1440,
  },
  {
    id: '2',
    name: 'Pre-screening Check',
    type: 'SMS',
    subject: '',
    body: 'Hi {patientName}, before your vaccination tomorrow, please confirm: 1) No fever/illness 2) No allergies to vaccines 3) Not pregnant. Reply YES if all clear or CALL if unsure.',
    active: true,
    autoSend: true,
    delayMinutes: 720,
  },
  {
    id: '3',
    name: 'Follow-up Survey',
    type: 'SMS',
    subject: '',
    body: 'Hi {patientName}, how did your consult go? Rate 1-5 (1=poor, 5=excellent). Any issues? Reply or call (03) 9123 4567. Thanks, ChemistCare. Reply STOP to unsubscribe.',
    active: true,
    autoSend: false,
    delayMinutes: 2880,
  },
  {
    id: '4',
    name: 'Vaccination Certificate Ready',
    type: 'SMS',
    subject: '',
    body: 'Hi {patientName}, your vaccination has been recorded with AIR. Your certificate is available via Medicare app or myGov. Any questions? Call (03) 9123 4567.',
    active: true,
    autoSend: false,
    delayMinutes: 0,
  },
  {
    id: '5',
    name: 'MedsCheck Booking Confirmation',
    type: 'Email',
    subject: 'Your MedsCheck appointment is confirmed',
    body: 'Dear {patientName},\n\nYour MedsCheck appointment is confirmed for {appointmentTime} at ChemistCare.\n\nPlease bring:\n- Medicare card\n- Current medication list\n- Any recent test results\n\nWe look forward to seeing you.\n\nChemistCare Pharmacy',
    active: true,
    autoSend: true,
    delayMinutes: 0,
  },
];

const TYPE_COLOURS: Record<string, string> = {
  SMS: 'bg-blue-50 text-blue-700 border-blue-200',
  Email: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function CommunicationsSettings() {
  const [templates, setTemplates] = useState<MessageTemplate[]>(INITIAL_TEMPLATES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'SMS', subject: '', body: '', autoSend: false, delayMinutes: '0' });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleActive = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const toggleAutoSend = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, autoSend: !t.autoSend } : t));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const addTemplate = () => {
    if (!form.name.trim() || !form.body.trim()) return;
    const newTemplate: MessageTemplate = {
      id: crypto.randomUUID(),
      name: form.name,
      type: form.type,
      subject: form.subject,
      body: form.body,
      active: true,
      autoSend: form.autoSend,
      delayMinutes: parseInt(form.delayMinutes) || 0,
    };
    setTemplates(prev => [newTemplate, ...prev]);
    setForm({ name: '', type: 'SMS', subject: '', body: '', autoSend: false, delayMinutes: '0' });
    setShowAddForm(false);
  };

  const formatDelay = (mins: number) => {
    if (mins === 0) return 'Immediate';
    if (mins < 60) return `${mins} min`;
    if (mins < 1440) return `${Math.round(mins / 60)} hrs`;
    return `${Math.round(mins / 1440)} days`;
  };

  return (
    <SettingsLayout title="Communications">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Templates', value: templates.length },
            { label: 'Active', value: templates.filter(t => t.active).length },
            { label: 'Auto-send', value: templates.filter(t => t.autoSend).length },
            { label: 'Inactive', value: templates.filter(t => !t.active).length },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Template */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New Message Template</CardTitle>
              <CardDescription>Create a new SMS or email template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Template Name *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Booster Reminder" />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <div className="flex gap-2">
                    {(['SMS', 'Email'] as const).map(type => (
                      <Button
                        key={type}
                        type="button"
                        variant={form.type === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setForm({ ...form, type })}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              {form.type === 'Email' && (
                <div className="space-y-1.5">
                  <Label>Email Subject</Label>
                  <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject line…" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Message Body *</Label>
                <Textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Template message… Use {patientName}, {appointmentTime} as placeholders." rows={4} />
                <p className="text-[0.625rem] text-muted-foreground">Available placeholders: {'{patientName}'}, {'{appointmentTime}'}, {'{serviceName}'}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Switch checked={form.autoSend} onCheckedChange={v => setForm({ ...form, autoSend: v })} />
                  <div>
                    <Label className="text-sm">Auto-send</Label>
                    <p className="text-xs text-muted-foreground">Send automatically after trigger</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Delay</Label>
                  <Input type="number" value={form.delayMinutes} onChange={e => setForm({ ...form, delayMinutes: e.target.value })} min={0} placeholder="Minutes" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={addTemplate}><Plus className="h-4 w-4 mr-1" /> Create Template</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Templates List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Message Templates</CardTitle>
              <CardDescription>SMS templates, email settings, and follow-up rules</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowAddForm(true)}><Plus className="h-4 w-4 mr-1" /> New Template</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((t) => (
              <div
                key={t.id}
                className={`rounded-lg border p-3.5 transition-all ${
                  t.active ? 'bg-card' : 'bg-muted/30 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{t.name}</p>
                        <Badge variant="outline" className={`text-[0.625rem] ${TYPE_COLOURS[t.type]}`}>{t.type}</Badge>
                        {!t.active && <Badge variant="secondary" className="text-[0.625rem]">Inactive</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {t.autoSend ? (
                          <span className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                            <Send className="h-3 w-3" /> Auto-send ({formatDelay(t.delayMinutes)})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                            <Clock className="h-3 w-3" /> Manual send
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteTemplate(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {expandedId === t.id && (
                  <>
                    <Separator className="my-2.5" />
                    <div className="space-y-2">
                      {t.subject && (
                        <div>
                          <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wider">Subject</p>
                          <p className="text-sm font-medium">{t.subject}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wider">Body</p>
                        <div className="text-sm bg-muted/50 rounded-md p-2.5 font-mono text-xs leading-relaxed">{t.body}</div>
                      </div>
                      <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Switch checked={t.active} onCheckedChange={() => toggleActive(t.id)} />
                          <span className="text-xs">{t.active ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Switch checked={t.autoSend} onCheckedChange={() => toggleAutoSend(t.id)} />
                          <span className="text-xs">Auto-send</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
