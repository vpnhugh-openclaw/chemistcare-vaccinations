import { Button } from '@/components/ui/button';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppointmentSlot } from '@/data/booking-data';
import { AppointmentCard } from './AppointmentCard';

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
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => onDateChange(addDays(weekStart, -7))}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="text-sm font-medium">{format(weekStart, 'd MMM')} – {format(addDays(weekStart, 6), 'd MMM yyyy')}</span>
        <Button variant="ghost" size="icon" onClick={() => onDateChange(addDays(weekStart, 7))}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayAppts = appointments.filter(a => a.date === dateStr);
          const isToday = isSameDay(day, new Date());
          return (
            <div key={dateStr} className="min-h-[10rem]">
              <div className={`text-center text-xs font-medium mb-2 py-1 rounded ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                <div>{format(day, 'EEE')}</div>
                <div className="text-sm font-semibold">{format(day, 'd')}</div>
              </div>
              <div className="space-y-1">
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
