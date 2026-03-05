export interface ConsultTemplate {
  id: string;
  name: string;
  condition: string;
  jurisdiction?: string;
  prefill: {
    allergies?: string[];
    currentMeds?: string[];
    comorbidities?: string[];
    assessmentPrompts?: string[];
    differentials?: string[];
    treatmentOptions?: { medication: string; dose: string; duration?: string; notes?: string }[];
    noteHeadings?: string[];
    documentationChecklist?: string[];
  };
}
