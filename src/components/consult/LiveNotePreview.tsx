import { useMemo, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Condition } from '@/types/clinical';
import { Copy, FileDown, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LiveNotePreviewProps {
  formData: Record<string, string>;
  condition?: Condition;
  differentials: { diagnosis: string; reasonExcluded: string }[];
  hasRedFlagTriggered: boolean;
  redFlagsChecked: Record<string, boolean>;
  pinnedEvidence: { question: string; answer: string; sources: string[] }[];
  noteHeadings?: string[];
  isGenerating?: boolean;
}

export function LiveNotePreview({
  formData, condition, differentials, hasRedFlagTriggered, redFlagsChecked, pinnedEvidence, noteHeadings, isGenerating,
}: LiveNotePreviewProps) {
  const [copied, setCopied] = useState(false);

  const noteText = useMemo(() => {
    const parts: string[] = [];

    if (noteHeadings && noteHeadings.length > 0) {
      parts.push('── TEMPLATE HEADINGS ──');
      noteHeadings.forEach(h => parts.push(`▸ ${h}`));
      parts.push('');
    }

    if (formData.firstName || formData.lastName) {
      parts.push(`PATIENT: ${formData.firstName || ''} ${formData.lastName || ''}`);
      if (formData.dob) parts.push(`DOB: ${formData.dob}`);
      if (formData.sex) parts.push(`Sex: ${formData.sex}`);
      if (formData.allergies) parts.push(`Allergies: ${formData.allergies}`);
      if (formData.medications) parts.push(`Current Medications: ${formData.medications}`);
    }

    if (condition) {
      parts.push('');
      parts.push(`PRESENTING CONDITION: ${condition.name} (${condition.classification})`);
    }

    const assessFields = condition?.assessmentFields || [];
    const filledAssess = assessFields.filter(f => formData[`assess_${f}`]);
    if (filledAssess.length > 0) {
      parts.push('');
      parts.push('ASSESSMENT:');
      filledAssess.forEach(f => parts.push(`  ${f}: ${formData[`assess_${f}`]}`));
    }

    if (hasRedFlagTriggered) {
      parts.push('');
      parts.push('⚠ RED FLAGS TRIGGERED — PRESCRIBING BLOCKED');
      Object.entries(redFlagsChecked).filter(([, v]) => v).forEach(([id]) => {
        const rf = condition?.redFlags.find(r => r.id === id);
        if (rf) parts.push(`  • ${rf.description}`);
      });
      if (formData.referralNotes) parts.push(`Referral: ${formData.referralNotes}`);
    }

    if (formData.workingDiagnosis) {
      parts.push('');
      parts.push(`WORKING DIAGNOSIS: ${formData.workingDiagnosis}`);
      differentials.filter(d => d.diagnosis.trim()).forEach((d, i) => {
        parts.push(`  Differential ${i + 1}: ${d.diagnosis} — Excluded: ${d.reasonExcluded || 'N/A'}`);
      });
    }

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

  const wordCount = useMemo(() => {
    return noteText.trim() ? noteText.trim().split(/\s+/).length : 0;
  }, [noteText]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(noteText);
    setCopied(true);
    toast.success('Clinical note copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    toast.success('PDF export started');
    // Future: actual jsPDF export
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Clinical Note</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="Copy note">
            {copied ? <CheckCircle className="h-3.5 w-3.5 text-clinical-safe" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleExportPdf} title="Export PDF">
            <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
      <div className="rounded-lg p-3 min-h-[200px]" style={{ backgroundColor: '#F0F4F8' }}>
        <pre className="text-[13px] leading-relaxed whitespace-pre-wrap text-foreground/80" style={{ fontFamily: "'Roboto Mono', monospace" }}>
          {noteText || 'Begin entering consultation data to generate the clinical note...'}
          {isGenerating && noteText && <span className="blink-cursor" />}
        </pre>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
        <span>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
        {isGenerating && <span className="animate-pulse text-primary">Generating...</span>}
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
