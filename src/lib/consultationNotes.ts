import { getAssessmentFieldLabel, renderDocumentationTemplate, type ConsultationCondition } from '@/lib/conditionRegistry';

export function getSelectedTherapyLabel(condition: ConsultationCondition | undefined, selectedTherapy?: string) {
  if (!condition || !selectedTherapy) return '';
  const therapy = condition.therapyOptions.find((option) => option.id === selectedTherapy);
  return therapy ? `${therapy.medicineName} ${therapy.dose} — ${therapy.frequency} for ${therapy.duration}` : '';
}

export function buildAssessmentSummary(condition: ConsultationCondition | undefined, assessmentValues: Record<string, string>) {
  if (!condition) return '';
  return Object.entries(assessmentValues)
    .filter(([, value]) => value)
    .map(([fieldId, value]) => `${getAssessmentFieldLabel(condition, fieldId)}: ${value}`)
    .join('; ');
}

export function buildClinicalNote(args: {
  condition?: ConsultationCondition;
  patient: Record<string, string>;
  assessment: Record<string, string>;
  differentials: { workingDiagnosis: string; items: { diagnosis: string; reasonExcluded: string }[] };
  treatment: Record<string, string>;
  documentation: Record<string, string>;
  redFlagsChecked: Record<string, boolean>;
  hasRedFlagTriggered: boolean;
  noteHeadings?: string[];
}) {
  const { condition, patient, assessment, differentials, treatment, documentation, redFlagsChecked, hasRedFlagTriggered, noteHeadings } = args;
  if (!condition) return 'Select a consultation type to start the clinical note.';

  const parts: string[] = [];

  if (noteHeadings?.length) {
    parts.push('── TEMPLATE HEADINGS ──');
    noteHeadings.forEach((heading) => parts.push(`▸ ${heading}`));
    parts.push('');
  }

  parts.push(`PATIENT: ${patient.firstName || ''} ${patient.lastName || ''}`.trim());
  if (patient.dob) parts.push(`DOB: ${patient.dob}`);
  if (patient.sex) parts.push(`Sex: ${patient.sex}`);
  if (patient.allergies) parts.push(`Allergies: ${patient.allergies}`);
  if (patient.medications) parts.push(`Current medications: ${patient.medications}`);
  parts.push('');
  parts.push(`CONSULTATION TYPE: ${condition.name} (${condition.category})`);
  parts.push('');
  parts.push(renderDocumentationTemplate(condition, {
    patient,
    assessment,
    differentials,
    treatment,
    selectedTherapyLabel: getSelectedTherapyLabel(condition, treatment.selectedTherapy),
    assessmentSummary: buildAssessmentSummary(condition, assessment),
  }));

  if (differentials.items.length > 0) {
    parts.push('');
    parts.push('Differentials considered:');
    differentials.items.forEach((item, index) => {
      parts.push(`${index + 1}. ${item.diagnosis}${item.reasonExcluded ? ` — excluded because ${item.reasonExcluded}` : ''}`);
    });
  }

  if (hasRedFlagTriggered) {
    parts.push('');
    parts.push('RED FLAGS TRIGGERED:');
    Object.entries(redFlagsChecked)
      .filter(([, value]) => value)
      .forEach(([flagId]) => {
        const flag = condition.redFlags.find((item) => item.id === flagId);
        if (flag) parts.push(`• ${flag.description}`);
      });
    if (documentation.referralNotes) parts.push(`Referral documentation: ${documentation.referralNotes}`);
  }

  if (documentation.clinicalNotes) {
    parts.push('');
    parts.push(`Additional notes: ${documentation.clinicalNotes}`);
  }

  return parts.join('\n').trim();
}

export function buildGpLetter(args: {
  condition?: ConsultationCondition;
  patient: Record<string, string>;
  differentials: { workingDiagnosis: string; items: { diagnosis: string; reasonExcluded: string }[] };
  treatment: Record<string, string>;
}) {
  const { condition, patient, differentials, treatment } = args;
  return [
    `Dear ${patient.gpName || 'Doctor'},`,
    '',
    `Re: ${patient.firstName || ''} ${patient.lastName || ''} (DOB: ${patient.dob || 'N/A'})`,
    '',
    `The patient attended for a ${condition?.name || 'pharmacist consultation'} consultation.`,
    '',
    `Working diagnosis: ${differentials.workingDiagnosis || 'Not documented'}`,
    ...differentials.items.map((item, index) => `${index + 1}. ${item.diagnosis}${item.reasonExcluded ? ` — excluded because ${item.reasonExcluded}` : ''}`),
    '',
    treatment.selectedTherapy ? `Treatment initiated: ${getSelectedTherapyLabel(condition, treatment.selectedTherapy)}` : 'No pharmacological treatment initiated.',
    '',
    'Kind regards,',
    'Pharmacist Prescriber',
  ].filter(Boolean).join('\n');
}

export function buildPatientSummary(args: {
  condition?: ConsultationCondition;
  patient: Record<string, string>;
  treatment: Record<string, string>;
}) {
  const { condition, patient, treatment } = args;
  return [
    'Patient Information Sheet',
    `Date: ${new Date().toLocaleDateString('en-AU')}`,
    '',
    `Dear ${patient.firstName || 'Patient'},`,
    '',
    `Today you attended for: ${condition?.name || 'your consultation'}`,
    treatment.selectedTherapy ? `Treatment: ${getSelectedTherapyLabel(condition, treatment.selectedTherapy)}` : '',
    treatment.safetyNet ? `Safety net: ${treatment.safetyNet}` : '',
    treatment.followUpPlan ? `Follow-up: ${treatment.followUpPlan}` : '',
  ].filter(Boolean).join('\n');
}
