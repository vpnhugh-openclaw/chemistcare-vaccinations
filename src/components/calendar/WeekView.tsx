import { Button } from '@/components/ui/button';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppointmentSlot } from '@/data/booking-data';
import { AppointmentCard } from './AppointmentCard';
import { cn } from '@/lib/utils';

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointments: AppointmentSlot[];
  onAppointmentClick: (apt: AppointmentSlot) => void;
}

export function WeekView({ selectedDate, onDateChange, appointments, onAppointmentClick }: Props) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onDateChange(addDays(weekStart, -7))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-foreground">{format(weekStart, 'd MMM')} – {format(addDays(weekStart, 6), 'd MMM yyyy')}</span>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onDateChange(addDays(weekStart, 7))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayAppts = appointments.filter(a => a.date === dateStr);
          const today = isToday(day);
          const selected = isSameDay(day, selectedDate);

          return (
            <div key={dateStr} className="min-h-[10rem]">
              <button
                onClick={() => onDateChange(day)}
                className={cn(
                  'w-full flex flex-col items-center py-2 rounded-lg transition-colors mb-2',
                  today
                    ? 'bg-primary text-primary-foreground'
                    : selected
                      ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                      : 'hover:bg-secondary/50 text-muted-foreground',
                )}
              >
                <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                <span className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold mt-0.5',
                  today && 'bg-primary-foreground/20',
                )}>
                  {format(day, 'd')}
                </span>
              </button>
              <div className="space-y-1.5">
                {dayAppts.map(a => (
                  <AppointmentCard key={a.id} appointment={a} onClick={() => onAppointmentClick(a)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
