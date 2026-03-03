import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { pharmacyServices, AppointmentSlot } from '@/data/booking-data';
import { defaultAdminSettings } from '@/data/admin-settings';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (apt: AppointmentSlot) => void;
}

function generateSlots(date: Date | undefined): string[] {
  if (!date) return [];
  const dayName = format(date, 'EEEE');
  const wh = defaultAdminSettings.workingHours.find(d => d.day === dayName);
  if (!wh || wh.closed) return [];
  const [oh, om] = wh.open.split(':').map(Number);
  const [ch, cm] = wh.close.split(':').map(Number);
  const startMin = oh * 60 + om;
  const endMin = ch * 60 + cm;
  const interval = defaultAdminSettings.slotIntervalMinutes;
  const slots: string[] = [];
  for (let m = startMin; m < endMin; m += interval) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return slots;
}

export function NewAppointmentDialog({ open, onOpenChange, onAdd }: Props) {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const service = pharmacyServices.find(s => s.id === serviceId);
  const slots = generateSlots(date);

  const reset = () => { setStep(1); setServiceId(''); setDate(undefined); setTime(''); setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setNotes(''); };

  const handleConfirm = () => {
    const apt: AppointmentSlot = {
      id: `apt-${Date.now()}`,
      date: date ? format(date, 'yyyy-MM-dd') : '',
      time,
      durationMinutes: service?.durationMinutes || 15,
      pharmacistName: 'Sarah Chen',
      service: service?.name || '',
      status: 'confirmed',
      patientName: `${firstName} ${lastName}`,
      patientEmail: email,
      patientPhone: phone,
      notes,
    };
    onAdd(apt);
    toast.success(`Appointment booked — confirmation email will be sent to ${email}`);
    reset();
    onOpenChange(false);
  };

  const canNext1 = serviceId && date && time;
  const canNext2 = firstName && lastName && email && phone;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 my-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn('h-2.5 w-2.5 rounded-full transition-colors', s <= step ? 'bg-primary' : 'bg-muted')} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Service</label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                <SelectContent>
                  {pharmacyServices.filter(s => s.active).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} disabled={d => d < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            {date && (
              <div>
                <label className="text-sm font-medium mb-1 block">Time</label>
                {slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Pharmacy is closed on this day.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
                    {slots.map(s => (
                      <Button key={s} size="sm" variant={time === s ? 'default' : 'outline'} onClick={() => setTime(s)}>{s}</Button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <Button disabled={!canNext1} onClick={() => setStep(2)}>Next</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1 block">First Name</label><Input value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1 block">Last Name</label><Input value={lastName} onChange={e => setLastName(e.target.value)} /></div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Email</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Phone</label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Notes (optional)</label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!canNext2} onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{service?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{date ? format(date, 'PPP') : ''}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{time}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{service?.durationMinutes} min</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium">{firstName} {lastName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{phone}</span></div>
              {notes && <div className="flex justify-between"><span className="text-muted-foreground">Notes</span><span className="font-medium">{notes}</span></div>}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleConfirm}><Check className="h-4 w-4 mr-1" /> Confirm Appointment</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
