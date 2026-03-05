import { useState, useCallback, useMemo, useRef } from 'react';
import { z } from 'zod';
import { GuidedWizard, WizardStep } from '@/components/wizard/GuidedWizard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { Clock, CheckCircle2, Copy, Download, CalendarIcon } from 'lucide-react';
import { pharmacyServices, sampleAppointments, AppointmentSlot, PharmacyService } from '@/data/booking-data';
import { defaultAdminSettings } from '@/data/admin-settings';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import SignatureCanvas from 'react-signature-canvas';

/* ─── Slot generation (reused from existing) ─── */
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

function getBookedTimes(date: Date): Set<string> {
  return new Set(sampleAppointments.filter(a => a.date === format(date, 'yyyy-MM-dd')).map(a => a.time));
}

function generateICS(apt: AppointmentSlot, pharmacyName: string): string {
  const startDate = new Date(`${apt.date}T${apt.time}:00`);
  const endDate = new Date(startDate.getTime() + apt.durationMinutes * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${apt.service} — ${pharmacyName}\nDTSTART:${fmt(startDate)}\nDTEND:${fmt(endDate)}\nDESCRIPTION:Pharmacist consultation at ${pharmacyName}\nEND:VEVENT\nEND:VCALENDAR`;
}

/* ─── Types ─── */
type FormData = Record<string, unknown>;

interface Props {
  pharmacySlug?: string;
  onBookingComplete?: (apt: AppointmentSlot) => void;
}

export function PublicBookingWizard({ pharmacySlug, onBookingComplete }: Props) {
  const [data, setData] = useState<FormData>({});
  const [completed, setCompleted] = useState(false);
  const [bookedApt, setBookedApt] = useState<AppointmentSlot | null>(null);
  const sigRef = useRef<SignatureCanvas>(null);
  const storageKey = `chemistcare_booking_${pharmacySlug || 'default'}`;

  const pharmacyName = defaultAdminSettings.pharmacyName;
  const maxDate = addDays(new Date(), defaultAdminSettings.bookingWindowDays);
  const activeServices = useMemo(() => pharmacyServices.filter(s => s.active), []);
  const selectedService = activeServices.find(s => s.id === data.service_id) || null;

  const update = useCallback((patch: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const handleComplete = useCallback((formData: FormData) => {
    const svc = activeServices.find(s => s.id === formData.service_id);
    const dateObj = formData.date as Date;
    const apt: AppointmentSlot = {
      id: `apt-${Date.now()}`,
      date: dateObj ? format(dateObj, 'yyyy-MM-dd') : '',
      time: (formData.time as string) || '',
      durationMinutes: svc?.durationMinutes || 15,
      pharmacistName: 'Assigned on arrival',
      service: svc?.name || '',
      status: 'confirmed',
      patientName: `${formData.first_name} ${formData.last_name}`,
      patientEmail: (formData.email as string) || '',
      patientPhone: (formData.phone as string) || '',
      notes: (formData.allergies_detail as string) || '',
    };
    setBookedApt(apt);
    setCompleted(true);
    localStorage.removeItem(storageKey);
    onBookingComplete?.(apt);
    toast.success('Your booking is confirmed!');
  }, [activeServices, storageKey, onBookingComplete]);

  if (completed && bookedApt) {
    const bookingRef = bookedApt.id.toUpperCase();
    return (
      <div className="space-y-6 text-center py-4">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">You're booked in! ✓</h2>
        <div className="rounded-lg border p-4 space-y-2 text-sm text-left max-w-sm mx-auto">
          <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium">{bookedApt.patientName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{bookedApt.service}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{bookedApt.date}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{bookedApt.time}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Pharmacy</span><span className="font-medium">{pharmacyName}</span></div>
        </div>

        {/* Booking reference */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Booking Reference</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-lg font-bold tracking-wider">{bookingRef}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => { navigator.clipboard.writeText(bookingRef); toast.success('Copied!'); }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <QRCode value={bookingRef} size={120} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const blob = new Blob([generateICS(bookedApt, pharmacyName)], { type: 'text/calendar' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'appointment.ics'; a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <CalendarIcon className="h-4 w-4" /> Add to Calendar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const svg = document.querySelector('.qr-container svg');
              if (!svg) return;
              const canvas = document.createElement('canvas');
              canvas.width = 240; canvas.height = 240;
              const ctx = canvas.getContext('2d');
              const img = new Image();
              img.onload = () => { ctx?.drawImage(img, 0, 0, 240, 240); const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'booking-qr.png'; a.click(); };
              img.src = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svg));
            }}
          >
            <Download className="h-4 w-4" /> Save QR
          </Button>
        </div>
      </div>
    );
  }

  /* ── Step definitions ── */
  const steps: WizardStep[] = [
    {
      id: 'service',
      title: 'What would you like to book?',
      subtitle: 'Select a service below',
      schema: z.object({ service_id: z.string().min(1) }).passthrough(),
      component: (
        <div className="space-y-3">
          {activeServices.map(svc => (
            <Card
              key={svc.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary hover:shadow-sm',
                data.service_id === svc.id && 'border-primary border-2 bg-secondary/20 shadow-sm',
              )}
              onClick={() => update({ service_id: svc.id })}
            >
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm">{svc.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{svc.description}</p>
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
      title: 'Choose a date and time',
      schema: z.object({ date: z.date(), time: z.string().min(1) }).passthrough(),
      component: (
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={data.date as Date | undefined}
            onSelect={(d) => { if (d) update({ date: d, time: '' }); }}
            disabled={d => d < new Date() || d > maxDate}
            className={cn('rounded-xl border p-4 pointer-events-auto mx-auto')}
          />
          {data.date && (() => {
            const slots = generateSlots(data.date as Date, selectedService);
            if (slots.length === 0) return <p className="text-sm text-muted-foreground text-center py-2">No availability on this day.</p>;
            const booked = getBookedTimes(data.date as Date);
            return (
              <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
                {slots.map(s => {
                  const isBooked = booked.has(s);
                  return (
                    <Button key={s} size="sm" variant={data.time === s ? 'default' : 'outline'} disabled={isBooked} onClick={() => update({ time: s })} className="text-xs h-9">
                      {isBooked ? '—' : s}
                    </Button>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ),
    },
    {
      id: 'name',
      title: 'Your name and date of birth',
      schema: z.object({
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        dob: z.string().min(1),
      }).passthrough(),
      component: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>First Name <span className="text-destructive">*</span></Label>
            <Input value={(data.first_name as string) || ''} onChange={e => update({ first_name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Last Name <span className="text-destructive">*</span></Label>
            <Input value={(data.last_name as string) || ''} onChange={e => update({ last_name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Date of Birth <span className="text-destructive">*</span></Label>
            <Input type="date" value={(data.dob as string) || ''} onChange={e => update({ dob: e.target.value })} max={format(new Date(), 'yyyy-MM-dd')} />
          </div>
        </div>
      ),
    },
    {
      id: 'medicare',
      title: 'Medicare and contact details',
      subtitle: 'Medicare details help us report your vaccination automatically',
      schema: z.object({
        phone: z.string().min(1),
        email: z.string().email(),
      }).passthrough(),
      component: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Medicare Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              value={(data.medicare_number as string) || ''}
              onChange={e => update({ medicare_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="10 digits"
              maxLength={10}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Reference No. <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                value={(data.medicare_ref as string) || ''}
                onChange={e => update({ medicare_ref: e.target.value.replace(/\D/g, '').slice(0, 1) })}
                placeholder="1 digit"
                maxLength={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Expiry <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                value={(data.medicare_expiry as string) || ''}
                onChange={e => update({ medicare_expiry: e.target.value })}
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Phone <span className="text-destructive">*</span></Label>
            <Input value={(data.phone as string) || ''} onChange={e => update({ phone: e.target.value })} type="tel" />
          </div>
          <div className="space-y-1.5">
            <Label>Email <span className="text-destructive">*</span></Label>
            <Input value={(data.email as string) || ''} onChange={e => update({ email: e.target.value })} type="email" />
          </div>
        </div>
      ),
    },
    {
      id: 'allergies',
      title: 'Any allergies we should know about?',
      schema: z.object({ has_allergies: z.boolean() }).passthrough(),
      component: (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={(data.has_allergies as boolean) || false}
              onCheckedChange={v => update({ has_allergies: v, allergies_detail: v ? (data.allergies_detail || '') : '' })}
            />
            <Label>{data.has_allergies ? 'Yes, I have allergies' : 'No known allergies'}</Label>
          </div>
          {data.has_allergies && (
            <div className="space-y-1.5 animate-fade-in">
              <Label>Please describe your allergies</Label>
              <Textarea
                value={(data.allergies_detail as string) || ''}
                onChange={e => update({ allergies_detail: e.target.value })}
                rows={3}
                placeholder="e.g. penicillin, egg allergy…"
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'consent',
      title: 'Please read and sign the consent form',
      schema: z.object({
        consent_agreed: z.literal(true),
        signature_data: z.string().min(1),
      }).passthrough(),
      submitLabel: 'Confirm Booking',
      component: (
        <div className="space-y-4">
          <div className="rounded-lg border p-4 max-h-40 overflow-y-auto text-xs leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Patient Consent — Vaccination Service</p>
            <p>I consent to the pharmacist administering the selected vaccine. I understand the potential benefits and risks of vaccination and have had the opportunity to ask questions. I confirm that the information I have provided is accurate to the best of my knowledge.</p>
            <p className="mt-2">I understand that my vaccination details may be reported to the Australian Immunisation Register (AIR) as required by law. I consent to my personal information being stored securely in accordance with the Privacy Act 1988 (Cth).</p>
            <p className="mt-2">I have been advised of the need to remain in the pharmacy for a minimum of 15 minutes post-vaccination for observation.</p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={(data.consent_agreed as boolean) || false}
              onCheckedChange={v => update({ consent_agreed: v === true })}
              id="consent-check"
            />
            <Label htmlFor="consent-check" className="cursor-pointer text-sm">I have read and agree to the above</Label>
          </div>

          <div className="space-y-1.5">
            <Label>Signature</Label>
            <div className="border rounded-lg bg-background">
              <SignatureCanvas
                ref={sigRef}
                canvasProps={{ className: 'w-full h-28', style: { width: '100%', height: '112px' } }}
                onEnd={() => {
                  const dataUrl = sigRef.current?.toDataURL() || '';
                  update({ signature_data: dataUrl });
                }}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => { sigRef.current?.clear(); update({ signature_data: '' }); }}
            >
              Clear signature
            </Button>
          </div>
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
      onCancel={() => { localStorage.removeItem(storageKey); window.history.back(); }}
      storageKey={storageKey}
      allowEsc={false}
    />
  );
}
