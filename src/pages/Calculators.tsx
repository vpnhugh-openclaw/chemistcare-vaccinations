import { useState, useCallback } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, RotateCcw, FileDown, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ── Helpers ──

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

const cmToInches = (cm: number) => cm / 2.54;

const calcCrCl = (age: number, weight: number, scr: number, isFemale: boolean) => {
  const base = ((140 - age) * weight) / (0.813 * scr);
  return isFemale ? base * 0.85 : base;
};

const calcBSA = (h: number, w: number) => Math.sqrt((h * w) / 3600);

const calcIBW = (h: number, isFemale: boolean) => {
  const inches = cmToInches(h);
  return isFemale ? 45.5 + 2.3 * (inches - 60) : 50 + 2.3 * (inches - 60);
};

const calcLBW = (w: number, h: number, isFemale: boolean) =>
  isFemale ? 0.252 * w + 0.473 * h - 48.3 : 0.407 * w + 0.267 * h - 19.2;

// ── Reusable numeric input with validation ──

interface NumFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  tooltip?: string;
  min?: number;
  max?: number;
}

function NumField({ label, value, onChange, unit, tooltip, min = 0, max }: NumFieldProps) {
  const numVal = Number(value);
  const invalid = value !== '' && (isNaN(numVal) || numVal <= (min ?? 0) || (max !== undefined && numVal > max));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-sm font-medium">{label}</Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground cursor-help text-xs">ⓘ</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`pr-16 ${invalid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          min={min}
          max={max}
          step="any"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>
      </div>
      {invalid && <p className="text-xs text-destructive">Enter a valid positive number{max ? ` (max ${max})` : ''}</p>}
    </div>
  );
}

// ── Sex picker ──

function SexPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">Sex</Label>
      <RadioGroup value={value} onValueChange={onChange} className="flex gap-4">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="male" id="sex-m" />
          <Label htmlFor="sex-m" className="text-sm cursor-pointer">Male</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="female" id="sex-f" />
          <Label htmlFor="sex-f" className="text-sm cursor-pointer">Female</Label>
        </div>
      </RadioGroup>
    </div>
  );
}

// ── Result display ──

function ResultBox({ label, value, unit, formula }: { label: string; value: number | null; unit: string; formula: string }) {
  if (value === null) return null;
  return (
    <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-2 animate-fade-in">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-foreground">{label}:</span>
        <span className="text-2xl font-bold text-accent">{round(value)}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <p className="text-xs text-muted-foreground italic">Formula: {formula}</p>
    </div>
  );
}

// ── Section wrapper ──

function CalcSection({ title, disclaimer, children, onClear, onCalc, result, canExport = true }: {
  title: string;
  disclaimer: string;
  children: React.ReactNode;
  onClear: () => void;
  onCalc: () => void;
  result: React.ReactNode;
  canExport?: boolean;
}) {
  const handleExport = () => {
    const el = document.createElement('div');
    el.innerHTML = `<h2>${title}</h2>${document.getElementById(title.replace(/\s+/g, '-'))?.innerHTML ?? ''}`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<html><head><title>${title}</title><style>body{font-family:sans-serif;padding:2rem;max-width:700px;margin:0 auto}h2{color:#1a3a4a}p{margin:.5rem 0}</style></head><body>${el.innerHTML}<p style="color:#999;font-size:12px;margin-top:2rem">Generated by ChemistCare PrescriberOS — for clinical use only</p></body></html>`);
      w.document.close();
      w.print();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-accent" />
            {title}
          </CardTitle>
          <div className="flex gap-2">
            {canExport && result && (
              <Button variant="ghost" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
                <FileDown className="h-3.5 w-3.5" /> Export
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5 text-xs text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" /> Clear all
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic leading-relaxed mt-1">{disclaimer}</p>
      </CardHeader>
      <CardContent id={title.replace(/\s+/g, '-')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children}
        </div>
        <div className="mt-5">
          <Button onClick={onCalc} className="gap-2">
            <Calculator className="h-4 w-4" /> Calculate
          </Button>
        </div>
        {result}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════

const CalculatorsPage = () => {
  // ── Section 1: CrCl (Adults) ──
  const [s1, setS1] = useState({ sex: 'male', height: '', weight: '', age: '', scr: '' });
  const [r1, setR1] = useState<number | null>(null);
  const clearS1 = () => { setS1({ sex: 'male', height: '', weight: '', age: '', scr: '' }); setR1(null); };
  const calcS1 = () => {
    const { sex, weight, age, scr } = s1;
    const w = Number(weight), a = Number(age), s = Number(scr);
    if (w > 0 && a > 0 && s > 0) setR1(calcCrCl(a, w, s, sex === 'female'));
  };

  // ── Section 2: GFR (Children) ──
  const [s2, setS2] = useState({ height: '', scr: '' });
  const [r2, setR2] = useState<number | null>(null);
  const clearS2 = () => { setS2({ height: '', scr: '' }); setR2(null); };
  const calcS2 = () => {
    const h = Number(s2.height), s = Number(s2.scr);
    if (h > 0 && s > 0) setR2(36.5 * (h / s));
  };

  // ── Section 3: BSA ──
  const [s3, setS3] = useState({ height: '', weight: '' });
  const [r3, setR3] = useState<number | null>(null);
  const clearS3 = () => { setS3({ height: '', weight: '' }); setR3(null); };
  const calcS3 = () => {
    const h = Number(s3.height), w = Number(s3.weight);
    if (h > 0 && w > 0) setR3(calcBSA(h, w));
  };

  // ── Section 4: IBW ──
  const [s4, setS4] = useState({ sex: 'male', height: '' });
  const [r4, setR4] = useState<number | null>(null);
  const clearS4 = () => { setS4({ sex: 'male', height: '' }); setR4(null); };
  const calcS4 = () => {
    const h = Number(s4.height);
    if (h > 0) setR4(calcIBW(h, s4.sex === 'female'));
  };

  // ── Section 5: LBW ──
  const [s5, setS5] = useState({ sex: 'male', height: '', weight: '' });
  const [r5, setR5] = useState<number | null>(null);
  const clearS5 = () => { setS5({ sex: 'male', height: '', weight: '' }); setR5(null); };
  const calcS5 = () => {
    const h = Number(s5.height), w = Number(s5.weight);
    if (h > 0 && w > 0) setR5(calcLBW(w, h, s5.sex === 'female'));
  };

  // ── Section 6: Aminoglycoside ──
  const [s6, setS6] = useState({
    antibiotic: 'gentamicin',
    sex: 'male',
    height: '',
    weight: '',
    age: '',
    scr: '',
    kidneyUnknown: false,
    septic: 'no',
  });
  const [r6, setR6] = useState<{ dose: number; interval: string; lbw: number; crcl: number | null; antibiotic: string } | null>(null);
  const clearS6 = () => {
    setS6({ antibiotic: 'gentamicin', sex: 'male', height: '', weight: '', age: '', scr: '', kidneyUnknown: false, septic: 'no' });
    setR6(null);
  };
  const calcS6 = () => {
    const h = Number(s6.height), w = Number(s6.weight), a = Number(s6.age), scr = Number(s6.scr);
    const isFemale = s6.sex === 'female';
    if (h <= 0 || w <= 0) return;

    const lbw = calcLBW(w, h, isFemale);
    const dosingWeight = Math.min(lbw, w); // use lower of LBW and ABW

    // Dose per kg based on antibiotic
    const dosePerKg = s6.antibiotic === 'amikacin' ? 30 : 7;
    let dose = round(dosePerKg * dosingWeight, 0);

    // Max caps
    if (s6.antibiotic === 'gentamicin' || s6.antibiotic === 'tobramycin') {
      dose = Math.min(dose, 560);
    } else {
      dose = Math.min(dose, 2100);
    }

    let crcl: number | null = null;
    let interval = 'q24h';

    if (!s6.kidneyUnknown && a > 0 && scr > 0) {
      crcl = calcCrCl(a, dosingWeight, scr, isFemale);
      if (crcl >= 60) interval = 'q24h';
      else if (crcl >= 40) interval = 'q36h';
      else if (crcl >= 20) interval = 'q48h';
      else interval = 'Seek specialist advice';
    } else if (s6.kidneyUnknown) {
      interval = s6.septic === 'yes' ? 'q24h (empiric – monitor levels)' : 'q24h (review renal function urgently)';
    }

    setR6({
      dose,
      interval,
      lbw: round(dosingWeight),
      crcl: crcl !== null ? round(crcl) : null,
      antibiotic: s6.antibiotic.charAt(0).toUpperCase() + s6.antibiotic.slice(1),
    });
  };

  const ETG_LINK = 'https://www.tg.org.au';

  return (
    <ClinicalLayout>
      <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Renal &amp; Dosing Calculators</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Clinical calculators aligned with Therapeutic Guidelines (eTG). All results must be interpreted in clinical context.
          </p>
          <a href={ETG_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1">
            <ExternalLink className="h-3 w-3" /> Therapeutic Guidelines reference
          </a>
        </div>

        {/* ── 1. CrCl Adults ── */}
        <CalcSection
          title="Creatinine clearance calculator for adults"
          disclaimer="This creatinine clearance calculator should only be used for patients 18 years and older. The calculator does not accurately predict creatinine clearance in patients who have unstable renal function (e.g. patients in intensive care, patients with acute renal impairment, patients with febrile neutropenia); a measured (urinary) creatinine clearance is most accurate in this situation. The calculator should not be used for patients who have low muscle mass (e.g. cachectic patients)."
          onClear={clearS1}
          onCalc={calcS1}
          result={<ResultBox label="Creatinine clearance" value={r1} unit="mL/min" formula="Cockcroft-Gault: CrCl = [(140 − age) × weight (kg) × (0.85 if female)] / (0.813 × serum creatinine µmol/L)" />}
        >
          <SexPicker value={s1.sex} onChange={v => setS1(p => ({ ...p, sex: v }))} />
          <NumField label="Height" value={s1.height} onChange={v => setS1(p => ({ ...p, height: v }))} unit="cm" min={0} max={300} />
          <NumField label="Actual body weight" value={s1.weight} onChange={v => setS1(p => ({ ...p, weight: v }))} unit="kg" min={0} max={500} />
          <NumField label="Age" value={s1.age} onChange={v => setS1(p => ({ ...p, age: v }))} unit="years" min={0} max={150} tooltip="Patient must be ≥18 years" />
          <NumField label="Serum creatinine" value={s1.scr} onChange={v => setS1(p => ({ ...p, scr: v }))} unit="µmol/L" min={0} max={2000} />
        </CalcSection>

        {/* ── 2. GFR Children ── */}
        <CalcSection
          title="Glomerular filtration rate (GFR) calculator for children"
          disclaimer="This calculator provides an estimate of glomerular filtration rate. It should only be used for children older than 1 year. The calculator is based on the modified Schwartz formula."
          onClear={clearS2}
          onCalc={calcS2}
          result={<ResultBox label="eGFR" value={r2} unit="mL/min/1.73m²" formula="Bedside Schwartz: eGFR = 36.5 × (height cm / serum creatinine µmol/L)" />}
        >
          <NumField label="Height" value={s2.height} onChange={v => setS2(p => ({ ...p, height: v }))} unit="cm" min={0} max={220} />
          <NumField label="Serum creatinine" value={s2.scr} onChange={v => setS2(p => ({ ...p, scr: v }))} unit="µmol/L" min={0} max={2000} />
        </CalcSection>

        {/* ── 3. BSA ── */}
        <CalcSection
          title="Body surface area calculator"
          disclaimer="The body surface area is calculated using the Mosteller formula: BSA (m²) = √[(height cm × weight kg) / 3600]."
          onClear={clearS3}
          onCalc={calcS3}
          result={<ResultBox label="BSA" value={r3} unit="m²" formula="Mosteller: BSA = √[(height × weight) / 3600]" />}
        >
          <NumField label="Height" value={s3.height} onChange={v => setS3(p => ({ ...p, height: v }))} unit="cm" min={0} max={300} />
          <NumField label="Actual body weight" value={s3.weight} onChange={v => setS3(p => ({ ...p, weight: v }))} unit="kg" min={0} max={500} />
        </CalcSection>

        {/* ── 4. IBW ── */}
        <CalcSection
          title="Ideal body weight calculator"
          disclaimer="This calculator is based on the Devine formula: Males IBW (kg) = 50 + 2.3 × (height in inches − 60); Females IBW (kg) = 45.5 + 2.3 × (height in inches − 60)."
          onClear={clearS4}
          onCalc={calcS4}
          result={<ResultBox label="Ideal body weight" value={r4} unit="kg" formula="Devine: Males = 50 + 2.3 × (height″ − 60); Females = 45.5 + 2.3 × (height″ − 60)" />}
        >
          <SexPicker value={s4.sex} onChange={v => setS4(p => ({ ...p, sex: v }))} />
          <NumField label="Height" value={s4.height} onChange={v => setS4(p => ({ ...p, height: v }))} unit="cm" min={0} max={300} tooltip="Converted to inches internally (÷ 2.54)" />
        </CalcSection>

        {/* ── 5. LBW ── */}
        <CalcSection
          title="Lean body weight calculator"
          disclaimer="This calculator is based on the Boer formula: Males LBW (kg) = 0.407 × weight + 0.267 × height − 19.2; Females LBW (kg) = 0.252 × weight + 0.473 × height − 48.3."
          onClear={clearS5}
          onCalc={calcS5}
          result={<ResultBox label="Lean body weight" value={r5} unit="kg" formula="Boer: Males = 0.407×W + 0.267×H − 19.2; Females = 0.252×W + 0.473×H − 48.3" />}
        >
          <SexPicker value={s5.sex} onChange={v => setS5(p => ({ ...p, sex: v }))} />
          <NumField label="Height" value={s5.height} onChange={v => setS5(p => ({ ...p, height: v }))} unit="cm" min={0} max={300} />
          <NumField label="Actual body weight" value={s5.weight} onChange={v => setS5(p => ({ ...p, weight: v }))} unit="kg" min={0} max={500} />
        </CalcSection>

        {/* ── 6. Aminoglycoside ── */}
        <CalcSection
          title="Aminoglycoside initial dose calculator for adults"
          disclaimer="This calculator provides an initial aminoglycoside dose for patients older than 18 years. It cannot be used to calculate the dose for surgical prophylaxis or synergistic therapy. The dose is calculated using the patient's lean body weight. The calculator may be used for all adult patients without a contraindication to once-daily dosing. Refer to eTG for full prescribing principles."
          onClear={clearS6}
          onCalc={calcS6}
          result={
            r6 ? (
              <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-2 animate-fade-in">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">Initial dose:</span>
                  <span className="text-2xl font-bold text-accent">{r6.antibiotic} {r6.dose} mg</span>
                  <span className="text-sm text-muted-foreground">{r6.interval}</span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Dosing weight (LBW): <strong className="text-foreground">{r6.lbw} kg</strong></span>
                  {r6.crcl !== null && <span>CrCl: <strong className="text-foreground">{r6.crcl} mL/min</strong></span>}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Dose: {s6.antibiotic === 'amikacin' ? '30' : '7'} mg/kg LBW (once-daily dosing). Interval adjusted by CrCl per eTG recommendations.
                </p>
                <a href={ETG_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                  <ExternalLink className="h-3 w-3" /> eTG Aminoglycoside dosing principles
                </a>
              </div>
            ) : null
          }
        >
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Antibiotic</Label>
            <Select value={s6.antibiotic} onValueChange={v => setS6(p => ({ ...p, antibiotic: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gentamicin">Gentamicin</SelectItem>
                <SelectItem value="tobramycin">Tobramycin</SelectItem>
                <SelectItem value="amikacin">Amikacin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SexPicker value={s6.sex} onChange={v => setS6(p => ({ ...p, sex: v }))} />
          <NumField label="Height" value={s6.height} onChange={v => setS6(p => ({ ...p, height: v }))} unit="cm" min={0} max={300} />
          <NumField label="Actual body weight" value={s6.weight} onChange={v => setS6(p => ({ ...p, weight: v }))} unit="kg" min={0} max={500} />
          <NumField label="Age" value={s6.age} onChange={v => setS6(p => ({ ...p, age: v }))} unit="years" min={0} max={150} />
          <NumField
            label="Serum creatinine"
            value={s6.scr}
            onChange={v => setS6(p => ({ ...p, scr: v }))}
            unit="µmol/L"
            min={0}
            max={2000}
            tooltip="Leave empty if kidney function unknown"
          />
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="kidney-unknown"
                checked={s6.kidneyUnknown}
                onCheckedChange={v => setS6(p => ({ ...p, kidneyUnknown: !!v, scr: !!v ? '' : p.scr }))}
              />
              <Label htmlFor="kidney-unknown" className="text-sm cursor-pointer">
                Kidney function is unknown, but not presumed to be impaired
              </Label>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Septic shock or requires intensive care support?</Label>
              <RadioGroup value={s6.septic} onValueChange={v => setS6(p => ({ ...p, septic: v }))} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="septic-no" />
                  <Label htmlFor="septic-no" className="text-sm cursor-pointer">No</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="septic-yes" />
                  <Label htmlFor="septic-yes" className="text-sm cursor-pointer">Yes</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CalcSection>

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
