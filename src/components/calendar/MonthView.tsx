import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { AppointmentSlot } from '@/data/booking-data';
import { cn } from '@/lib/utils';

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointments: AppointmentSlot[];
  onAppointmentClick: (apt: AppointmentSlot) => void;
  onSwitchToDay: (date: Date) => void;
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthView({ selectedDate, onDateChange, appointments, onAppointmentClick, onSwitchToDay }: Props) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  return (
    <div>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-2">
        {DOW.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground tracking-wide py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {weeks.map((week, wi) =>
          week.map((date, di) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayAppts = appointments.filter(a => a.date === dateStr);
            const inMonth = isSameMonth(date, selectedDate);
            const today = isToday(date);
            const selected = isSameDay(date, selectedDate);
            const hasAppts = dayAppts.length > 0;

            return (
              <button
                key={dateStr}
                onClick={() => {
                  onDateChange(date);
                  if (hasAppts) onSwitchToDay(date);
                }}
                className={cn(
                  'relative flex flex-col items-center py-3 transition-colors border-t border-border/30',
                  'hover:bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-ring rounded-md',
                  !inMonth && 'opacity-30',
                )}
              >
                <span
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors',
                    today && !selected && 'bg-primary text-primary-foreground',
                    selected && !today && 'bg-accent/20 text-accent ring-2 ring-accent',
                    selected && today && 'bg-primary text-primary-foreground ring-2 ring-primary/50',
                    !today && !selected && 'text-foreground',
                  )}
                >
                  {format(date, 'd')}
                </span>

                {/* Appointment dots */}
                {hasAppts && (
                  <div className="flex items-center gap-0.5 mt-1.5">
                    {dayAppts.slice(0, 3).map((a) => (
                      <span
                        key={a.id}
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          a.status === 'confirmed' && 'bg-[hsl(var(--clinical-safe))]',
                          a.status === 'pending' && 'bg-[hsl(var(--clinical-warning))]',
                          a.status === 'completed' && 'bg-muted-foreground/40',
                          a.status === 'cancelled' && 'bg-[hsl(var(--clinical-danger))]',
                          a.status === 'no-show' && 'bg-[hsl(var(--clinical-danger))]/50',
                        )}
                      />
                    ))}
                    {dayAppts.length > 3 && (
                      <span className="text-[9px] text-muted-foreground ml-0.5">+{dayAppts.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
