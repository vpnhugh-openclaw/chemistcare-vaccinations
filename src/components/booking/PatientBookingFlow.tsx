import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import {
  Check, CheckCircle2, Clock, ChevronDown, AlertTriangle, ExternalLink, CalendarIcon, ArrowLeft, ArrowRight,
} from 'lucide-react';
import {
  pharmacyServices,
  sampleAppointments,
  AppointmentSlot,
  PharmacyService,
  EligibilityQuestion,
} from '@/data/booking-data';
import { defaultAdminSettings } from '@/data/admin-settings';

/* ─── STEP LABELS ─── */
const STEPS = ['Service', 'Eligibility', 'Date & Time', 'Your Details', 'Confirmed'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-1">
            <div className={cn(
              'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
              done ? 'bg-primary text-primary-foreground' : active ? 'bg-primary text-primary-foreground' : 'border-2 border-border text-muted-foreground',
            )}>
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={cn('text-xs hidden sm:inline mr-2', active ? 'font-medium text-foreground' : 'text-muted-foreground')}>{label}</span>
            {i < STEPS.length - 1 && <div className="w-4 sm:w-8 h-px bg-border mr-1" />}
          </div>
        );
      })}
    </div>
  );
}

/* ─── SLOT GENERATION ─── */
function generateSlots(date: Date): string[] {
  const dayName = format(date, 'EEEE');
  const wh = defaultAdminSettings.workingHours.find(d => d.day === dayName);
  if (!wh || wh.closed) return [];
  const [oh, om] = wh.open.split(':').map(Number);
  const [ch, cm] = wh.close.split(':').map(Number);
  const interval = defaultAdminSettings.slotIntervalMinutes;
  const slots: string[] = [];
  for (let m = oh * 60 + om; m < ch * 60 + cm; m += interval) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return slots;
}

function getBookedTimes(date: Date): Set<string> {
  const dateStr = format(date, 'yyyy-MM-dd');
  return new Set(sampleAppointments.filter(a => a.date === dateStr).map(a => a.time));
}

/* ─── MAIN COMPONENT ─── */
interface PatientBookingFlowProps {
  pharmacySlug?: string;
  onBookingComplete?: (apt: AppointmentSlot) => void;
}

export function PatientBookingFlow({ pharmacySlug, onBookingComplete }: PatientBookingFlowProps) {
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<PharmacyService | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [redFlag, setRedFlag] = useState<{ message: string } | null>(null);
  const [allEligible, setAllEligible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [bookedApt, setBookedApt] = useState<AppointmentSlot | null>(null);

  const pharmacyName = defaultAdminSettings.pharmacyName;

  /* ── Eligibility logic ── */
  const handleAnswer = useCallback((q: EligibilityQuestion, value: string) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);

    if (q.redFlagAnswer && value === q.redFlagAnswer) {
      setRedFlag({ message: q.redFlagMessage || 'This service may not be suitable for you.' });
      setAllEligible(false);
      return;
    }

    // Check if all required questions answered without red flags
    if (selectedService) {
      const allAnswered = selectedService.eligibilityQuestions.filter(eq => eq.required).every(eq => next[eq.id]);
      const noFlags = !selectedService.eligibilityQuestions.some(eq => eq.redFlagAnswer && next[eq.id] === eq.redFlagAnswer);
      setAllEligible(allAnswered && noFlags);
    }
  }, [answers, selectedService]);

  /* ── Booking submission ── */
  const handleBook = () => {
    if (!selectedService || !selectedDate) return;
    const apt: AppointmentSlot = {
      id: `apt-${Date.now()}`,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      durationMinutes: selectedService.durationMinutes,
      pharmacistName: 'Assigned on arrival',
      service: selectedService.name,
      status: 'confirmed',
      patientName: `${firstName} ${lastName}`,
      patientEmail: email,
      patientPhone: phone,
      eligibilityAnswers: answers,
      notes: patientNotes,
    };
    setBookedApt(apt);
    onBookingComplete?.(apt);
    /* TODO: POST to email API (e.g. Brevo transactional)
       Recipient: adminSettings.pharmacyEmail
       Subject: "New Booking — [Service] — [Patient Name] — [Date] [Time]"
       Body: structured HTML summary of appointment details */
    console.log('[BookingFlow] Appointment booked:', apt);
    console.log(`[BookingFlow] TODO: Send notification to ${defaultAdminSettings.pharmacyEmail}`);
    setStep(4);
  };

  const maxDate = addDays(new Date(), defaultAdminSettings.bookingWindowDays);

  /* ── Google Calendar link ── */
  const calendarUrl = bookedApt ? (() => {
    const start = `${bookedApt.date.replace(/-/g, '')}T${bookedApt.time.replace(':', '')}00`;
    const endMin = parseInt(bookedApt.time.split(':')[0]) * 60 + parseInt(bookedApt.time.split(':')[1]) + bookedApt.durationMinutes;
    const endH = String(Math.floor(endMin / 60)).padStart(2, '0');
    const endM = String(endMin % 60).padStart(2, '0');
    const end = `${bookedApt.date.replace(/-/g, '')}T${endH}${endM}00`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(bookedApt.service + ' — ' + pharmacyName)}&dates=${start}/${end}&details=${encodeURIComponent('Pharmacist consultation at ' + pharmacyName)}`;
  })() : '';

  return (
    <div className="w-full">
      {/* Header */}
      {step < 4 && (
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{pharmacyName}</h1>
          <p className="text-sm text-muted-foreground mt-1">Book a pharmacist consultation</p>
        </div>
      )}

      {step < 4 && <StepIndicator current={step} />}

      {/* ── STEP 1: SELECT SERVICE ── */}
      {step === 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Choose a Service</h2>
          {pharmacyServices.filter(s => s.active).map(svc => (
            <Card
              key={svc.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary',
                selectedService?.id === svc.id && 'border-primary border-2 bg-secondary/30',
              )}
              onClick={() => setSelectedService(svc)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{svc.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{svc.description}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 ml-2"><Clock className="h-3 w-3 mr-1" />{svc.durationMinutes} min</Badge>
                </div>
                <Collapsible>
                  <CollapsibleTrigger className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
                    What to expect <ChevronDown className="h-3 w-3" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="text-xs text-muted-foreground mt-1">
                    You'll answer a short eligibility check before confirming your booking.
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-end pt-2">
            <Button disabled={!selectedService} onClick={() => { setStep(1); setAnswers({}); setRedFlag(null); setAllEligible(false); }}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: ELIGIBILITY ── */}
      {step === 1 && selectedService && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold">Eligibility Check — {selectedService.name}</h2>

          {redFlag ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>This service may not be right for you</AlertTitle>
                <AlertDescription>{redFlag.message}</AlertDescription>
              </Alert>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => { setStep(0); setSelectedService(null); setRedFlag(null); setAnswers({}); }}>Find another service</Button>
                <Button variant="outline" asChild>
                  <a href="https://www.healthdirect.gov.au/australian-health-services" target="_blank" rel="noopener noreferrer">
                    Find a GP near me <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                </Button>
              </div>
              <p className="text-xs italic text-muted-foreground">This is a screening tool only and does not constitute medical advice. Please consult a healthcare professional if you are unsure.</p>
            </div>
          ) : (
            <>
              {selectedService.eligibilityQuestions.map(q => (
                <div key={q.id} className="space-y-2">
                  <Label className="text-sm font-medium">{q.question}{q.required && <span className="text-destructive ml-0.5">*</span>}</Label>
                  {q.type === 'boolean' && (
                    <RadioGroup value={answers[q.id] || ''} onValueChange={v => handleAnswer(q, v)} className="flex gap-4">
                      <div className="flex items-center gap-2"><RadioGroupItem value="Yes" id={`${q.id}-yes`} /><Label htmlFor={`${q.id}-yes`}>Yes</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="No" id={`${q.id}-no`} /><Label htmlFor={`${q.id}-no`}>No</Label></div>
                    </RadioGroup>
                  )}
                  {q.type === 'select' && q.options && (
                    <Select value={answers[q.id] || ''} onValueChange={v => handleAnswer(q, v)}>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>{q.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                  {q.type === 'text' && (
                    <Input value={answers[q.id] || ''} onChange={e => handleAnswer(q, e.target.value)} placeholder="Your answer…" />
                  )}
                </div>
              ))}

              {allEligible && (
                <Alert className="border-clinical-safe bg-clinical-safe-bg text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-clinical-safe" />
                  <AlertTitle>You appear eligible for this service</AlertTitle>
                  <AlertDescription>Proceed to select a time.</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                <Button disabled={!allEligible} onClick={() => setStep(2)}>Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── STEP 3: DATE & TIME ── */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold">Select Date & Time</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => { if (d) { setSelectedDate(d); setSelectedTime(''); } }}
              disabled={d => d < new Date() || d > maxDate}
              className={cn("p-3 pointer-events-auto rounded-lg border")}
            />
            {selectedDate && (
              <div className="flex-1">
                <p className="text-sm font-medium mb-3">{format(selectedDate, 'EEEE, d MMMM yyyy')}</p>
                {(() => {
                  const dayName = format(selectedDate, 'EEEE');
                  const wh = defaultAdminSettings.workingHours.find(d => d.day === dayName);
                  if (!wh || wh.closed) return <p className="text-sm text-muted-foreground">The pharmacy is closed on this day.</p>;
                  const slots = generateSlots(selectedDate);
                  const booked = getBookedTimes(selectedDate);
                  return (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-60 overflow-y-auto">
                      {slots.map(s => {
                        const isBooked = booked.has(s);
                        return (
                          <Button
                            key={s}
                            size="sm"
                            variant={selectedTime === s ? 'default' : 'outline'}
                            disabled={isBooked}
                            onClick={() => setSelectedTime(s)}
                            className="text-xs"
                          >
                            {isBooked ? 'Unavailable' : s}
                          </Button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
            <Button disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)}>Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {/* ── STEP 4: PATIENT DETAILS ── */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label className="text-sm">First Name *</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
            <div><Label className="text-sm">Last Name *</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} /></div>
          </div>
          <div><Label className="text-sm">Date of Birth *</Label><Input type="date" value={dob} onChange={e => setDob(e.target.value)} /></div>
          <div><Label className="text-sm">Email *</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><Label className="text-sm">Mobile Phone *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div>
            <Label className="text-sm">Anything you'd like the pharmacist to know (optional)</Label>
            <Textarea value={patientNotes} onChange={e => setPatientNotes(e.target.value.slice(0, 300))} maxLength={300} rows={2} />
            <p className="text-xs text-muted-foreground text-right">{patientNotes.length}/300</p>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox id="consent" checked={consent} onCheckedChange={v => setConsent(!!v)} />
            <Label htmlFor="consent" className="text-sm leading-snug">
              I consent to my personal information being used to facilitate this booking and shared with the pharmacy team.
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Your information is handled in accordance with the Australian Privacy Act 1988. It will only be shared with your pharmacist.
          </p>
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
            <Button disabled={!firstName || !lastName || !dob || !email || !phone || !consent} onClick={handleBook}>
              Confirm Booking <Check className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 5: CONFIRMATION ── */}
      {step === 4 && bookedApt && (
        <div className="text-center space-y-6 py-6">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
          <div>
            <h2 className="text-xl font-bold">Your appointment is booked!</h2>
            <p className="text-sm text-muted-foreground mt-1">A confirmation has been sent to {bookedApt.patientEmail}</p>
          </div>
          <Card className="text-left max-w-sm mx-auto">
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{bookedApt.service}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{bookedApt.date}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{bookedApt.time}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pharmacy</span><span className="font-medium">{pharmacyName}</span></div>
            </CardContent>
          </Card>
          <div className="space-y-2">
            <Button variant="outline" size="sm" asChild>
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer"><CalendarIcon className="h-4 w-4 mr-1" /> Add to Google Calendar</a>
            </Button>
            <p className="text-xs text-muted-foreground">
              If you need to cancel or reschedule, please contact the pharmacy directly:<br />
              <a href={`mailto:${defaultAdminSettings.pharmacyEmail}`} className="text-primary underline">{defaultAdminSettings.pharmacyEmail}</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
