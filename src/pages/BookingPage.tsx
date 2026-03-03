import { useParams } from 'react-router-dom';
import { PatientBookingWidget } from '@/components/booking/PatientBookingWidget';

const BookingPage = () => {
  const { pharmacySlug } = useParams<{ pharmacySlug: string }>();

  return (
    <div className="min-h-screen bg-muted/30 flex items-start justify-center py-8 px-4">
      <PatientBookingWidget pharmacySlug={pharmacySlug} />
    </div>
  );
};

export default BookingPage;
