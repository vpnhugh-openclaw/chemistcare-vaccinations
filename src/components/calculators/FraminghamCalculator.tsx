import { useState } from 'react';
import { CalcSection, NumField, SexPicker, YesNoPicker, DetailResult, ResultRow, ResultAdvice, ResultNote, round } from './shared';

// Simplified Framingham 10-year CVD risk (Anderson 1991 / NVDPA adaptation)
// We compute 10-yr risk then halve for ~5-yr estimate
function calcFramingham(age: number, isFemale: boolean, systolicBP: number, totalChol: number, hdl: number, smoker: boolean, diabetic: boolean): number {
  // Using log-linear model coefficients (simplified Anderson/Wilson)
  const lnAge = Math.log(age);
  const lnSBP = Math.log(systolicBP);
  const lnTC = Math.log(totalChol);
  const lnHDL = Math.log(hdl);

  let score: number;
  if (!isFemale) {
    score = 52.00961 * lnAge + 20.014077 * lnTC + (-0.905964) * lnHDL + 1.305784 * lnSBP
      + 0.241549 * (diabetic ? 1 : 0) + 0.596999 * (smoker ? 1 : 0) - 172.300168;
    const tenYr = 1 - Math.pow(0.9402, Math.exp(score));
    return tenYr;
  } else {
    score = 31.764001 * lnAge + 22.019144 * lnTC + (-1.187731) * lnHDL + 2.552905 * lnSBP
      + 0.420251 * (diabetic ? 1 : 0) + 0.461681 * (smoker ? 1 : 0) - 146.5933061;
    const tenYr = 1 - Math.pow(0.98767, Math.exp(score));
    return tenYr;
  }
}

function getAdvice(fiveYrPct: number): string {
  if (fiveYrPct < 5) return 'Low risk (<5%). Lifestyle modification. Recheck in 2 years. No pharmacotherapy indicated unless specific conditions.';
  if (fiveYrPct < 10) return 'Moderate risk (5–10%). Consider statin if LDL >2.0 mmol/L. BP target <140/90. Lifestyle intensification.';
  if (fiveYrPct < 15) return 'High risk (10–15%). Statin recommended. BP target <140/90. Aspirin if no contraindication. Comprehensive risk factor management.';
  return 'Very high risk (≥15%). Intensive statin therapy. BP target <130/80. Antiplatelet therapy. Consider specialist referral. Absolute benefit from treatment is greatest.';
}

export function FraminghamCalculator() {
  const [s, setS] = useState({ sex: 'male', age: '', sbp: '', tc: '', hdl: '', smoker: 'no', diabetic: 'no' });
  const [r, setR] = useState<{ tenYr: number; fiveYr: number; advice: string } | null>(null);
  const clear = () => { setS({ sex: 'male', age: '', sbp: '', tc: '', hdl: '', smoker: 'no', diabetic: 'no' }); setR(null); };
  const calc = () => {
    const a = Number(s.age), sbp = Number(s.sbp), tc = Number(s.tc), hdl = Number(s.hdl);
    if (a >= 30 && a <= 74 && sbp > 0 && tc > 0 && hdl > 0) {
      const tenYr = calcFramingham(a, s.sex === 'female', sbp, tc, hdl, s.smoker === 'yes', s.diabetic === 'yes') * 100;
      const fiveYr = tenYr / 2;
      setR({ tenYr, fiveYr, advice: getAdvice(fiveYr) });
    }
  };

  return (
    <CalcSection
      title="Framingham CVD Risk Score"
      disclaimer="Estimates 5- and 10-year cardiovascular disease risk. Valid for adults 30–74 years. Based on Anderson/Wilson Framingham model adapted for Australian guidelines (NVDPA). Uses total cholesterol and HDL in mmol/L."
      onClear={clear}
      onCalc={calc}
      result={r ? (
        <DetailResult>
          <ResultRow label="5-year CVD risk" value={`${round(r.fiveYr, 1)}%`} />
          <ResultRow label="10-year CVD risk" value={`${round(r.tenYr, 1)}%`} />
          <ResultAdvice>{r.advice}</ResultAdvice>
          <ResultNote>Framingham (Anderson/Wilson) log-linear model. 5-yr ≈ 10-yr / 2.</ResultNote>
        </DetailResult>
      ) : null}
    >
      <SexPicker value={s.sex} onChange={v => setS(p => ({ ...p, sex: v }))} />
      <NumField label="Age" value={s.age} onChange={v => setS(p => ({ ...p, age: v }))} unit="years" min={29} max={75} tooltip="Valid range: 30–74 years" />
      <NumField label="Systolic BP" value={s.sbp} onChange={v => setS(p => ({ ...p, sbp: v }))} unit="mmHg" min={0} max={300} />
      <NumField label="Total cholesterol" value={s.tc} onChange={v => setS(p => ({ ...p, tc: v }))} unit="mmol/L" min={0} max={20} />
      <NumField label="HDL cholesterol" value={s.hdl} onChange={v => setS(p => ({ ...p, hdl: v }))} unit="mmol/L" min={0} max={10} />
      <YesNoPicker label="Current smoker?" value={s.smoker} onChange={v => setS(p => ({ ...p, smoker: v }))} id="fram-smoke" />
      <YesNoPicker label="Diabetes?" value={s.diabetic} onChange={v => setS(p => ({ ...p, diabetic: v }))} id="fram-dm" />
    </CalcSection>
  );
}
