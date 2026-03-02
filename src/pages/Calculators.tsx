import { useState } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { ExternalLink } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  CalcSection, NumField, SexPicker, ResultBox, DetailResult, ResultRow, ResultAdvice, ResultNote, YesNoPicker,
  ETG_LINK, round, calcBSA, calcIBW, calcLBW, calcCrCl,
} from '@/components/calculators/shared';

// New calculators
import { CrClCalculator } from '@/components/calculators/CrClCalculator';
import { EGFRCalculator } from '@/components/calculators/EGFRCalculator';
import { FraminghamCalculator } from '@/components/calculators/FraminghamCalculator';
import { ACTCalculator } from '@/components/calculators/ACTCalculator';
import { COPDRiskCalculator } from '@/components/calculators/COPDRiskCalculator';
import { MetforminRenalCalculator } from '@/components/calculators/MetforminRenalCalculator';
import { NRTCalculator } from '@/components/calculators/NRTCalculator';
import { OCPSuitabilityCalculator } from '@/components/calculators/OCPSuitabilityCalculator';
import { AcneSeverityCalculator } from '@/components/calculators/AcneSeverityCalculator';
import { AntibioticRenalCalculator } from '@/components/calculators/AntibioticRenalCalculator';

// ── Inline calculators (BSA, IBW, LBW, Aminoglycoside) ──

function BSACalculator() {
  const [s, setS] = useState({ height: '', weight: '' });
  const [r, setR] = useState<number | null>(null);
  return (
    <CalcSection title="Body Surface Area" disclaimer="Mosteller formula: BSA (m²) = √[(height cm × weight kg) / 3600]."
      onClear={() => { setS({ height: '', weight: '' }); setR(null); }}
      onCalc={() => { const h = Number(s.height), w = Number(s.weight); if (h > 0 && w > 0) setR(calcBSA(h, w)); }}
      result={<ResultBox label="BSA" value={r} unit="m²" formula="Mosteller: BSA = √[(height × weight) / 3600]" />}>
      <NumField label="Height" value={s.height} onChange={v => setS(p => ({ ...p, height: v }))} unit="cm" min={0} max={300} />
      <NumField label="Actual body weight" value={s.weight} onChange={v => setS(p => ({ ...p, weight: v }))} unit="kg" min={0} max={500} />
    </CalcSection>
  );
}

function IBWCalculator() {
  const [s, setS] = useState({ sex: 'male', height: '' });
  const [r, setR] = useState<number | null>(null);
  return (
    <CalcSection title="Ideal Body Weight" disclaimer="Devine formula. Males: 50 + 2.3 × (height″ − 60). Females: 45.5 + 2.3 × (height″ − 60). Height converted from cm."
      onClear={() => { setS({ sex: 'male', height: '' }); setR(null); }}
      onCalc={() => { const h = Number(s.height); if (h > 0) setR(calcIBW(h, s.sex === 'female')); }}
      result={<ResultBox label="IBW" value={r} unit="kg" formula="Devine: Males = 50 + 2.3 × (height″ − 60); Females = 45.5 + 2.3 × (height″ − 60)" />}>
      <SexPicker value={s.sex} onChange={v => setS(p => ({ ...p, sex: v }))} />
      <NumField label="Height" value={s.height} onChange={v => setS(p => ({ ...p, height: v }))} unit="cm" min={0} max={300} />
    </CalcSection>
  );
}

function LBWCalculator() {
  const [s, setS] = useState({ sex: 'male', height: '', weight: '' });
  const [r, setR] = useState<number | null>(null);
  return (
    <CalcSection title="Lean Body Weight" disclaimer="Boer formula. Males: 0.407×W + 0.267×H − 19.2. Females: 0.252×W + 0.473×H − 48.3."
      onClear={() => { setS({ sex: 'male', height: '', weight: '' }); setR(null); }}
      onCalc={() => { const h = Number(s.height), w = Number(s.weight); if (h > 0 && w > 0) setR(calcLBW(w, h, s.sex === 'female')); }}
      result={<ResultBox label="LBW" value={r} unit="kg" formula="Boer: Males = 0.407×W + 0.267×H − 19.2; Females = 0.252×W + 0.473×H − 48.3" />}>
      <SexPicker value={s.sex} onChange={v => setS(p => ({ ...p, sex: v }))} />
      <NumField label="Height" value={s.height} onChange={v => setS(p => ({ ...p, height: v }))} unit="cm" min={0} max={300} />
      <NumField label="Actual body weight" value={s.weight} onChange={v => setS(p => ({ ...p, weight: v }))} unit="kg" min={0} max={500} />
    </CalcSection>
  );
}

function AminoglycosideCalculator() {
  const [s, setS] = useState({ antibiotic: 'gentamicin', sex: 'male', height: '', weight: '', age: '', scr: '', kidneyUnknown: false, septic: 'no' });
  const [r, setR] = useState<{ dose: number; interval: string; lbw: number; crcl: number | null; antibiotic: string } | null>(null);
  const clear = () => { setS({ antibiotic: 'gentamicin', sex: 'male', height: '', weight: '', age: '', scr: '', kidneyUnknown: false, septic: 'no' }); setR(null); };
  const calc = () => {
    const h = Number(s.height), w = Number(s.weight), a = Number(s.age), scr = Number(s.scr);
    const isFemale = s.sex === 'female';
    if (h <= 0 || w <= 0) return;
    const lbw = calcLBW(w, h, isFemale);
    const dosingWeight = Math.min(lbw, w);
    const dosePerKg = s.antibiotic === 'amikacin' ? 30 : 7;
    let dose = round(dosePerKg * dosingWeight, 0);
    if (s.antibiotic === 'gentamicin' || s.antibiotic === 'tobramycin') dose = Math.min(dose, 560);
    else dose = Math.min(dose, 2100);
    let crcl: number | null = null;
    let interval = 'q24h';
    if (!s.kidneyUnknown && a > 0 && scr > 0) {
      crcl = calcCrCl(a, dosingWeight, scr, isFemale);
      if (crcl >= 60) interval = 'q24h';
      else if (crcl >= 40) interval = 'q36h';
      else if (crcl >= 20) interval = 'q48h';
      else interval = 'Seek specialist advice';
    } else if (s.kidneyUnknown) {
      interval = s.septic === 'yes' ? 'q24h (empiric – monitor levels)' : 'q24h (review renal function urgently)';
    }
    setR({ dose, interval, lbw: round(dosingWeight), crcl: crcl !== null ? round(crcl) : null, antibiotic: s.antibiotic.charAt(0).toUpperCase() + s.antibiotic.slice(1) });
  };

  return (
    <CalcSection title="Aminoglycoside Initial Dose (Adults)" disclaimer="Initial aminoglycoside dose for patients ≥18 years. Not for surgical prophylaxis or synergistic therapy. Dose based on lean body weight. Refer to eTG for full prescribing principles."
      onClear={clear} onCalc={calc}
      result={r ? (
        <DetailResult>
          <ResultRow label="Initial dose" value={`${r.antibiotic} ${r.dose} mg`} unit={r.interval} />
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            <span>Dosing weight (LBW): <strong className="text-foreground">{r.lbw} kg</strong></span>
            {r.crcl !== null && <span>CrCl: <strong className="text-foreground">{r.crcl} mL/min</strong></span>}
          </div>
          <ResultNote>
            {s.antibiotic === 'amikacin' ? '30' : '7'} mg/kg LBW (once-daily dosing). Interval adjusted by CrCl per eTG.
          </ResultNote>
          <a href={ETG_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
            <ExternalLink className="h-3 w-3" /> eTG Aminoglycoside dosing principles
          </a>
        </DetailResult>
      ) : null}>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Antibiotic</Label>
        <Select value={s.antibiotic} onValueChange={v => setS(p => ({ ...p, antibiotic: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="gentamicin">Gentamicin</SelectItem>
            <SelectItem value="tobramycin">Tobramycin</SelectItem>
            <SelectItem value="amikacin">Amikacin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SexPicker value={s.sex} onChange={v => setS(p => ({ ...p, sex: v }))} />
      <NumField label="Height" value={s.height} onChange={v => setS(p => ({ ...p, height: v }))} unit="cm" min={0} max={300} />
      <NumField label="Actual body weight" value={s.weight} onChange={v => setS(p => ({ ...p, weight: v }))} unit="kg" min={0} max={500} />
      <NumField label="Age" value={s.age} onChange={v => setS(p => ({ ...p, age: v }))} unit="years" min={0} max={150} />
      <NumField label="Serum creatinine" value={s.scr} onChange={v => setS(p => ({ ...p, scr: v }))} unit="µmol/L" min={0} max={2000} tooltip="Leave empty if kidney function unknown" />
      <div className="sm:col-span-2 space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox id="kidney-unknown" checked={s.kidneyUnknown} onCheckedChange={v => setS(p => ({ ...p, kidneyUnknown: !!v, scr: !!v ? '' : p.scr }))} />
          <Label htmlFor="kidney-unknown" className="text-sm cursor-pointer">Kidney function unknown, not presumed impaired</Label>
        </div>
        <YesNoPicker label="Septic shock or requires ICU support?" value={s.septic} onChange={v => setS(p => ({ ...p, septic: v }))} id="amino-septic" />
      </div>
    </CalcSection>
  );
}

// ═══════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════

const CalculatorsPage = () => {
  return (
    <ClinicalLayout>
      <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Renal &amp; Dosing Calculators</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Clinical calculators aligned with Therapeutic Guidelines (eTG), AMH, and PBS. All results must be interpreted in clinical context.
          </p>
          <a href={ETG_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1">
            <ExternalLink className="h-3 w-3" /> Therapeutic Guidelines reference
          </a>
        </div>

        {/* Renal */}
        <CrClCalculator />
        <EGFRCalculator />
        <MetforminRenalCalculator />

        {/* Body composition */}
        <BSACalculator />
        <IBWCalculator />
        <LBWCalculator />

        {/* Antimicrobial dosing */}
        <AminoglycosideCalculator />
        <AntibioticRenalCalculator />

        {/* CVD & Chronic disease */}
        <FraminghamCalculator />
        <ACTCalculator />
        <COPDRiskCalculator />

        {/* Other */}
        <NRTCalculator />
        <OCPSuitabilityCalculator />
        <AcneSeverityCalculator />

        {/* Footer disclaimer */}
        <div className="text-xs text-muted-foreground border-t pt-4 space-y-1">
          <p className="font-medium">Clinical disclaimer</p>
          <p>These calculators are intended as clinical decision support tools only. All results must be interpreted in the context of the individual patient's clinical situation. Verify all calculations independently before prescribing. ChemistCare PrescriberOS does not replace clinical judgement.</p>
        </div>
      </div>
    </ClinicalLayout>
  );
};

export default CalculatorsPage;
