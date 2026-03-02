import { useState } from 'react';
import { CalcSection, NumField, YesNoPicker, DetailResult, ResultRow, ResultAdvice, ResultNote } from './shared';

function getMECCategory(bmi: number, sbp: number, dbp: number, age: number, smoker: boolean): { category: number; contraindications: string[]; advice: string } {
  const contras: string[] = [];
  let maxCat = 1;

  // Age + smoking
  if (age >= 35 && smoker) {
    contras.push('Age ≥35 + smoker → MEC 4 (absolute contraindication)');
    maxCat = 4;
  } else if (smoker) {
    contras.push('Smoker <35 → MEC 2');
    maxCat = Math.max(maxCat, 2);
  }

  // BMI
  if (bmi >= 40) {
    contras.push('BMI ≥40 → MEC 3 (risks generally outweigh benefits)');
    maxCat = Math.max(maxCat, 3);
  } else if (bmi >= 35) {
    contras.push('BMI 35–39.9 → MEC 3');
    maxCat = Math.max(maxCat, 3);
  } else if (bmi >= 30) {
    contras.push('BMI 30–34.9 → MEC 2');
    maxCat = Math.max(maxCat, 2);
  }

  // Blood pressure
  if (sbp >= 160 || dbp >= 100) {
    contras.push(`BP ${sbp}/${dbp} → MEC 4 (severe hypertension)`);
    maxCat = 4;
  } else if (sbp >= 140 || dbp >= 90) {
    contras.push(`BP ${sbp}/${dbp} → MEC 3 (hypertension)`);
    maxCat = Math.max(maxCat, 3);
  }

  // Age alone
  if (age >= 40) {
    contras.push('Age ≥40 → MEC 2');
    maxCat = Math.max(maxCat, 2);
  }

  let advice: string;
  if (maxCat === 1) advice = 'Category 1: No restriction. COC can be used without concern.';
  else if (maxCat === 2) advice = 'Category 2: Benefits generally outweigh risks. COC can be used with monitoring.';
  else if (maxCat === 3) advice = 'Category 3: Risks generally outweigh benefits. Consider progestogen-only pill, IUD, or implant instead. Use only if no acceptable alternative.';
  else advice = 'Category 4: Unacceptable health risk. COC is CONTRAINDICATED. Offer progestogen-only pill, copper IUD, LNG-IUD, or implant.';

  if (contras.length === 0) contras.push('No identified contraindications');

  return { category: maxCat, contraindications: contras, advice };
}

export function OCPSuitabilityCalculator() {
  const [s, setS] = useState({ bmi: '', sbp: '', dbp: '', age: '', smoker: 'no' });
  const [r, setR] = useState<{ category: number; contraindications: string[]; advice: string } | null>(null);
  const clear = () => { setS({ bmi: '', sbp: '', dbp: '', age: '', smoker: 'no' }); setR(null); };
  const calc = () => {
    const bmi = Number(s.bmi), sbp = Number(s.sbp), dbp = Number(s.dbp), age = Number(s.age);
    if (bmi > 0 && sbp > 0 && dbp > 0 && age > 0) {
      setR(getMECCategory(bmi, sbp, dbp, age, s.smoker === 'yes'));
    }
  };

  return (
    <CalcSection
      title="OCP BMI/BP Suitability (WHO MEC)"
      disclaimer="WHO Medical Eligibility Criteria for combined oral contraceptives (COC). Assesses BMI, blood pressure, age, and smoking status. Does not assess migraine with aura, VTE history, or other conditions — full MEC assessment required."
      onClear={clear}
      onCalc={calc}
      result={r ? (
        <DetailResult>
          <ResultRow label="WHO MEC Category" value={`${r.category}`} />
          <ResultAdvice>{r.advice}</ResultAdvice>
          <div className="space-y-1 mt-2">
            <span className="text-xs font-semibold text-foreground">Findings:</span>
            {r.contraindications.map((c, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {c}</p>
            ))}
          </div>
          <ResultNote>WHO MEC 5th ed. Categories: 1 = no restriction, 2 = benefits &gt; risks, 3 = risks &gt; benefits, 4 = contraindicated.</ResultNote>
        </DetailResult>
      ) : null}
    >
      <NumField label="Age" value={s.age} onChange={v => setS(p => ({ ...p, age: v }))} unit="years" min={0} max={60} />
      <NumField label="BMI" value={s.bmi} onChange={v => setS(p => ({ ...p, bmi: v }))} unit="kg/m²" min={0} max={80} tooltip="Weight (kg) / Height (m)²" />
      <NumField label="Systolic BP" value={s.sbp} onChange={v => setS(p => ({ ...p, sbp: v }))} unit="mmHg" min={0} max={300} />
      <NumField label="Diastolic BP" value={s.dbp} onChange={v => setS(p => ({ ...p, dbp: v }))} unit="mmHg" min={0} max={200} />
      <YesNoPicker label="Current smoker?" value={s.smoker} onChange={v => setS(p => ({ ...p, smoker: v }))} id="ocp-smoke" />
    </CalcSection>
  );
}
