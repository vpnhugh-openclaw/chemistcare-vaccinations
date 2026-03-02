import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ClinicalAlert } from './ClinicalAlert';
import type { ProtocolAlert } from '@/types/protocols';

interface BodyRegion {
  id: string;
  label: string;
  weight: number;
}

const REGIONS: BodyRegion[] = [
  { id: 'head', label: 'Head & Neck', weight: 0.1 },
  { id: 'trunk', label: 'Trunk', weight: 0.3 },
  { id: 'upper', label: 'Upper Limbs', weight: 0.2 },
  { id: 'lower', label: 'Lower Limbs', weight: 0.4 },
];

const AREA_SCORES = [
  { value: 0, label: '0%' },
  { value: 1, label: '<10%' },
  { value: 2, label: '10–29%' },
  { value: 3, label: '30–49%' },
  { value: 4, label: '50–69%' },
  { value: 5, label: '70–89%' },
  { value: 6, label: '90–100%' },
];

export function PasiCalculator() {
  const [scores, setScores] = useState<Record<string, { area: number; erythema: number; induration: number; desquamation: number }>>(() =>
    Object.fromEntries(REGIONS.map(r => [r.id, { area: 0, erythema: 0, induration: 0, desquamation: 0 }]))
  );

  const pasi = useMemo(() => {
    return REGIONS.reduce((total, region) => {
      const s = scores[region.id];
      return total + region.weight * s.area * (s.erythema + s.induration + s.desquamation);
    }, 0);
  }, [scores]);

  const updateScore = (regionId: string, field: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [regionId]: { ...prev[regionId], [field]: value },
    }));
  };

  const alert: ProtocolAlert | null = pasi > 10
    ? { level: 'red', title: 'Severe Psoriasis', message: `PASI score ${pasi.toFixed(1)} exceeds threshold. Specialist referral required.`, action: 'Refer to dermatologist.', blocksPrescribing: true }
    : pasi > 5
    ? { level: 'amber', title: 'Moderate Psoriasis', message: `PASI score ${pasi.toFixed(1)}. Consider step-up therapy or GP review.` }
    : pasi > 0
    ? { level: 'green', title: 'Mild Psoriasis', message: `PASI score ${pasi.toFixed(1)}. Suitable for pharmacist management.` }
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">PASI Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {REGIONS.map(region => (
          <div key={region.id} className="rounded-lg border p-3 space-y-3">
            <p className="text-sm font-semibold">{region.label} <span className="text-xs text-muted-foreground font-normal">(weight: {region.weight})</span></p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Area affected</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={scores[region.id].area}
                  onChange={(e) => updateScore(region.id, 'area', Number(e.target.value))}
                >
                  {AREA_SCORES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              {['erythema', 'induration', 'desquamation'].map(field => (
                <div key={field} className="space-y-1.5">
                  <Label className="text-xs capitalize">{field} (0–4)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      min={0}
                      max={4}
                      step={1}
                      value={[scores[region.id][field as keyof typeof scores[string]]]}
                      onValueChange={([v]) => updateScore(region.id, field, v)}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-4 text-right">{scores[region.id][field as keyof typeof scores[string]]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-lg bg-muted p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PASI Score</p>
          <p className="text-3xl font-bold tabular-nums">{pasi.toFixed(1)}</p>
        </div>

        {alert && <ClinicalAlert alert={alert} />}
      </CardContent>
    </Card>
  );
}
