import { useState } from 'react';
import { CalcSection, NumField, YesNoPicker, DetailResult, ResultRow, ResultAdvice, ResultNote } from './shared';

function getNRT(cigsPerDay: number, firstCigUnder30: boolean, weight: number): { patch: string; oral: string; advice: string } {
  const highDep = cigsPerDay >= 20 || firstCigUnder30;

  if (cigsPerDay <= 10 && !firstCigUnder30) {
    return {
      patch: '14 mg/24h patch × 6 weeks, then 7 mg × 2 weeks',
      oral: '2 mg gum/lozenge PRN (max 12/day)',
      advice: 'Low-moderate dependence. Monotherapy (patch OR oral NRT) is usually sufficient. Combination therapy (patch + oral) increases quit rates. Consider varenicline if prior NRT failure.',
    };
  }
  if (highDep && cigsPerDay < 30) {
    return {
      patch: '21 mg/24h patch × 8 weeks, then 14 mg × 2 weeks, then 7 mg × 2 weeks',
      oral: '4 mg gum/lozenge PRN (max 12/day)',
      advice: 'High dependence. Combination NRT recommended (21mg patch + 4mg gum/lozenge). Consider varenicline as first-line. Refer to Quitline (13 78 48).',
    };
  }
  return {
    patch: '21 mg/24h patch × 8–12 weeks (consider 2 × 21mg if >40 cigs/day), then taper',
    oral: '4 mg gum/lozenge PRN (max 15/day)',
    advice: 'Very high dependence. Combination NRT strongly recommended. Varenicline preferred first-line. Consider dual 21mg patches if >40 cigs/day. Specialist smoking cessation support recommended.',
  };
}

export function NRTCalculator() {
  const [s, setS] = useState({ cigs: '', firstCig: 'no', weight: '' });
  const [r, setR] = useState<{ patch: string; oral: string; advice: string } | null>(null);
  const clear = () => { setS({ cigs: '', firstCig: 'no', weight: '' }); setR(null); };
  const calc = () => {
    const c = Number(s.cigs), w = Number(s.weight);
    if (c > 0) setR(getNRT(c, s.firstCig === 'yes', w > 0 ? w : 70));
  };

  return (
    <CalcSection
      title="Nicotine Replacement Therapy (NRT) Dosing"
      disclaimer="Based on Australian TG Smoking Cessation guidelines. Combines Fagerström-derived dependence assessment with NRT dosing. Combination NRT (patch + oral) is more effective than monotherapy."
      onClear={clear}
      onCalc={calc}
      result={r ? (
        <DetailResult>
          <ResultRow label="Patch" value={r.patch} />
          <ResultRow label="Oral NRT" value={r.oral} />
          <ResultAdvice>{r.advice}</ResultAdvice>
          <ResultNote>TG Smoking Cessation. Dependence assessed by cigarettes/day and time to first cigarette.</ResultNote>
        </DetailResult>
      ) : null}
    >
      <NumField label="Cigarettes per day" value={s.cigs} onChange={v => setS(p => ({ ...p, cigs: v }))} unit="cigs/day" min={0} max={100} />
      <YesNoPicker label="First cigarette within 30 min of waking?" value={s.firstCig} onChange={v => setS(p => ({ ...p, firstCig: v }))} id="nrt-first" />
      <NumField label="Weight (optional)" value={s.weight} onChange={v => setS(p => ({ ...p, weight: v }))} unit="kg" min={0} max={300} tooltip="Used for dosing context" />
    </CalcSection>
  );
}
