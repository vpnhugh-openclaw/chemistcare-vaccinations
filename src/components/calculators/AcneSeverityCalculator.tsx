import { useState } from 'react';
import { CalcSection, NumField, DetailResult, ResultRow, ResultAdvice, ResultNote } from './shared';

function getSeverity(nonInflam: number, inflam: number): { severity: string; advice: string } {
  const total = nonInflam + inflam;

  if (inflam <= 5 && total <= 20) return {
    severity: 'Mild comedonal',
    advice: 'Topical retinoid (adapalene 0.1% gel) nightly. Add benzoyl peroxide 2.5% wash if mixed lesions. Review in 6–8 weeks. Avoid comedogenic products.',
  };
  if (inflam <= 20 && total <= 50) return {
    severity: 'Mild-moderate inflammatory',
    advice: 'Adapalene 0.1% + benzoyl peroxide 2.5% combination (Epiduo) nightly. OR topical retinoid + topical antibiotic (clindamycin 1%). Consider azelaic acid 15% if sensitive skin. Review in 8–12 weeks.',
  };
  if (inflam <= 50) return {
    severity: 'Moderate',
    advice: 'Oral antibiotics: doxycycline 50–100mg daily (max 3 months) + topical retinoid + benzoyl peroxide. If female, consider COC (Brenda-35/Diane-35). Review in 6–8 weeks. If inadequate response → referral for isotretinoin.',
  };
  return {
    severity: 'Severe / nodulocystic',
    advice: 'Refer to dermatologist for isotretinoin consideration. While waiting: doxycycline 100mg BD + adapalene/BPO combination. Do NOT use topical antibiotics alone. Monitor for scarring. Psychological support if needed.',
  };
}

export function AcneSeverityCalculator() {
  const [s, setS] = useState({ nonInflam: '', inflam: '' });
  const [r, setR] = useState<{ severity: string; advice: string } | null>(null);
  const clear = () => { setS({ nonInflam: '', inflam: '' }); setR(null); };
  const calc = () => {
    const ni = Number(s.nonInflam), inf = Number(s.inflam);
    if (ni >= 0 && inf >= 0) setR(getSeverity(ni, inf));
  };

  return (
    <CalcSection
      title="Acne Severity Assessment"
      disclaimer="Lesion-count based severity grading per Australian TG Dermatology. Count inflammatory (papules, pustules, nodules) and non-inflammatory (open/closed comedones) lesions across face, chest, and back."
      onClear={clear}
      onCalc={calc}
      result={r ? (
        <DetailResult>
          <ResultRow label="Severity" value={r.severity} />
          <ResultAdvice>{r.advice}</ResultAdvice>
          <ResultNote>TG Dermatology grading. Mild: ≤20 total, ≤5 inflammatory. Moderate: 20–50 total, ≤50 inflammatory. Severe: &gt;50 inflammatory or nodules.</ResultNote>
        </DetailResult>
      ) : null}
    >
      <NumField label="Non-inflammatory lesions" value={s.nonInflam} onChange={v => setS(p => ({ ...p, nonInflam: v }))} unit="count" min={-1} max={500} tooltip="Comedones (open + closed) on face, chest, back" />
      <NumField label="Inflammatory lesions" value={s.inflam} onChange={v => setS(p => ({ ...p, inflam: v }))} unit="count" min={-1} max={500} tooltip="Papules, pustules, nodules on face, chest, back" />
    </CalcSection>
  );
}
