import { Badge } from '@/components/ui/badge';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { AppointmentSlot } from '@/data/booking-data';
import { defaultAdminSettings } from '@/data/admin-settings';

interface Props {
  appointments: AppointmentSlot[];
  selectedDate: Date;
}

export function StatusSummaryBar({ appointments, selectedDate }: Props) {
  const todayStr = format(selectedDate, 'yyyy-MM-dd');
  const ws = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const we = endOfWeek(selectedDate, { weekStartsOn: 1 });

  const todayAppts = appointments.filter(a => a.date === todayStr);
  const pending = appointments.filter(a => a.status === 'pending').length;
  const completedWeek = appointments.filter(a => {
    const d = new Date(a.date);
    return a.status === 'completed' && d >= ws && d <= we;
  }).length;
  const cancelledWeek = appointments.filter(a => {
    const d = new Date(a.date);
    return a.status === 'cancelled' && d >= ws && d <= we;
  }).length;

  // Available slots today
  const dayName = format(selectedDate, 'EEEE');
  const wh = defaultAdminSettings.workingHours.find(d => d.day === dayName);
  let totalSlots = 0;
  if (wh && !wh.closed) {
    const [oh, om] = wh.open.split(':').map(Number);
    const [ch, cm] = wh.close.split(':').map(Number);
    totalSlots = Math.floor(((ch * 60 + cm) - (oh * 60 + om)) / defaultAdminSettings.slotIntervalMinutes);
  }
  const available = Math.max(0, totalSlots - todayAppts.length);

  const tiles = [
    { label: "Today's Appointments", value: todayAppts.length, variant: 'default' as const },
    { label: 'Pending Confirmation', value: pending, variant: 'secondary' as const },
    { label: 'Completed (Week)', value: completedWeek, variant: 'outline' as const },
    { label: 'Cancelled (Week)', value: cancelledWeek, variant: 'destructive' as const },
    { label: 'Available Today', value: available, variant: 'outline' as const },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {tiles.map(t => (
        <div key={t.label} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <Badge variant={t.variant} className="text-sm font-bold px-2">{t.value}</Badge>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{t.label}</span>
        </div>
      ))}
    </div>
  );
}
