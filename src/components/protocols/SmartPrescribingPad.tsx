import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Pill } from 'lucide-react';
import { ClinicalAlert } from './ClinicalAlert';
import type { PrescribingOption, ProtocolAlert } from '@/types/protocols';

interface SmartPrescribingPadProps {
  options: PrescribingOption[];
  onSelect: (option: PrescribingOption) => void;
  title?: string;
}

export function SmartPrescribingPad({ options, onSelect, title = 'Prescribing Pad' }: SmartPrescribingPadProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [safetyCheckAnswers, setSafetyCheckAnswers] = useState<Record<string, boolean>>({});
  const [safetyAlert, setSafetyAlert] = useState<ProtocolAlert | null>(null);

  const selected = options.find(o => o.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSafetyCheckAnswers({});
    setSafetyAlert(null);
  };

  const handleSafetyAnswer = (question: string, answer: boolean, check: PrescribingOption['safetyChecks'][number]) => {
    setSafetyCheckAnswers(prev => ({ ...prev, [question]: answer }));
    if (answer === check.blockIf) {
      setSafetyAlert({ level: 'red', title: 'Prescription Blocked', message: check.blockMessage, blocksPrescribing: true });
    } else {
      setSafetyAlert(null);
    }
  };

  const lineColor = (line: string) => {
    switch (line) {
      case 'first': return 'clinical-badge-safe';
      case 'second': return 'clinical-badge-warning';
      case 'third': return 'clinical-badge-danger';
      default: return 'clinical-badge-info';
    }
  };

  const canPrescribe = selected && !safetyAlert?.blocksPrescribing &&
    (!selected.safetyChecks || selected.safetyChecks.every(c => safetyCheckAnswers[c.question] !== undefined));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Pill className="h-4 w-4 text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Select medication</Label>
          <Select value={selectedId} onValueChange={handleSelect}>
            <SelectTrigger><SelectValue placeholder="Choose a medication..." /></SelectTrigger>
            <SelectContent>
              {options.map(o => (
                <SelectItem key={o.id} value={o.id}>
                  <span className="flex items-center gap-2">
                    {o.name}
                    <span className={`clinical-badge ${lineColor(o.line)} text-[0.625rem]`}>{o.line}-line</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-muted-foreground block">Dose</span><span className="font-medium">{selected.dose}</span></div>
              <div><span className="text-xs text-muted-foreground block">Frequency</span><span className="font-medium">{selected.frequency}</span></div>
              <div><span className="text-xs text-muted-foreground block">Duration</span><span className="font-medium">{selected.duration}</span></div>
              <div><span className="text-xs text-muted-foreground block">Line</span><Badge variant="outline" className="capitalize">{selected.line}-line</Badge></div>
            </div>
            {selected.notes && (
              <p className="text-xs text-muted-foreground border-t pt-2">{selected.notes}</p>
            )}

            {/* Safety checks */}
            {selected.safetyChecks?.map(check => (
              <div key={check.question} className="border-t pt-3 space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" style={{ color: 'hsl(var(--clinical-warning))' }} />
                  {check.question}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant={safetyCheckAnswers[check.question] === true ? 'destructive' : 'outline'} onClick={() => handleSafetyAnswer(check.question, true, check)}>Yes</Button>
                  <Button size="sm" variant={safetyCheckAnswers[check.question] === false ? 'default' : 'outline'} onClick={() => handleSafetyAnswer(check.question, false, check)}>No</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {safetyAlert && <ClinicalAlert alert={safetyAlert} />}

        {canPrescribe && !safetyAlert?.blocksPrescribing && (
          <Button className="w-full" onClick={() => selected && onSelect(selected)}>
            <CheckCircle className="mr-2 h-4 w-4" /> Confirm Prescription
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
