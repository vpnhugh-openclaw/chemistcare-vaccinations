import { useState } from 'react';
import { CalcSection, NumField, DetailResult, ResultRow, ResultAdvice, ResultNote } from './shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function getRiskGroup(mmrc: number, cat: number, exacerbations: number): { group: string; advice: string } {
  const highSymptoms = mmrc >= 2 || cat >= 10;
  const highExac = exacerbations >= 2;

  if (!highSymptoms && !highExac) return {
    group: 'Group A — Low risk, fewer symptoms',
    advice: 'SABA or SAMA PRN. Smoking cessation. Annual influenza + pneumococcal vaccination. Pulmonary rehabilitation if dyspnoeic.',
  };
  if (highSymptoms && !highExac) return {
    group: 'Group B — Low risk, more symptoms',
    advice: 'LABA or LAMA as maintenance. Consider LABA + LAMA if persistent dyspnoea. Pulmonary rehabilitation. Smoking cessation.',
  };
  if (!highSymptoms && highExac) return {
    group: 'Group C — High risk, fewer symptoms',
    advice: 'LAMA preferred. Consider LAMA + LABA if further exacerbations. ICS + LABA if eosinophils ≥300. Review every 3 months.',
  };
  return {
    group: 'Group D — High risk, more symptoms',
    advice: 'LAMA + LABA first-line. Escalate to LAMA + LABA + ICS if exacerbations continue and eosinophils ≥100. Consider roflumilast or azithromycin prophylaxis. Specialist referral if ≥3 exacerbations/year.',
  };
}

export function COPDRiskCalculator() {
  const [s, setS] = useState({ mmrc: '1', cat: '', exac: '0' });
  const [r, setR] = useState<{ group: string; advice: string } | null>(null);
  const clear = () => { setS({ mmrc: '1', cat: '', exac: '0' }); setR(null); };
  const calc = () => {
    const cat = Number(s.cat);
    if (cat >= 0) setR(getRiskGroup(Number(s.mmrc), cat, Number(s.exac)));
  };

  return (
    <CalcSection
      title="COPD Exacerbation Risk (GOLD ABCD)"
      disclaimer="GOLD 2023 ABCD assessment tool. Combines symptom burden (mMRC/CAT) with exacerbation history to guide pharmacotherapy escalation."
      onClear={clear}
      onCalc={calc}
      result={r ? (
        <DetailResult>
          <ResultRow label="Risk Group" value={r.group} />
          <ResultAdvice>{r.advice}</ResultAdvice>
          <ResultNote>GOLD 2023 ABCD assessment. mMRC ≥2 or CAT ≥10 = more symptoms. ≥2 exacerbations/year = high risk.</ResultNote>
        </DetailResult>
      ) : null}
    >
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">mMRC Dyspnoea Grade</Label>
        <Select value={s.mmrc} onValueChange={v => setS(p => ({ ...p, mmrc: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0 — Breathless with strenuous exercise only</SelectItem>
            <SelectItem value="1">1 — Breathless when hurrying or walking up slight hill</SelectItem>
            <SelectItem value="2">2 — Walks slower than people of same age due to breathlessness</SelectItem>
            <SelectItem value="3">3 — Stops for breath after 100m or few minutes on level</SelectItem>
            <SelectItem value="4">4 — Too breathless to leave house or breathless dressing</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <NumField label="CAT Score" value={s.cat} onChange={v => setS(p => ({ ...p, cat: v }))} unit="/40" min={-1} max={40} tooltip="COPD Assessment Test (0–40)" />
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Exacerbations in past 12 months</Label>
        <Select value={s.exac} onValueChange={v => setS(p => ({ ...p, exac: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0</SelectItem>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3+</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CalcSection>
  );
}
