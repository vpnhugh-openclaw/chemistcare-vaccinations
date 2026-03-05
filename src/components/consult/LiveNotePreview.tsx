import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { Condition } from '@/types/clinical';

interface LiveNotePreviewProps {
  formData: Record<string, string>;
  condition?: Condition;
  differentials: { diagnosis: string; reasonExcluded: string }[];
  hasRedFlagTriggered: boolean;
  redFlagsChecked: Record<string, boolean>;
  pinnedEvidence: { question: string; answer: string; sources: string[] }[];
  noteHeadings?: string[];
}

export function LiveNotePreview({
  formData, condition, differentials, hasRedFlagTriggered, redFlagsChecked, pinnedEvidence, noteHeadings,
}: LiveNotePreviewProps) {
  const noteText = useMemo(() => {
    const parts: string[] = [];

    // Template note headings at top
    if (noteHeadings && noteHeadings.length > 0) {
      parts.push('── TEMPLATE HEADINGS ──');
      noteHeadings.forEach(h => parts.push(`▸ ${h}`));
      parts.push('');
    }

    // Patient
    if (formData.firstName || formData.lastName) {
      parts.push(`PATIENT: ${formData.firstName || ''} ${formData.lastName || ''}`);
      if (formData.dob) parts.push(`DOB: ${formData.dob}`);
      if (formData.sex) parts.push(`Sex: ${formData.sex}`);
      if (formData.allergies) parts.push(`Allergies: ${formData.allergies}`);
      if (formData.medications) parts.push(`Current Medications: ${formData.medications}`);
    }

    // Condition
    if (condition) {
      parts.push('');
      parts.push(`PRESENTING CONDITION: ${condition.name} (${condition.classification})`);
    }

    // Assessment
    const assessFields = condition?.assessmentFields || [];
    const filledAssess = assessFields.filter(f => formData[`assess_${f}`]);
    if (filledAssess.length > 0) {
      parts.push('');
      parts.push('ASSESSMENT:');
      filledAssess.forEach(f => parts.push(`  ${f}: ${formData[`assess_${f}`]}`));
    }

    // Red flags
    if (hasRedFlagTriggered) {
      parts.push('');
      parts.push('⚠ RED FLAGS TRIGGERED — PRESCRIBING BLOCKED');
      Object.entries(redFlagsChecked).filter(([, v]) => v).forEach(([id]) => {
        const rf = condition?.redFlags.find(r => r.id === id);
        if (rf) parts.push(`  • ${rf.description}`);
      });
      if (formData.referralNotes) parts.push(`Referral: ${formData.referralNotes}`);
    }

    // Diagnosis
    if (formData.workingDiagnosis) {
      parts.push('');
      parts.push(`WORKING DIAGNOSIS: ${formData.workingDiagnosis}`);
      differentials.filter(d => d.diagnosis.trim()).forEach((d, i) => {
        parts.push(`  Differential ${i + 1}: ${d.diagnosis} — Excluded: ${d.reasonExcluded || 'N/A'}`);
      });
    }

    // Treatment
    if (formData.selectedTherapy && condition) {
      const t = condition.therapyOptions.find(t => t.id === formData.selectedTherapy);
      if (t) {
        parts.push('');
        parts.push(`TREATMENT: ${t.medicineName} ${t.dose}`);
        parts.push(`  ${t.frequency} for ${t.duration} — Qty: ${t.maxQuantity}, Repeats: ${t.repeats}`);
        if (formData.deviationJustification) parts.push(`  Deviation justification: ${formData.deviationJustification}`);
      }
    }

    if (formData.followUpPlan) {
      parts.push('');
      parts.push(`FOLLOW-UP: ${formData.followUpPlan}`);
    }
    if (formData.safetyNet) {
      parts.push(`SAFETY NET: ${formData.safetyNet}`);
    }
    if (formData.clinicalNotes) {
      parts.push('');
      parts.push(`ADDITIONAL NOTES: ${formData.clinicalNotes}`);
    }

    return parts.join('\n');
  }, [formData, condition, differentials, hasRedFlagTriggered, redFlagsChecked, noteHeadings]);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Clinical Note</h3>
      <div className="bg-card border rounded-lg p-3 min-h-[200px]">
        <pre className="text-xs leading-relaxed whitespace-pre-wrap font-[var(--font-mono)] text-foreground/80">
          {noteText || 'Begin entering consultation data to generate the clinical note...'}
        </pre>
      </div>

      {pinnedEvidence.length > 0 && (
        <>
          <Separator />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pinned Evidence ({pinnedEvidence.length})</h3>
          <div className="space-y-2">
            {pinnedEvidence.map((e, i) => (
              <div key={i} className="text-xs p-2 rounded bg-muted/50 border">
                <p className="font-medium text-muted-foreground mb-1">{e.question}</p>
                <p className="leading-relaxed">{e.answer}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Sources: {e.sources.join(', ')}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
