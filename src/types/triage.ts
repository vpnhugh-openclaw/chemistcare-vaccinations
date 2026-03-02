export type TriageService = 'uti' | 'contraception' | 'shingles' | 'psoriasis' | 'vaccines';

export interface TriageResult {
  eligible: boolean;
  status: 'eligible' | 'ineligible' | 'warning';
  message: string;
  details?: string;
}

export interface TriageFormData {
  service: TriageService | null;
  // UTI fields
  sex?: 'male' | 'female';
  age?: number;
  utiSymptoms?: string[];
  // Contraception fields
  lastGpReviewDate?: string;
  // Shingles fields
  hoursSinceRash?: number;
  isImmunocompetent?: boolean;
  // Shared
  currentMedications?: string;
  allergies?: string;
  preferredDate?: string;
  preferredTime?: string;
}

export const SERVICE_INFO: Record<TriageService, { label: string; description: string; icon: string }> = {
  uti: { label: 'UTI Treatment', description: 'Uncomplicated urinary tract infection assessment and treatment', icon: '🩺' },
  contraception: { label: 'Contraception Resupply', description: 'Hormonal contraception continuation supply', icon: '💊' },
  shingles: { label: 'Shingles Treatment', description: 'Herpes zoster antiviral treatment', icon: '🩹' },
  psoriasis: { label: 'Psoriasis Management', description: 'Mild-to-moderate plaque psoriasis treatment', icon: '🧴' },
  vaccines: { label: 'Vaccination Services', description: 'Pharmacist-administered vaccinations', icon: '💉' },
};

export const UTI_SYMPTOMS = [
  { id: 'dysuria', label: 'Dysuria (painful urination)' },
  { id: 'frequency', label: 'Urinary frequency' },
  { id: 'urgency', label: 'Urinary urgency' },
  { id: 'suprapubic', label: 'Suprapubic pain' },
];
