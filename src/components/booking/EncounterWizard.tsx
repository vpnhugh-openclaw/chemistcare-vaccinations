import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { GuidedWizard, WizardStep } from '@/components/wizard/GuidedWizard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, AlertTriangle, Syringe } from 'lucide-react';
import { AppointmentSlot } from '@/data/booking-data';
import { toast } from 'sonner';

/* ─── Demo data ─── */
const DEMO_VACCINES = [
  { id: 'v-1', name: 'Fluarix Tetra', manufacturer: 'GlaxoSmithKline', code: 'FLUARIX', type: 'Influenza' },
  { id: 'v-2', name: 'Vaxigrip Tetra', manufacturer: 'Sanofi Pasteur', code: 'VAXIGR', type: 'Influenza' },
  { id: 'v-3', name: 'Afluria Quad', manufacturer: 'Seqirus', code: 'AFLURI', type: 'Influenza' },
  { id: 'v-4', name: 'Shingrix', manufacturer: 'GlaxoSmithKline', code: 'SHINGRX', type: 'Herpes Zoster' },
  { id: 'v-5', name: 'Comirnaty', manufacturer: 'Pfizer', code: 'COMIR', type: 'COVID-19' },
];

const DEMO_STAFF = [
  { id: 's-1', name: 'Dr Sarah Chen', ahpra: 'PHA0001234567' },
  { id: 's-2', name: 'James Murphy', ahpra: 'PHA0009876543' },
  { id: 's-3', name: 'Lisa Nguyen', ahpra: 'PHA0005551234' },
];

const DOSE_OPTIONS = ['1st dose', '2nd dose', '3rd dose', 'Booster'];
const SITE_OPTIONS = ['Left deltoid', 'Right deltoid', 'Left thigh', 'Right thigh'];

type FormData = Record<string, unknown>;

interface Props {
  appointment: AppointmentSlot;
  onComplete: () => void;
  onCancel: () => void;
}

export function EncounterWizard({ appointment, onComplete, onCancel }: Props) {
  // Pre-populate staff from booking
  const prefilledStaff = DEMO_STAFF.find(s => s.name === appointment.pharmacistName);
  const [data, setData] = useState<FormData>({
    staff_id: prefilledStaff?.id || '',
  });

  const update = useCallback((patch: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const selectedVaccine = DEMO_VACCINES.find(v => v.id === data.vaccine_id);
  const selectedStaff = DEMO_STAFF.find(s => s.id === data.staff_id);

  const handleComplete = useCallback(() => {
    // In production: INSERT vaccination_encounters, UPDATE booking status
    toast.success(`Vaccination recorded for ${appointment.patientName}`);
    onComplete();
  }, [appointment.patientName, onComplete]);

  const steps: WizardStep[] = [
    {
      id: 'vaccine',
      title: 'Which vaccine was administered?',
      subtitle: `${appointment.service} — ${appointment.patientName}`,
      schema: z.object({ vaccine_id: z.string().min(1) }).passthrough(),
      component: (
        <div className="space-y-2">
          {DEMO_VACCINES.map(v => (
            <Card
              key={v.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary',
                data.vaccine_id === v.id && 'border-primary border-2 bg-secondary/20',
              )}
              onClick={() => update({ vaccine_id: v.id })}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.manufacturer}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{v.code}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {selectedVaccine && (
            <div className="rounded-lg border-dashed border p-3 mt-3 text-xs space-y-1 text-muted-foreground">
              <p><span className="font-medium text-foreground">Manufacturer:</span> {selectedVaccine.manufacturer}</p>
              <p><span className="font-medium text-foreground">Code:</span> {selectedVaccine.code}</p>
              <p><span className="font-medium text-foreground">Type:</span> {selectedVaccine.type}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'batch',
      title: 'Batch details',
      schema: z.object({
        batch_number: z.string().min(1),
        batch_expiry: z.date(),
      }).passthrough(),
      component: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Batch Number <span className="text-destructive">*</span></Label>
            <Input
              value={(data.batch_number as string) || ''}
              onChange={e => update({ batch_number: e.target.value })}
              placeholder="e.g. ABC12345"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Batch Expiry <span className="text-destructive">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !data.batch_expiry && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.batch_expiry ? format(data.batch_expiry as Date, 'PPP') : 'Pick expiry date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.batch_expiry as Date | undefined}
                  onSelect={d => { if (d) update({ batch_expiry: d }); }}
                  disabled={d => d < new Date()}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ),
    },
    {
      id: 'administration',
      title: 'How was it administered?',
      schema: z.object({
        dose_number: z.string().min(1),
        injection_site: z.string().min(1),
      }).passthrough(),
      component: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Dose Number <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              {DOSE_OPTIONS.map(opt => (
                <Button
                  key={opt}
                  variant={data.dose_number === opt ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => update({ dose_number: opt })}
                  className="h-10"
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Injection Site <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              {SITE_OPTIONS.map(opt => (
                <Button
                  key={opt}
                  variant={data.injection_site === opt ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => update({ injection_site: opt })}
                  className="h-10"
                >
                  <Syringe className="h-3.5 w-3.5 mr-1.5" />
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'staff',
      title: 'Who administered the vaccine?',
      schema: z.object({ staff_id: z.string().min(1) }).passthrough(),
      component: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Administering Pharmacist <span className="text-destructive">*</span></Label>
            <Select value={(data.staff_id as string) || ''} onValueChange={v => update({ staff_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select pharmacist" /></SelectTrigger>
              <SelectContent>
                {DEMO_STAFF.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedStaff && (
            <div className="rounded-lg border p-3 text-sm">
              <p className="text-muted-foreground">AHPRA Registration</p>
              <p className="font-mono font-medium">{selectedStaff.ahpra}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'review',
      title: 'Review and complete',
      submitLabel: 'Complete Vaccination',
      schema: z.object({}).passthrough(),
      component: (
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium">{appointment.patientName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{appointment.service}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Vaccine</span><span className="font-medium">{selectedVaccine?.name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Batch</span><span className="font-medium">{(data.batch_number as string) || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expiry</span><span className="font-medium">{data.batch_expiry ? format(data.batch_expiry as Date, 'PPP') : '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Dose</span><span className="font-medium">{(data.dose_number as string) || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Site</span><span className="font-medium">{(data.injection_site as string) || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pharmacist</span><span className="font-medium">{selectedStaff?.name || '—'}</span></div>
          </div>

          <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
              Will be submitted to AIR once vendor registration is complete
            </AlertDescription>
          </Alert>
          <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
              PPA claim will be automated once vendor registration is complete
            </AlertDescription>
          </Alert>
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
