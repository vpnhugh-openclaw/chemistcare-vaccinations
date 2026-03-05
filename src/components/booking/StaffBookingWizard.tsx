import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { GuidedWizard, WizardStep } from '@/components/wizard/GuidedWizard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { Clock, Search, UserPlus, ArrowLeft } from 'lucide-react';
import { pharmacyServices, sampleAppointments, AppointmentSlot, PharmacyService } from '@/data/booking-data';
import { defaultAdminSettings } from '@/data/admin-settings';
import { toast } from 'sonner';

/* ─── Demo data ─── */
const DEMO_PATIENTS = [
  { id: 'p-1', name: 'Emma Thompson', dob: '1985-03-15', lastVaccination: '2025-04-10' },
  { id: 'p-2', name: 'James Wilson', dob: '1992-07-22', lastVaccination: '2025-01-05' },
  { id: 'p-3', name: 'Sarah Chen', dob: '1978-11-30', lastVaccination: '2024-09-18' },
  { id: 'p-4', name: 'Michael Brown', dob: '2001-05-08', lastVaccination: null },
];

const DEMO_STAFF = [
  { id: 's-1', name: 'Dr Sarah Chen', role: 'Pharmacist' },
  { id: 's-2', name: 'James Murphy', role: 'Pharmacist' },
  { id: 's-3', name: 'Lisa Nguyen', role: 'Immunisation Pharmacist' },
];

const DEMO_ROOMS = [
  { id: 'r-1', name: 'Consultation Room 1' },
  { id: 'r-2', name: 'Consultation Room 2' },
  { id: 'r-3', name: 'Immunisation Bay' },
];

/* ─── Slot generation ─── */
function generateSlots(date: Date, service: PharmacyService | null): string[] {
  const dayName = format(date, 'EEEE');
  const wh = defaultAdminSettings.workingHours.find(d => d.day === dayName);
  if (!wh || wh.closed) return [];
  if (service?.availability) {
    const svcDay = service.availability.find(d => d.day === dayName);
    if (!svcDay || !svcDay.available) return [];
    const startMin = Math.max(
      ...([wh.open, svcDay.open].map(t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; }))
    );
    const endMin = Math.min(
      ...([wh.close, svcDay.close].map(t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; }))
    );
    if (startMin >= endMin) return [];
    const slots: string[] = [];
    for (let m = startMin; m < endMin; m += defaultAdminSettings.slotIntervalMinutes) {
      slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    }
    return slots;
  }
  const [oh, om] = wh.open.split(':').map(Number);
  const [ch, cm] = wh.close.split(':').map(Number);
  const slots: string[] = [];
  for (let m = oh * 60 + om; m < ch * 60 + cm; m += defaultAdminSettings.slotIntervalMinutes) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return slots;
}

type FormData = Record<string, unknown>;

interface Props {
  onComplete: (apt: AppointmentSlot) => void;
  onCancel: () => void;
}

export function StaffBookingWizard({ onComplete, onCancel }: Props) {
  const [data, setData] = useState<FormData>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [newPatient, setNewPatient] = useState<FormData>({});

  const activeServices = useMemo(() => pharmacyServices.filter(s => s.active), []);
  const selectedService = activeServices.find(s => s.id === data.service_id) || null;
  const selectedPatient = DEMO_PATIENTS.find(p => p.id === data.patient_id);
  const maxDate = addDays(new Date(), defaultAdminSettings.bookingWindowDays);

  const update = useCallback((patch: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const filteredPatients = DEMO_PATIENTS.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.dob.includes(q);
  });

  const handleCreatePatient = () => {
    const newId = `p-new-${Date.now()}`;
    const name = `${newPatient.first_name || ''} ${newPatient.last_name || ''}`.trim();
    DEMO_PATIENTS.push({
      id: newId,
      name,
      dob: (newPatient.np_dob as string) || '',
      lastVaccination: null,
    });
    update({ patient_id: newId });
    setShowCreatePatient(false);
    setNewPatient({});
    toast.success(`Patient "${name}" created`);
  };

  const handleComplete = useCallback((formData: FormData) => {
    const svc = activeServices.find(s => s.id === formData.service_id);
    const patient = DEMO_PATIENTS.find(p => p.id === formData.patient_id);
    const staff = DEMO_STAFF.find(s => s.id === formData.staff_id);
    const dateObj = formData.date as Date;
    const apt: AppointmentSlot = {
      id: `apt-${Date.now()}`,
      date: dateObj ? format(dateObj, 'yyyy-MM-dd') : '',
      time: (formData.time as string) || '',
      durationMinutes: svc?.durationMinutes || 15,
      pharmacistName: staff?.name || 'Unassigned',
      service: svc?.name || '',
      status: 'confirmed',
      patientName: patient?.name || '',
      patientEmail: '',
      patientPhone: '',
      notes: (formData.notes as string) || '',
    };
    onComplete(apt);
    toast.success(`Appointment booked for ${patient?.name}`);
  }, [activeServices, onComplete]);

  /* ── Create Patient sub-wizard ── */
  if (showCreatePatient) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setShowCreatePatient(false)} className="gap-1.5 mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Button>
        <h2 className="text-xl font-bold">Create New Patient</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First Name <span className="text-destructive">*</span></Label>
              <Input value={(newPatient.first_name as string) || ''} onChange={e => setNewPatient(p => ({ ...p, first_name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name <span className="text-destructive">*</span></Label>
              <Input value={(newPatient.last_name as string) || ''} onChange={e => setNewPatient(p => ({ ...p, last_name: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date of Birth <span className="text-destructive">*</span></Label>
              <Input type="date" value={(newPatient.np_dob as string) || ''} onChange={e => setNewPatient(p => ({ ...p, np_dob: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={(newPatient.gender as string) || ''} onValueChange={v => setNewPatient(p => ({ ...p, gender: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Medicare Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input value={(newPatient.medicare as string) || ''} onChange={e => setNewPatient(p => ({ ...p, medicare: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={(newPatient.phone as string) || ''} onChange={e => setNewPatient(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={(newPatient.email as string) || ''} onChange={e => setNewPatient(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Allergies & Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea value={(newPatient.allergies as string) || ''} onChange={e => setNewPatient(p => ({ ...p, allergies: e.target.value }))} rows={2} />
          </div>
          <Button
            onClick={handleCreatePatient}
            disabled={!newPatient.first_name || !newPatient.last_name || !newPatient.np_dob}
            className="w-full"
          >
            Create Patient & Continue
          </Button>
        </div>
      </div>
    );
  }

  /* ── Step definitions ── */
  const steps: WizardStep[] = [
    {
      id: 'patient',
      title: 'Find or create patient',
      schema: z.object({ patient_id: z.string().min(1) }).passthrough(),
      component: (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or DOB…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredPatients.map(p => (
              <Card
                key={p.id}
                className={cn(
                  'cursor-pointer transition-all hover:border-primary',
                  data.patient_id === p.id && 'border-primary border-2 bg-secondary/20',
                )}
                onClick={() => update({ patient_id: p.id })}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">DOB: {p.dob}</p>
                  </div>
                  {p.lastVaccination && (
                    <Badge variant="outline" className="text-xs">Last vax: {p.lastVaccination}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredPatients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No patients found</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => setShowCreatePatient(true)}>
            <UserPlus className="h-4 w-4" /> Create new patient
          </Button>
        </div>
      ),
    },
    {
      id: 'service',
      title: 'Select a service',
      schema: z.object({ service_id: z.string().min(1) }).passthrough(),
      component: (
        <div className="space-y-2">
          {activeServices.map(svc => (
            <Card
              key={svc.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary',
                data.service_id === svc.id && 'border-primary border-2 bg-secondary/20',
              )}
              onClick={() => update({ service_id: svc.id })}
            >
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-sm">{svc.name}</h3>
                </div>
                <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                  <Clock className="h-3 w-3" />{svc.durationMinutes} min
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },
    {
      id: 'datetime',
      title: 'Select date and time',
      schema: z.object({ date: z.date(), time: z.string().min(1) }).passthrough(),
      component: (
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={data.date as Date | undefined}
            onSelect={d => { if (d) update({ date: d, time: '' }); }}
            disabled={d => d < new Date() || d > maxDate}
            className={cn('rounded-xl border p-3 pointer-events-auto mx-auto')}
          />
          {data.date && (() => {
            const slots = generateSlots(data.date as Date, selectedService);
            if (slots.length === 0) return <p className="text-sm text-muted-foreground text-center">No availability.</p>;
            const booked = new Set(sampleAppointments.filter(a => a.date === format(data.date as Date, 'yyyy-MM-dd')).map(a => a.time));
            return (
              <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto">
                {slots.map(s => (
                  <Button key={s} size="sm" variant={data.time === s ? 'default' : 'outline'} disabled={booked.has(s)} onClick={() => update({ time: s })} className="text-xs h-8">
                    {booked.has(s) ? '—' : s}
                  </Button>
                ))}
              </div>
            );
          })()}
        </div>
      ),
    },
    {
      id: 'staff-room',
      title: 'Assign staff and room',
      schema: z.object({ staff_id: z.string().min(1), room_id: z.string().min(1) }).passthrough(),
      component: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Staff Member <span className="text-destructive">*</span></Label>
            <Select value={(data.staff_id as string) || ''} onValueChange={v => update({ staff_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
              <SelectContent>
                {DEMO_STAFF.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} — {s.role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Room <span className="text-destructive">*</span></Label>
            <Select value={(data.room_id as string) || ''} onValueChange={v => update({ room_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
              <SelectContent>
                {DEMO_ROOMS.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      id: 'notes',
      title: 'Any notes?',
      subtitle: 'Add any relevant notes for this appointment',
      schema: z.object({}).passthrough(),
      optional: true,
      component: (
        <div className="space-y-1.5">
          <Textarea
            value={(data.notes as string) || ''}
            onChange={e => update({ notes: e.target.value })}
            rows={4}
            placeholder="Optional notes…"
          />
        </div>
      ),
    },
    {
      id: 'confirm',
      title: 'Confirm booking',
      submitLabel: 'Confirm & Book',
      schema: z.object({}).passthrough(),
      component: (
        <div className="rounded-lg border p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium">{selectedPatient?.name || '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{selectedService?.name || '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{data.date ? format(data.date as Date, 'PPP') : '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{(data.time as string) || '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Staff</span><span className="font-medium">{DEMO_STAFF.find(s => s.id === data.staff_id)?.name || '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span className="font-medium">{DEMO_ROOMS.find(r => r.id === data.room_id)?.name || '—'}</span></div>
          {data.notes && <div className="flex justify-between"><span className="text-muted-foreground">Notes</span><span className="font-medium">{data.notes as string}</span></div>}
        </div>
      ),
    },
  ];

  return (
    <GuidedWizard
      steps={steps}
      data={data}
      onDataChange={setData}
      onComplete={handleComplete}
      onCancel={onCancel}
      allowEsc
    />
  );
}
