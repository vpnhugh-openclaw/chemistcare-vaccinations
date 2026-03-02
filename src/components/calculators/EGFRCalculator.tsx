import { useState } from 'react';
import { CalcSection, NumField, SexPicker, DetailResult, ResultRow, ResultAdvice, ResultNote, round } from './shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// CKD-EPI 2021 (race-free) equation
function calcCKDEPI(age: number, scr: number, isFemale: boolean): number {
  // Convert µmol/L to mg/dL
  const scrMgDl = scr / 88.4;
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const multi = isFemale ? 1.012 : 1.0;

  const ratio = scrMgDl / kappa;
  const minR = Math.min(ratio, 1);
  const maxR = Math.max(ratio, 1);

  return 142 * Math.pow(minR, alpha) * Math.pow(maxR, -1.200) * Math.pow(0.9938, age) * multi;
}

function getStage(gfr: number): { stage: string; notes: string } {
  if (gfr >= 90) return { stage: 'G1 — Normal', notes: 'No renal dose adjustments needed. Monitor annually if risk factors present.' };
  if (gfr >= 60) return { stage: 'G2 — Mildly decreased', notes: 'Metformin max 1g BD. Avoid iodinated contrast without hydration. Annual monitoring.' };
  if (gfr >= 45) return { stage: 'G3a — Mild-moderate decrease', notes: 'Metformin max 500mg BD. Reduce digoxin dose. Avoid NSAIDs long-term. 6-monthly monitoring.' };
  if (gfr >= 30) return { stage: 'G3b — Moderate-severe decrease', notes: 'Cease metformin if <30. Halve ACEI/ARB dose. Avoid NSAIDs. Nephrology referral.' };
  if (gfr >= 15) return { stage: 'G4 — Severely decreased', notes: 'Cease metformin, NSAIDs, potassium-sparing diuretics. Urgent nephrology referral. Pre-dialysis planning.' };
  return { stage: 'G5 — Kidney failure', notes: 'Dialysis/transplant assessment. Specialist management of all medications.' };
}

export function EGFRCalculator() {
  const [s, setS] = useState({ sex: 'male', age: '', scr: '' });
  const [r, setR] = useState<{ gfr: number; stage: string; notes: string } | null>(null);
  const clear = () => { setS({ sex: 'male', age: '', scr: '' }); setR(null); };
  const calc = () => {
    const a = Number(s.age), scr = Number(s.scr);
    if (a > 0 && scr > 0) {
      const gfr = calcCKDEPI(a, scr, s.sex === 'female');
      const info = getStage(gfr);
      setR({ gfr, ...info });
    }
  };

  return (
    <CalcSection
      title="eGFR — CKD-EPI 2021"
      disclaimer="CKD-EPI 2021 race-free equation. For adults ≥18 years with stable renal function. Confirm with repeat testing before staging."
      onClear={clear}
      onCalc={calc}
      result={r ? (
        <DetailResult>
          <ResultRow label="eGFR" value={round(r.gfr)} unit="mL/min/1.73m²" />
          <ResultRow label="CKD Stage" value={r.stage} />
          <ResultAdvice>{r.notes}</ResultAdvice>
          <ResultNote>CKD-EPI 2021 (race-free): 142 × min(SCr/κ, 1)^α × max(SCr/κ, 1)^−1.200 × 0.9938^age × (1.012 if female)</ResultNote>
        </DetailResult>
      ) : null}
    >
      <SexPicker value={s.sex} onChange={v => setS(p => ({ ...p, sex: v }))} />
      <NumField label="Age" value={s.age} onChange={v => setS(p => ({ ...p, age: v }))} unit="years" min={0} max={150} />
      <NumField label="Serum creatinine" value={s.scr} onChange={v => setS(p => ({ ...p, scr: v }))} unit="µmol/L" min={0} max={2000} />
    </CalcSection>
  );
}
