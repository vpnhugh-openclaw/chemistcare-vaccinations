import type { SafetySeverity } from '@/types/safety';

export interface InteractionRule {
  a: string;
  b: string;
  severity: SafetySeverity;
  blocker: boolean;
  message: string;
}

export const INTERACTIONS: InteractionRule[] = [
  { a: 'warfarin', b: 'ibuprofen', severity: 'danger', blocker: true, message: 'Warfarin + NSAID: major bleeding risk. Concomitant use generally contraindicated.' },
  { a: 'warfarin', b: 'naproxen', severity: 'danger', blocker: true, message: 'Warfarin + NSAID: major bleeding risk. Concomitant use generally contraindicated.' },
  { a: 'warfarin', b: 'diclofenac', severity: 'danger', blocker: true, message: 'Warfarin + NSAID: major bleeding risk. Concomitant use generally contraindicated.' },
  { a: 'warfarin', b: 'aspirin', severity: 'danger', blocker: true, message: 'Warfarin + aspirin: increased bleeding risk without clear indication.' },
  { a: 'warfarin', b: 'azithromycin', severity: 'warn', blocker: false, message: 'Warfarin + azithromycin: may increase INR. Monitor closely.' },
  { a: 'ssri', b: 'tramadol', severity: 'warn', blocker: false, message: 'SSRI + tramadol: increased serotonin syndrome risk. Use with caution.' },
  { a: 'sertraline', b: 'tramadol', severity: 'warn', blocker: false, message: 'Sertraline + tramadol: serotonin syndrome risk. Monitor closely.' },
  { a: 'fluoxetine', b: 'tramadol', severity: 'warn', blocker: false, message: 'Fluoxetine + tramadol: serotonin syndrome risk. Monitor closely.' },
  { a: 'methotrexate', b: 'trimethoprim', severity: 'danger', blocker: true, message: 'Methotrexate + trimethoprim: severe bone marrow suppression risk.' },
  { a: 'ace inhibitor', b: 'potassium', severity: 'warn', blocker: false, message: 'ACE inhibitor + potassium supplement: hyperkalaemia risk.' },
];

export const PREGNANCY_CONTRAINDICATED: { medicine: string; severity: SafetySeverity; blocker: boolean; message: string }[] = [
  { medicine: 'isotretinoin', severity: 'danger', blocker: true, message: 'Isotretinoin is absolutely contraindicated in pregnancy (Category X).' },
  { medicine: 'methotrexate', severity: 'danger', blocker: true, message: 'Methotrexate is teratogenic; contraindicated in pregnancy.' },
  { medicine: 'warfarin', severity: 'danger', blocker: true, message: 'Warfarin crosses the placenta; high teratogenic risk.' },
  { medicine: 'doxycycline', severity: 'warn', blocker: false, message: 'Tetracyclines should be avoided in pregnancy (tooth discolouration).' },
];

export const ALLERGY_MAP: Record<string, string[]> = {
  penicillin: ['amoxicillin', 'flucloxacillin', 'amoxicillin/clavulanate', 'phenoxymethylpenicillin'],
  sulfonamide: ['trimethoprim/sulfamethoxazole', 'sulfasalazine'],
  nsaid: ['ibuprofen', 'naproxen', 'diclofenac', 'aspirin'],
  cephalosporin: ['cefalexin', 'ceftriaxone'],
};
