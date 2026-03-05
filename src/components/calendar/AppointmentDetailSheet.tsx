import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, User, Phone, Mail, Clock, Stethoscope, Syringe } from 'lucide-react';
import { AppointmentSlot, BookingStatus } from '@/data/booking-data';
import { useState } from 'react';

interface Props {
  appointment: AppointmentSlot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
  onCompleteEncounter?: (appointment: AppointmentSlot) => void;
}

const statusColors: Record<BookingStatus, string> = {
  confirmed: 'text-green-600',
  pending: 'text-amber-500',
  completed: 'text-muted-foreground',
  cancelled: 'text-destructive',
  'no-show': 'text-red-300',
};

export function AppointmentDetailSheet({ appointment, open, onOpenChange, onStatusChange, onNotesChange, onCompleteEncounter }: Props) {
  const [eligOpen, setEligOpen] = useState(false);
  if (!appointment) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">Appointment Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-6">
          {/* Patient */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Patient</h3>
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{appointment.patientName}</span></div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{appointment.patientEmail}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{appointment.patientPhone}</span></div>
          </div>

          <Separator />

          {/* Service */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Service</h3>
            <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{appointment.service}</span></div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{appointment.date} at {appointment.time} ({appointment.durationMinutes} min)</span></div>
            <p className="text-sm text-muted-foreground">Pharmacist: {appointment.pharmacistName}</p>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</h3>
            <Select value={appointment.status} onValueChange={(v) => onStatusChange(appointment.id, v as BookingStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['pending', 'confirmed', 'completed', 'cancelled', 'no-show'] as BookingStatus[]).map(s => (
                  <SelectItem key={s} value={s}><span className={statusColors[s] + ' capitalize'}>{s.replace('-', ' ')}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Eligibility answers */}
          {appointment.eligibilityAnswers && Object.keys(appointment.eligibilityAnswers).length > 0 && (
            <Collapsible open={eligOpen} onOpenChange={setEligOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground">
                  Eligibility Answers <ChevronDown className={`h-4 w-4 transition-transform ${eligOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {Object.entries(appointment.eligibilityAnswers).map(([q, a]) => (
                  <div key={q} className="text-sm"><span className="text-muted-foreground">{q}:</span> <span className="font-medium">{a}</span></div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</h3>
            <Textarea
              value={appointment.notes || ''}
              onChange={(e) => onNotesChange(appointment.id, e.target.value)}
              placeholder="Add clinical or admin notes…"
              rows={3}
            />
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {appointment.status === 'confirmed' && onCompleteEncounter && (
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onCompleteEncounter(appointment)}>
                <Syringe className="h-4 w-4" /> Complete Encounter
              </Button>
            )}
            <Button size="sm" onClick={() => onStatusChange(appointment.id, 'completed')}>Mark Complete</Button>
            <Button size="sm" variant="destructive" onClick={() => onStatusChange(appointment.id, 'cancelled')}>Cancel Appointment</Button>
            <Button size="sm" variant="outline">Reschedule</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
