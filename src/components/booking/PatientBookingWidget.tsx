/* EMBED INSTRUCTIONS FOR PHARMACIES:
   To embed this booking module on your pharmacy website:

   1. Publish this component at /book/[your-pharmacy-slug]
   2. Add an iframe to your website:

      <iframe
        src="https://app.chemistcare.com.au/book/[your-slug]"
        width="100%"
        height="700"
        frameborder="0"
        style="border-radius:12px; border:1px solid #e5e7eb"
      ></iframe>

   3. Set your pharmacy email in the ChemistCare admin settings page
      to receive booking notifications automatically.
*/

import { PatientBookingFlow } from './PatientBookingFlow';
import { AppointmentSlot } from '@/data/booking-data';

interface Props {
  pharmacySlug?: string;
  onBookingComplete?: (apt: AppointmentSlot) => void;
}

export function PatientBookingWidget({ pharmacySlug, onBookingComplete }: Props) {
  return (
    <div className="max-w-xl mx-auto rounded-2xl shadow-lg border border-border overflow-hidden bg-background p-6">
      <PatientBookingFlow pharmacySlug={pharmacySlug} onBookingComplete={onBookingComplete} />
    </div>
  );
}
