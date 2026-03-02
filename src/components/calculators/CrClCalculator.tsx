import { useState } from 'react';
import { CalcSection, NumField, SexPicker, DetailResult, ResultRow, ResultAdvice, ResultNote, calcCrCl, round } from './shared';

function getDoseAdvice(crcl: number): string {
  if (crcl >= 90) return 'Normal renal function — no dose adjustment required for most drugs.';
  if (crcl >= 60) return 'Mild impairment — Metformin max 1g BD. Monitor nephrotoxic drugs.';
  if (crcl >= 30) return 'Moderate impairment — Metformin max 500mg BD. Reduce gentamicin interval. Avoid NSAIDs.';
  if (crcl >= 15) return 'Severe impairment — Cease metformin. Halve ACE-I/ARB dose. Specialist review recommended.';
  return 'End-stage renal — Cease metformin, NSAIDs, potassium-sparing diuretics. Urgent nephrology referral.';
}

export function CrClCalculator() {
  const [s, setS] = useState({ sex: 'male', height: '', weight: '', age: '', scr: '' });
  const [r, setR] = useState<number | null>(null);
  const clear = () => { setS({ sex: 'male', height: '', weight: '', age: '', scr: '' }); setR(null); };
  const calc = () => {
    const w = Number(s.weight), a = Number(s.age), scr = Number(s.scr);
    if (w > 0 && a > 0 && scr > 0) setR(calcCrCl(a, w, scr, s.sex === 'female'));
  };

  return (
    <CalcSection
      title="Creatinine clearance (CrCl) — Adults"
      disclaimer="Cockcroft-Gault formula. For patients ≥18 years with stable renal function. Not accurate for unstable renal function, low muscle mass, or cachectic patients."
      onClear={clear}
      onCalc={calc}
      result={r !== null ? (
        <DetailResult>
          <ResultRow label="CrCl" value={round(r)} unit="mL/min" />
          <ResultAdvice>{getDoseAdvice(r)}</ResultAdvice>
          <ResultNote>Cockcroft-Gault: [(140 − age) × weight × (0.85 if female)] / (0.813 × SCr µmol/L)</ResultNote>
        </DetailResult>
      ) : null}
    >
      <SexPicker value={s.sex} onChange={v => setS(p => ({ ...p, sex: v }))} />
      <NumField label="Age" value={s.age} onChange={v => setS(p => ({ ...p, age: v }))} unit="years" min={0} max={150} tooltip="Must be ≥18 years" />
      <NumField label="Weight" value={s.weight} onChange={v => setS(p => ({ ...p, weight: v }))} unit="kg" min={0} max={500} />
      <NumField label="Serum creatinine" value={s.scr} onChange={v => setS(p => ({ ...p, scr: v }))} unit="µmol/L" min={0} max={2000} />
    </CalcSection>
  );
}
