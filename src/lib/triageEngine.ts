import { TriageFormData } from '@/types/triage';

export interface TriageResult {
  eligible: boolean;
  status: 'eligible' | 'ineligible' | 'warning';
  message: string;
  details?: string;
}

export function evaluateUtiEligibility(data: TriageFormData): TriageResult {
  if (data.sex === 'male') {
    return { eligible: false, status: 'ineligible', message: 'This service is for females aged 18–65 only.', details: 'Males are not eligible for pharmacist-prescribed UTI treatment under the Victorian Community Pharmacist Prescribing Pilot. Please book a GP appointment.' };
  }
  if (data.age !== undefined && (data.age < 18 || data.age > 65)) {
    return { eligible: false, status: 'ineligible', message: 'This service is for females aged 18–65 only.', details: 'Patients outside this age range require GP assessment. Please book a GP appointment.' };
  }
  if (data.utiSymptoms && data.utiSymptoms.length < 2) {
    return { eligible: false, status: 'warning', message: 'Insufficient symptoms for pharmacist prescribing.', details: 'Fewer than 2 key UTI symptoms selected. A GP review is recommended for further investigation.' };
  }
  if (data.sex === 'female' && data.age !== undefined && data.age >= 18 && data.age <= 65 && data.utiSymptoms && data.utiSymptoms.length >= 2) {
    return { eligible: true, status: 'eligible', message: 'You are eligible for pharmacist UTI treatment.' };
  }
  return { eligible: false, status: 'warning', message: 'Please complete all required fields.' };
}

export function evaluateContraceptionEligibility(data: TriageFormData): TriageResult {
  if (data.age !== undefined && (data.age < 16 || data.age > 50)) {
    return { eligible: false, status: 'ineligible', message: 'Not eligible for pharmacist contraception resupply.', details: 'Patients under 16 or over 50 are outside the protocol age range.' };
  }
  if (data.lastGpReviewDate) {
    const reviewDate = new Date(data.lastGpReviewDate);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    if (reviewDate < twoYearsAgo) {
      return { eligible: false, status: 'ineligible', message: 'GP review required before resupply.', details: 'Your last GP review was more than 2 years ago. You must see a GP before contraception can be resupplied by a pharmacist.' };
    }
  }
  if (data.age !== undefined && data.age >= 16 && data.age <= 50 && data.lastGpReviewDate) {
    return { eligible: true, status: 'eligible', message: 'You are eligible for contraception resupply.' };
  }
  return { eligible: false, status: 'warning', message: 'Please complete all required fields.' };
}

export function evaluateShinglesEligibility(data: TriageFormData): TriageResult {
  if (data.hoursSinceRash !== undefined && data.hoursSinceRash > 72 && data.isImmunocompetent !== false) {
    return { eligible: false, status: 'ineligible', message: 'Antiviral treatment window has passed.', details: 'More than 72 hours since rash onset in an immunocompetent patient. Antiviral treatment is unlikely to be effective. Please book a GP appointment.' };
  }
  if (data.hoursSinceRash !== undefined && data.hoursSinceRash <= 72) {
    return { eligible: true, status: 'eligible', message: 'You are eligible for pharmacist shingles treatment.' };
  }
  if (data.hoursSinceRash !== undefined && data.isImmunocompetent === false) {
    return { eligible: true, status: 'eligible', message: 'You are eligible — extended treatment may apply.', details: 'Immunocompromised patients may receive extended antiviral courses.' };
  }
  return { eligible: false, status: 'warning', message: 'Please complete all required fields.' };
}

export function evaluateTriage(data: TriageFormData): TriageResult | null {
  if (!data.service) return null;
  switch (data.service) {
    case 'uti': return evaluateUtiEligibility(data);
    case 'contraception': return evaluateContraceptionEligibility(data);
    case 'shingles': return evaluateShinglesEligibility(data);
    case 'psoriasis': return { eligible: true, status: 'eligible', message: 'Psoriasis assessment available. Book a consultation.' };
    case 'vaccines': return { eligible: true, status: 'eligible', message: 'Vaccination services available. Book a consultation.' };
    default: return null;
  }
}
