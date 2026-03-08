import { AppointmentSlot, BookingStatus } from '@/data/booking-data';
import { cn } from '@/lib/utils';

const statusStyles: Record<BookingStatus, string> = {
  confirmed: 'border-l-[hsl(var(--clinical-safe))] bg-[hsl(var(--clinical-safe-bg))]',
  pending: 'border-l-[hsl(var(--clinical-warning))] bg-[hsl(var(--clinical-warning-bg))]',
  completed: 'border-l-muted-foreground/40 bg-muted/50',
  cancelled: 'border-l-[hsl(var(--clinical-danger))] bg-[hsl(var(--clinical-danger-bg))]',
  'no-show': 'border-l-[hsl(var(--clinical-danger))]/60 bg-[hsl(var(--clinical-danger-bg))]',
};

interface Props {
  appointment: AppointmentSlot;
  onClick: () => void;
}

export function AppointmentCard({ appointment, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left border-l-[3px] rounded-md px-2.5 py-2 cursor-pointer transition-all',
        'hover:shadow-sm hover:translate-x-px',
        statusStyles[appointment.status],
      )}
    >
      <p className="text-[11px] font-mono text-muted-foreground leading-tight">
        {appointment.time} · {appointment.durationMinutes}min
      </p>
      <p className="text-sm font-semibold text-foreground mt-0.5 leading-tight">{appointment.patientName}</p>
      <p className="text-xs text-muted-foreground leading-tight">{appointment.service}</p>
    </button>
  );
}
