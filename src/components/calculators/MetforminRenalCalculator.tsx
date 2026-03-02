import { useState } from 'react';
import { CalcSection, NumField, DetailResult, ResultRow, ResultAdvice, ResultNote } from './shared';

function getMetforminDose(crcl: number): { maxDose: string; frequency: string; notes: string } {
  if (crcl >= 90) return { maxDose: '1000 mg', frequency: 'BD (twice daily)', notes: 'Normal renal function. Standard dosing. Titrate from 500mg daily over 2–4 weeks.' };
  if (crcl >= 60) return { maxDose: '1000 mg', frequency: 'BD (twice daily)', notes: 'Mild impairment. Standard dosing appropriate. Monitor renal function 6-monthly.' };
  if (crcl >= 45) return { maxDose: '500 mg', frequency: 'BD (twice daily)', notes: 'eGFR 45–59: Max 1g/day. Do not initiate if new patient. Monitor 3-monthly.' };
  if (crcl >= 30) return { maxDose: '500 mg', frequency: 'Daily', notes: 'eGFR 30–44: Max 500mg/day. Withhold if dehydration, acute illness, or contrast use. Monitor renal function monthly.' };
  return { maxDose: 'CONTRAINDICATED', frequency: 'N/A', notes: 'eGFR <30: Metformin contraindicated. Risk of lactic acidosis. Cease immediately. Consider alternative: SGLT2i if eGFR ≥20, DPP-4i, or insulin.' };
}

export function MetforminRenalCalculator() {
  const [crcl, setCrcl] = useState('');
  const [r, setR] = useState<{ maxDose: string; frequency: string; notes: string } | null>(null);
  const clear = () => { setCrcl(''); setR(null); };
  const calc = () => {
    const v = Number(crcl);
    if (v > 0) setR(getMetforminDose(v));
  };

  return (
    <CalcSection
      title="Metformin Renal Dose Adjustment"
      disclaimer="Based on Australian Diabetes Society and AMH guidelines. Input CrCl or eGFR to determine maximum metformin dose. Always withhold metformin 48h before iodinated contrast."
      onClear={clear}
      onCalc={calc}
      result={r ? (
        <DetailResult>
          <ResultRow label="Max dose" value={r.maxDose} />
          <ResultRow label="Frequency" value={r.frequency} />
          <ResultAdvice>{r.notes}</ResultAdvice>
          <ResultNote>AMH / ADS guidelines. Thresholds: ≥60 full dose, 45–59 max 1g/day, 30–44 max 500mg/day, &lt;30 contraindicated.</ResultNote>
        </DetailResult>
      ) : null}
    >
      <NumField label="CrCl or eGFR" value={crcl} onChange={setCrcl} unit="mL/min" min={0} max={200} tooltip="Enter Cockcroft-Gault CrCl or CKD-EPI eGFR" />
    </CalcSection>
  );
}
