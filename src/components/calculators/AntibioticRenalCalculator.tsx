import { useState } from 'react';
import { CalcSection, NumField, DetailResult, ResultRow, ResultAdvice, ResultNote } from './shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DosingResult { dose: string; interval: string; notes: string }

function getGentamicinDose(crcl: number): DosingResult {
  if (crcl >= 60) return { dose: '5–7 mg/kg', interval: 'q24h', notes: 'Standard once-daily dosing. Monitor trough levels (<1 mg/L). Adjust based on levels after 2nd dose.' };
  if (crcl >= 40) return { dose: '5–7 mg/kg', interval: 'q36h', notes: 'Extended interval. Monitor trough levels. Consider therapeutic drug monitoring.' };
  if (crcl >= 20) return { dose: '5–7 mg/kg', interval: 'q48h', notes: 'Significantly extended interval. Mandatory TDM. Consider alternative antibiotic if possible.' };
  return { dose: 'Seek specialist advice', interval: 'N/A', notes: 'CrCl <20: Avoid if possible. If essential, dose by TDM only. Infectious diseases consult recommended.' };
}

function getAmoxicillinDose(crcl: number, indication: string): DosingResult {
  const isOtitis = indication === 'otitis';
  if (crcl >= 30) {
    return {
      dose: isOtitis ? '500 mg' : '500 mg',
      interval: 'q8h',
      notes: `No adjustment required (CrCl ≥30). ${isOtitis ? 'Acute otitis media: 5-day course.' : 'Impetigo: 5–7 day course.'}`,
    };
  }
  if (crcl >= 15) {
    return {
      dose: '500 mg',
      interval: 'q12h',
      notes: 'Moderate renal impairment: Extend interval to 12-hourly. Monitor for adverse effects.',
    };
  }
  return {
    dose: '500 mg',
    interval: 'q24h',
    notes: 'Severe renal impairment: Once daily dosing. Consider alternative if not responding.',
  };
}

function getClindamycinDose(crcl: number, indication: string): DosingResult {
  return {
    dose: indication === 'otitis' ? '300 mg' : '450 mg',
    interval: 'q8h',
    notes: `Clindamycin does NOT require renal dose adjustment (hepatic elimination). ${indication === 'otitis' ? 'Use for penicillin-allergic patients. 7-day course.' : 'Impetigo: 7-day course. Consider for MRSA-suspected cases.'}`,
  };
}

function getDose(antibiotic: string, crcl: number, indication: string): DosingResult {
  switch (antibiotic) {
    case 'gentamicin': return getGentamicinDose(crcl);
    case 'amoxicillin': return getAmoxicillinDose(crcl, indication);
    case 'clindamycin': return getClindamycinDose(crcl, indication);
    default: return { dose: 'N/A', interval: 'N/A', notes: 'Select an antibiotic' };
  }
}

export function AntibioticRenalCalculator() {
  const [s, setS] = useState({ antibiotic: 'gentamicin', crcl: '', indication: 'otitis' });
  const [r, setR] = useState<DosingResult | null>(null);
  const clear = () => { setS({ antibiotic: 'gentamicin', crcl: '', indication: 'otitis' }); setR(null); };
  const calc = () => {
    const c = Number(s.crcl);
    if (c > 0) setR(getDose(s.antibiotic, c, s.indication));
  };

  return (
    <CalcSection
      title="Antibiotic Renal Dose Adjustment"
      disclaimer="Renal dose adjustments based on AMH and TG Anti-infectives. Select antibiotic, enter CrCl, and choose indication. Clindamycin does not require renal adjustment."
      onClear={clear}
      onCalc={calc}
      result={r ? (
        <DetailResult>
          <ResultRow label="Dose" value={r.dose} />
          <ResultRow label="Interval" value={r.interval} />
          <ResultAdvice>{r.notes}</ResultAdvice>
          <ResultNote>AMH / TG Anti-infectives. Gentamicin: once-daily dosing with TDM. Amoxicillin: adjust interval. Clindamycin: no renal adjustment.</ResultNote>
        </DetailResult>
      ) : null}
    >
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Antibiotic</Label>
        <Select value={s.antibiotic} onValueChange={v => setS(p => ({ ...p, antibiotic: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="gentamicin">Gentamicin</SelectItem>
            <SelectItem value="amoxicillin">Amoxicillin</SelectItem>
            <SelectItem value="clindamycin">Clindamycin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Indication</Label>
        <Select value={s.indication} onValueChange={v => setS(p => ({ ...p, indication: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="otitis">Acute otitis media</SelectItem>
            <SelectItem value="impetigo">Impetigo / skin infection</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <NumField label="CrCl" value={s.crcl} onChange={v => setS(p => ({ ...p, crcl: v }))} unit="mL/min" min={0} max={200} />
    </CalcSection>
  );
}
