import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AppointmentSlot } from '@/data/booking-data';
import { AppointmentCard } from './AppointmentCard';
import { cn } from '@/lib/utils';

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointments: AppointmentSlot[];
  onAppointmentClick: (apt: AppointmentSlot) => void;
}

const TIME_SLOTS = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${min}`;
});

export function DayView({ selectedDate, onDateChange, appointments, onAppointmentClick }: Props) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayAppts = appointments.filter(a => a.date === dateStr);

  return (
    <div className="flex gap-6 lg:gap-10">
      {/* Sidebar */}
      <div className="w-[260px] shrink-0 hidden md:block space-y-4 overflow-hidden">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => d && onDateChange(d)}
          className={cn("p-2 pointer-events-auto rounded-lg border w-full [&_table]:w-full")}
        />
        <Button variant="outline" size="sm" className="w-full" onClick={() => onDateChange(new Date())}>Today</Button>
        <p className="text-sm text-muted-foreground text-center">{dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''} today</p>
      </div>

      {/* Time grid */}
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold mb-4">{format(selectedDate, 'EEEE, d MMMM yyyy')}</h2>
        <div className="space-y-0">
          {TIME_SLOTS.map(slot => {
            const slotAppts = dayAppts.filter(a => a.time === slot);
            return (
              <div key={slot} className="flex min-h-[3rem] border-t border-border/50">
                <div className="w-16 shrink-0 pt-1 text-xs text-muted-foreground font-mono">{slot}</div>
                <div className="flex-1 py-1 space-y-1">
                  {slotAppts.map(a => (
                    <AppointmentCard key={a.id} appointment={a} onClick={() => onAppointmentClick(a)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
