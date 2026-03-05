import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { StaffBookingWizard } from '@/components/booking/StaffBookingWizard';
import { AppointmentSlot } from '@/data/booking-data';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (apt: AppointmentSlot) => void;
}

export function NewAppointmentDialog({ open, onOpenChange, onAdd }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>New Appointment</SheetTitle>
        </SheetHeader>
        {open && (
          <StaffBookingWizard
            onComplete={(apt) => {
              onAdd(apt);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
