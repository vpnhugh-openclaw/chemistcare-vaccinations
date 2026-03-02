import type { TravelPatientForm, TravelRiskFlag } from '@/types/travel';

/**
 * Evaluate travel patient form and generate risk flags using
 * "This Person, This Trip, This Time" framework.
 */
export function evaluateTravelRisks(form: TravelPatientForm): TravelRiskFlag[] {
  const flags: TravelRiskFlag[] = [];
  const push = (f: Omit<TravelRiskFlag, 'id'>) =>
    flags.push({ ...f, id: `trf-${flags.length}` });

  // ── RED FLAGS (referral required) ──

  if (form.pregnancyCurrent || form.pregnancyPlanned) {
    push({ level: 'red', title: 'Pregnant / Planning Pregnancy', message: 'Patient is pregnant or planning pregnancy during travel. Specialist travel medicine referral required.', action: 'Refer to travel medicine specialist or GP.', blocksConsultation: true });
  }

  if (form.medicalConditions.includes('immunocompromise')) {
    push({ level: 'red', title: 'Immunocompromised', message: 'Immunocompromised patients require specialist travel assessment. Live vaccines contraindicated.', action: 'Refer to travel medicine specialist.', blocksConsultation: true });
  }

  const hasYellowFeverDest = form.itinerary.some(l =>
    /africa|brazil|colombia|peru|venezuela|angola|congo|nigeria|cameroon|ghana|kenya|ethiopia|uganda|guinea|gabon|senegal/i.test(l.destination)
  );
  if (hasYellowFeverDest) {
    push({ level: 'red', title: 'Yellow Fever Destination', message: 'Destination may require Yellow Fever vaccination — outside pharmacist scope in Victoria.', action: 'Refer to Yellow Fever vaccination centre.' });
  }

  const longStay = form.itinerary.some(l => {
    if (!l.departureDate || !l.returnDate) return false;
    const days = (new Date(l.returnDate).getTime() - new Date(l.departureDate).getTime()) / 86400000;
    return days > 56;
  });
  if (longStay && form.itinerary.some(l => /malaria|africa|asia|papua|solomon|vanuatu/i.test(l.destination))) {
    push({ level: 'red', title: 'Extended Stay in Malaria Zone', message: 'Malaria-endemic destination with >8 week stay. Specialist assessment required.', action: 'Refer to travel medicine specialist.' });
  }

  if (form.itinerary.some(l => l.purpose === 'medical_tourism')) {
    push({ level: 'red', title: 'Medical Tourism', message: 'Travelling for medical treatment overseas. Requires specialist pre-travel assessment.', action: 'Refer to GP or specialist.', blocksConsultation: true });
  }

  if (form.itinerary.some(l => l.purpose === 'aid_work')) {
    push({ level: 'red', title: 'Aid Work / Military Posting', message: 'International aid or military deployment requires specialist travel medicine consultation.', action: 'Refer to occupational/travel medicine specialist.', blocksConsultation: true });
  }

  const hasSevereDisease = form.medicalConditions.some(c =>
    ['active_cancer', 'splenectomy_asplenia'].includes(c)
  );
  if (hasSevereDisease) {
    push({ level: 'red', title: 'Severe/Uncontrolled Chronic Disease', message: 'Patient has complex medical history requiring specialist review before travel.', action: 'Refer to GP or specialist.', blocksConsultation: true });
  }

  // ── AMBER FLAGS (proceed with caution) ──

  const dob = form.dob ? new Date(form.dob) : null;
  const age = dob ? Math.floor((Date.now() - dob.getTime()) / 31557600000) : null;

  if (age !== null && age >= 65) {
    push({ level: 'amber', title: 'Age ≥65', message: 'Elderly traveller — may need GP clearance for travel insurance. Additional assessment for fitness to fly.' });
  }

  if (age !== null && age >= 8 && age < 18) {
    push({ level: 'amber', title: 'Paediatric Traveller (8–17)', message: 'Child traveller — additional considerations for dosing, vaccine scheduling, and parental consent.' });
  }
  if (age !== null && age < 8) {
    push({ level: 'red', title: 'Child <8 Years', message: 'Paediatric travel assessment required. Some prophylaxis contraindicated under age 8.', action: 'Refer to paediatric travel medicine.', blocksConsultation: true });
  }

  if (form.medicalConditions.includes('obesity') || (form.bmi && parseFloat(form.bmi) >= 30)) {
    push({ level: 'amber', title: 'Obesity', message: 'BMI indicates obesity — increased VTE risk on long-haul flights. Assess altitude fitness if applicable.' });
  }

  if (form.itinerary.some(l => l.purpose === 'vfr')) {
    push({ level: 'amber', title: 'VFR Travel', message: 'Visiting friends/relatives — risks are often underestimated. Ensure malaria prophylaxis and vaccine coverage discussed.' });
  }

  if (form.itinerary.some(l => l.accommodation === 'hostel' || l.accommodation === 'camping')) {
    push({ level: 'amber', title: 'Backpacker / Camping', message: 'Higher exposure risk — food/waterborne illness, insect-borne disease, and limited healthcare access.' });
  }

  if (form.itinerary.some(l => l.ruralTravel || l.remoteTravel)) {
    push({ level: 'amber', title: 'Rural / Remote Travel', message: 'Limited healthcare access. Ensure comprehensive medical kit and emergency evacuation plan.' });
  }

  if (form.medicalConditions.includes('vte_dvt_history') || form.medicalConditions.includes('thrombophilia')) {
    push({ level: 'amber', title: 'VTE Risk', message: 'History of VTE/DVT or thrombophilia. Assess VTE prophylaxis for long-haul travel. Consider Padua Prediction Score.', action: 'Refer to GP for pharmacological VTE prophylaxis if indicated.' });
  }

  const altitudeConditions: string[] = ['cardiac_disease', 'renal_disease', 'diabetes', 'neurological', 'haematological', 'mental_illness', 'raynauds', 'ophthalmic', 'obesity'];
  const hasAltitudeRisk = form.medicalConditions.some(c => altitudeConditions.includes(c));
  if (hasAltitudeRisk) {
    push({ level: 'amber', title: 'Altitude Risk Factors', message: 'Medical conditions requiring additional assessment for travel above 1500m.' });
  }

  if (form.eggAllergy) {
    push({ level: 'amber', title: 'Egg Allergy', message: 'Flag for influenza and Yellow Fever vaccine consideration. If anaphylaxis to eggs, observe 30 min post-vaccination and consider allergist referral.' });
  }

  // Green if nothing else
  if (flags.length === 0) {
    push({ level: 'green', title: 'Low Risk Profile', message: 'No significant risk flags identified. Proceed with standard pre-travel assessment.' });
  }

  return flags;
}

/**
 * Calculate days until departure from earliest itinerary leg.
 */
export function daysUntilDeparture(itinerary: TravelPatientForm['itinerary']): number | null {
  const dates = itinerary.map(l => l.departureDate).filter(Boolean).map(d => new Date(d).getTime());
  if (dates.length === 0) return null;
  const earliest = Math.min(...dates);
  return Math.ceil((earliest - Date.now()) / 86400000);
}

/**
 * Calculate total trip duration in days.
 */
export function tripDuration(itinerary: TravelPatientForm['itinerary']): number | null {
  const deps = itinerary.map(l => l.departureDate).filter(Boolean).map(d => new Date(d).getTime());
  const rets = itinerary.map(l => l.returnDate).filter(Boolean).map(d => new Date(d).getTime());
  if (deps.length === 0 || rets.length === 0) return null;
  return Math.ceil((Math.max(...rets) - Math.min(...deps)) / 86400000);
}
