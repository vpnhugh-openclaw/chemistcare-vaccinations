import { useState } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, ExternalLink, AlertTriangle, ChevronDown, Plus, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { defaultAdminSettings, AdminSettings } from '@/data/admin-settings';
import { pharmacyServices as initialServices, PharmacyService, EligibilityQuestion, ServiceAvailability } from '@/data/booking-data';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState<AdminSettings>({ ...defaultAdminSettings });
  const [services, setServices] = useState<PharmacyService[]>([...initialServices]);
  const [editService, setEditService] = useState<PharmacyService | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const bookingUrl = `https://app.chemistcare.com.au/book/${settings.bookingPageSlug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast.success('Link copied!');
  };

  const saveGeneral = () => toast.success('Settings saved.');
  const saveHours = () => toast.success('Working hours saved.');

  const openEdit = (svc: PharmacyService) => {
    setEditService(JSON.parse(JSON.stringify(svc)));
    setEditDialogOpen(true);
  };

  const saveService = () => {
    if (!editService) return;
    setServices(prev => prev.map(s => s.id === editService.id ? editService : s));
    setEditDialogOpen(false);
    toast.success('Service updated.');
  };

  const addQuestion = () => {
    if (!editService) return;
    const q: EligibilityQuestion = { id: `q-${Date.now()}`, question: '', type: 'boolean', required: true };
    setEditService({ ...editService, eligibilityQuestions: [...editService.eligibilityQuestions, q] });
  };

  const updateQuestion = (idx: number, patch: Partial<EligibilityQuestion>) => {
    if (!editService) return;
    const qs = [...editService.eligibilityQuestions];
    qs[idx] = { ...qs[idx], ...patch };
    setEditService({ ...editService, eligibilityQuestions: qs });
  };

  const removeQuestion = (idx: number) => {
    if (!editService) return;
    setEditService({ ...editService, eligibilityQuestions: editService.eligibilityQuestions.filter((_, i) => i !== idx) });
  };

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 space-y-5 animate-fade-in max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold">Practice Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your booking module, notifications, and working hours.</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="hours">Working Hours</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          {/* ── GENERAL ── */}
          <TabsContent value="general" className="mt-4 space-y-5">
            <div className="space-y-4">
              <div>
                <Label>Pharmacy Name</Label>
                <Input value={settings.pharmacyName} onChange={e => setSettings({ ...settings, pharmacyName: e.target.value })} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label>Pharmacy Email</Label>
                  <Badge variant="default" className="text-xs">Appointment alerts</Badge>
                </div>
                <Input type="email" value={settings.pharmacyEmail} onChange={e => setSettings({ ...settings, pharmacyEmail: e.target.value })} />
                <p className="text-xs text-muted-foreground mt-1">Booking notification emails will be sent here</p>
              </div>
              <div>
                <Label>Public Booking Slug</Label>
                <Input value={settings.bookingPageSlug} onChange={e => setSettings({ ...settings, bookingPageSlug: e.target.value })} />
                <p className="text-xs text-muted-foreground mt-1 break-all">{bookingUrl}</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-3.5 w-3.5 mr-1" /> Copy link</Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/book/${settings.bookingPageSlug}`} target="_blank" rel="noopener noreferrer">Preview booking page <ExternalLink className="h-3.5 w-3.5 ml-1" /></a>
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.appointmentNotifications} onCheckedChange={v => setSettings({ ...settings, appointmentNotifications: v })} />
                <Label>Send email notification to pharmacy when a new booking is made</Label>
              </div>
              <Button onClick={saveGeneral}>Save Changes</Button>
            </div>
          </TabsContent>

          {/* ── WORKING HOURS ── */}
          <TabsContent value="hours" className="mt-4 space-y-5">
            <div className="space-y-3">
              {settings.workingHours.map((wh, i) => (
                <div key={wh.day} className="flex items-center gap-3 flex-wrap">
                  <span className="w-24 text-sm font-medium">{wh.day}</span>
                  <Switch
                    checked={!wh.closed}
                    onCheckedChange={v => {
                      const hrs = [...settings.workingHours];
                      hrs[i] = { ...hrs[i], closed: !v };
                      setSettings({ ...settings, workingHours: hrs });
                    }}
                  />
                  <span className="text-xs text-muted-foreground w-12">{wh.closed ? 'Closed' : 'Open'}</span>
                  <Input
                    type="time"
                    value={wh.open}
                    disabled={wh.closed}
                    className="w-28"
                    onChange={e => {
                      const hrs = [...settings.workingHours];
                      hrs[i] = { ...hrs[i], open: e.target.value };
                      setSettings({ ...settings, workingHours: hrs });
                    }}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={wh.close}
                    disabled={wh.closed}
                    className="w-28"
                    onChange={e => {
                      const hrs = [...settings.workingHours];
                      hrs[i] = { ...hrs[i], close: e.target.value };
                      setSettings({ ...settings, workingHours: hrs });
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div>
                <Label>Slot Interval</Label>
                <Select value={String(settings.slotIntervalMinutes)} onValueChange={v => setSettings({ ...settings, slotIntervalMinutes: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 15, 20, 30].map(n => <SelectItem key={n} value={String(n)}>{n} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Min Booking Lead Time</Label>
                <Select value={String(settings.bookingLeadTimeHours)} onValueChange={v => setSettings({ ...settings, bookingLeadTimeHours: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 4, 24].map(n => <SelectItem key={n} value={String(n)}>{n} hour{n > 1 ? 's' : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Booking Window</Label>
                <Select value={String(settings.bookingWindowDays)} onValueChange={v => setSettings({ ...settings, bookingWindowDays: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[7, 14, 28, 60].map(n => <SelectItem key={n} value={String(n)}>{n} days</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={saveHours}>Save Hours</Button>
          </TabsContent>

          {/* ── SERVICES ── */}
          <TabsContent value="services" className="mt-4 space-y-3">
            {services.map(svc => (
              <Card key={svc.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={svc.active}
                      onCheckedChange={v => setServices(prev => prev.map(s => s.id === svc.id ? { ...s, active: v } : s))}
                    />
                    <div>
                      <h3 className="font-semibold text-sm">{svc.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-0.5"><Clock className="h-3 w-3 mr-1" />{svc.durationMinutes} min</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit(svc)}>Edit</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── EDIT SERVICE DIALOG ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          {editService && (
            <div className="space-y-4">
              <div><Label>Service Name</Label><Input value={editService.name} onChange={e => setEditService({ ...editService, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Duration</Label>
                  <Select value={String(editService.durationMinutes)} onValueChange={v => setEditService({ ...editService, durationMinutes: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[10, 15, 20, 30, 45, 60].map(n => <SelectItem key={n} value={String(n)}>{n} min</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* ── Service Availability ── */}
              <div>
                <Label className="font-medium">Service Availability</Label>
                <p className="text-xs text-muted-foreground mb-2">Set which days and times this service is offered.</p>
                <div className="space-y-2">
                  {editService.availability.map((day, di) => (
                    <div key={day.day} className="flex items-center gap-2 flex-wrap">
                      <span className="w-20 text-xs font-medium">{day.day}</span>
                      <Switch
                        checked={day.available}
                        onCheckedChange={v => {
                          const avail = [...editService.availability];
                          avail[di] = { ...avail[di], available: v };
                          setEditService({ ...editService, availability: avail });
                        }}
                      />
                      <span className="text-xs text-muted-foreground w-10">{day.available ? 'On' : 'Off'}</span>
                      <Input
                        type="time"
                        value={day.open}
                        disabled={!day.available}
                        className="w-24 h-8 text-xs"
                        onChange={e => {
                          const avail = [...editService.availability];
                          avail[di] = { ...avail[di], open: e.target.value };
                          setEditService({ ...editService, availability: avail });
                        }}
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={day.close}
                        disabled={!day.available}
                        className="w-24 h-8 text-xs"
                        onChange={e => {
                          const avail = [...editService.availability];
                          avail[di] = { ...avail[di], close: e.target.value };
                          setEditService({ ...editService, availability: avail });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Eligibility Questions</Label>
                  <Button variant="outline" size="sm" onClick={addQuestion}><Plus className="h-3.5 w-3.5 mr-1" /> Add question</Button>
                </div>
                <div className="space-y-2">
                  {editService.eligibilityQuestions.map((q, idx) => (
                    <Collapsible key={q.id}>
                      <div className="flex items-center gap-2 border rounded-lg p-2">
                        <CollapsibleTrigger className="flex-1 text-left text-sm flex items-center gap-2">
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{q.question || '(new question)'}</span>
                          {q.redFlagAnswer && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                          <Badge variant="secondary" className="text-xs ml-auto shrink-0">{q.type}</Badge>
                        </CollapsibleTrigger>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeQuestion(idx)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                      <CollapsibleContent className="p-3 space-y-2 border border-t-0 rounded-b-lg">
                        <div><Label className="text-xs">Question Text</Label><Input value={q.question} onChange={e => updateQuestion(idx, { question: e.target.value })} /></div>
                        <div><Label className="text-xs">Type</Label>
                          <Select value={q.type} onValueChange={v => updateQuestion(idx, { type: v as 'boolean' | 'select' | 'text' })}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="boolean">Boolean</SelectItem><SelectItem value="select">Select</SelectItem><SelectItem value="text">Text</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div><Label className="text-xs">Red Flag Answer (optional)</Label><Input value={q.redFlagAnswer || ''} onChange={e => updateQuestion(idx, { redFlagAnswer: e.target.value || undefined })} placeholder="e.g. Yes" /></div>
                        <div><Label className="text-xs">Red Flag Message (optional)</Label><Textarea value={q.redFlagMessage || ''} onChange={e => updateQuestion(idx, { redFlagMessage: e.target.value || undefined })} rows={2} /></div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>

              <Button onClick={saveService} className="w-full">Save Service</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ClinicalLayout>
  );
};

export default AdminSettingsPage;
