import { Card } from '@/components/ui/card';
import { AppointmentSlot, BookingStatus } from '@/data/booking-data';

const borderColors: Record<BookingStatus, string> = {
  confirmed: 'border-l-green-500',
  pending: 'border-l-amber-400',
  completed: 'border-l-gray-400',
  cancelled: 'border-l-red-400',
  'no-show': 'border-l-red-200',
};

interface Props {
  appointment: AppointmentSlot;
  onClick: () => void;
}

export function AppointmentCard({ appointment, onClick }: Props) {
  return (
    <Card
      className={`border-l-4 ${borderColors[appointment.status]} p-2.5 cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      <p className="text-xs font-mono text-muted-foreground">{appointment.time} · {appointment.durationMinutes}min</p>
      <p className="text-sm font-semibold mt-0.5">{appointment.patientName}</p>
      <p className="text-xs text-muted-foreground">{appointment.service}</p>
      <p className="text-xs text-muted-foreground">{appointment.pharmacistName}</p>
    </Card>
  );
}
