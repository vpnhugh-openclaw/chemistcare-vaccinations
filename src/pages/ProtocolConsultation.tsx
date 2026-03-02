import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, FileText, Send, Bell } from 'lucide-react';
import { ProtocolBanner } from '@/components/protocols/ProtocolBanner';
import { ClinicalAlert } from '@/components/protocols/ClinicalAlert';
import { SmartPrescribingPad } from '@/components/protocols/SmartPrescribingPad';
import { PasiCalculator } from '@/components/protocols/PasiCalculator';
import { UTI_PRESCRIBING, SHINGLES_PRESCRIBING, CONTRACEPTION_PRESCRIBING } from '@/types/protocols';
import type { ProtocolAlert, PrescribingOption } from '@/types/protocols';

type WizardStep = 'assessment' | 'clinical' | 'prescribing' | 'documentation';
const STEPS: WizardStep[] = ['assessment', 'clinical', 'prescribing', 'documentation'];
const STEP_LABELS: Record<WizardStep, string> = { assessment: 'Assessment', clinical: 'Clinical Checks', prescribing: 'Prescribing', documentation: 'Documentation' };

const PROTOCOL_META: Record<string, { name: string; version: string; effective: string; url?: string }> = {
  uti: { name: 'UTI Prescribing Protocol', version: '1.2', effective: '1 Jan 2024 – 31 Dec 2025', url: 'https://www.health.vic.gov.au/pharmacist-prescribing' },
  shingles: { name: 'Herpes Zoster Protocol', version: '1.1', effective: '1 Jan 2024 – 31 Dec 2025', url: 'https://www.health.vic.gov.au/pharmacist-prescribing' },
  contraception: { name: 'Contraception Resupply Protocol', version: '1.0', effective: '1 Jan 2024 – 31 Dec 2025', url: 'https://www.health.vic.gov.au/pharmacist-prescribing' },
  psoriasis: { name: 'Psoriasis Management Protocol', version: '1.0', effective: '1 Jan 2024 – 31 Dec 2025' },
};

export default function ProtocolConsultation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const service = searchParams.get('service') || 'uti';
  const meta = PROTOCOL_META[service] || PROTOCOL_META.uti;

  const [step, setStep] = useState<WizardStep>('assessment');
  const [alerts, setAlerts] = useState<ProtocolAlert[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedRx, setSelectedRx] = useState<PrescribingOption | null>(null);
  const [boolChecks, setBoolChecks] = useState<Record<string, boolean>>({});

  const update = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));
  const toggleCheck = (key: string, val: boolean) => {
    setBoolChecks(prev => ({ ...prev, [key]: val }));
  };

  const currentIdx = STEPS.indexOf(step);
  const prescribingBlocked = alerts.some(a => a.blocksPrescribing);

  // Shingles: Hutchinson sign check
  const evaluateShinglesAssessment = () => {
    const newAlerts: ProtocolAlert[] = [];
    if (boolChecks['hutchinson']) {
      newAlerts.push({ level: 'red', title: "Hutchinson's Sign Detected", message: 'Rash affecting the eye or tip of nose. Immediate referral to ED/Ophthalmologist required.', action: 'Stop prescribing. Arrange urgent referral.', blocksPrescribing: true });
    }
    if (boolChecks['immunocompromised']) {
      newAlerts.push({ level: 'amber', title: 'Immunocompromised Patient', message: 'Extended antiviral course required (e.g. Famciclovir 10 days instead of 7).', action: 'Adjust duration in prescribing step.' });
    }
    if (newAlerts.length === 0) {
      newAlerts.push({ level: 'green', title: 'No Red Flags', message: 'No contraindications to pharmacist prescribing identified.' });
    }
    setAlerts(newAlerts);
  };

  // Contraception: BMI check
  const evaluateContraceptionAssessment = () => {
    const newAlerts: ProtocolAlert[] = [];
    const w = parseFloat(formData.weight || '0');
    const h = parseFloat(formData.height || '0');
    if (w > 0 && h > 0) {
      const bmi = w / ((h / 100) ** 2);
      if (bmi > 35) {
        newAlerts.push({ level: 'amber', title: 'Elevated BMI', message: `BMI ${bmi.toFixed(1)} > 35. Increased VTE risk with combined hormonal contraception.`, action: 'Refer to GP for risk assessment.' });
      } else {
        newAlerts.push({ level: 'green', title: 'BMI Acceptable', message: `BMI ${bmi.toFixed(1)} — within acceptable range.` });
      }
    }
    setAlerts(newAlerts);
  };

  const handleNextFromAssessment = () => {
    if (service === 'shingles') evaluateShinglesAssessment();
    else if (service === 'contraception') evaluateContraceptionAssessment();
    else setAlerts([{ level: 'green', title: 'Assessment Complete', message: 'No contraindications identified.' }]);
    setStep('clinical');
  };

  const handlePrescribe = (rx: PrescribingOption) => {
    setSelectedRx(rx);
    setStep('documentation');
  };

  const generateSoapNote = () => {
    const lines = [
      `SOAP Note — ${meta.name}`,
      `Date: ${new Date().toLocaleDateString('en-AU')}`,
      `Protocol: ${meta.name} v${meta.version}`,
      '',
      'S (Subjective):',
      formData.subjective || 'N/A',
      '',
      'O (Objective):',
      formData.objective || 'N/A',
      '',
      'A (Assessment):',
      alerts.map(a => `[${a.level.toUpperCase()}] ${a.title}: ${a.message}`).join('\n') || 'No alerts.',
      '',
      'P (Plan):',
      selectedRx ? `Prescribed: ${selectedRx.name} ${selectedRx.dose} ${selectedRx.frequency} for ${selectedRx.duration}` : 'No prescription issued.',
      formData.plan || '',
    ];
    return lines.join('\n');
  };

  return (
    <ClinicalLayout>
      <div className="p-4 lg:p-6 space-y-4 max-w-4xl">
        <ProtocolBanner name={meta.name} version={meta.version} jurisdiction="Victoria" effectiveDate={meta.effective} sourceUrl={meta.url} />

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => !prescribingBlocked && setStep(s)}
                disabled={prescribingBlocked && i > currentIdx}
                className={`step-indicator text-xs ${step === s ? 'step-active' : i < currentIdx ? 'step-complete' : prescribingBlocked && i > currentIdx ? 'step-blocked' : 'step-pending'}`}
              >
                {i + 1}
              </button>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
          <span className="ml-3 text-sm font-medium">{STEP_LABELS[step]}</span>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && step !== 'assessment' && (
          <div className="space-y-2">
            {alerts.map((a, i) => <ClinicalAlert key={i} alert={a} />)}
          </div>
        )}

        {/* ASSESSMENT step */}
        {step === 'assessment' && (
          <Card>
            <CardHeader><CardTitle className="text-base">Clinical Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Subjective (patient history)</Label>
                <Textarea placeholder="Chief complaint, HPI, symptoms..." value={formData.subjective || ''} onChange={e => update('subjective', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Objective (examination findings)</Label>
                <Textarea placeholder="Vital signs, examination findings..." value={formData.objective || ''} onChange={e => update('objective', e.target.value)} rows={3} />
              </div>

              {/* Service-specific checks */}
              {service === 'shingles' && (
                <div className="space-y-3 border-t pt-3">
                  <p className="text-sm font-semibold">Red Flag Screening</p>
                  <div className="flex items-center gap-2">
                    <Checkbox id="hutchinson" checked={boolChecks['hutchinson'] || false} onCheckedChange={(v) => toggleCheck('hutchinson', !!v)} />
                    <Label htmlFor="hutchinson" className="text-sm">Rash affecting the eye or tip of the nose (Hutchinson's sign)?</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="immunocompromised" checked={boolChecks['immunocompromised'] || false} onCheckedChange={(v) => toggleCheck('immunocompromised', !!v)} />
                    <Label htmlFor="immunocompromised" className="text-sm">Is the patient immunocompromised?</Label>
                  </div>
                </div>
              )}

              {service === 'contraception' && (
                <div className="space-y-3 border-t pt-3">
                  <p className="text-sm font-semibold">BMI Assessment</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Weight (kg)</Label>
                      <Input type="number" placeholder="e.g. 70" value={formData.weight || ''} onChange={e => update('weight', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Height (cm)</Label>
                      <Input type="number" placeholder="e.g. 165" value={formData.height || ''} onChange={e => update('height', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {service === 'psoriasis' && <PasiCalculator />}

              <div className="flex justify-end pt-2">
                <Button onClick={handleNextFromAssessment}>Continue to Clinical Checks <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CLINICAL step */}
        {step === 'clinical' && (
          <Card>
            <CardHeader><CardTitle className="text-base">Clinical Checks & Safety</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Allergies / Adverse Reactions</Label>
                <Textarea placeholder="Document known allergies..." value={formData.allergies || ''} onChange={e => update('allergies', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Current Medications</Label>
                <Textarea placeholder="List current medications..." value={formData.medications || ''} onChange={e => update('medications', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Contraindications / Interactions Check</Label>
                <Textarea placeholder="Document any contraindications or interactions identified..." value={formData.interactions || ''} onChange={e => update('interactions', e.target.value)} rows={2} />
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep('assessment')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button disabled={prescribingBlocked} onClick={() => setStep('prescribing')}>
                  {prescribingBlocked ? 'Prescribing Blocked' : 'Continue to Prescribing'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PRESCRIBING step */}
        {step === 'prescribing' && !prescribingBlocked && (
          <div className="space-y-4">
            {service === 'uti' && <SmartPrescribingPad options={UTI_PRESCRIBING} onSelect={handlePrescribe} title="UTI Prescribing" />}
            {service === 'shingles' && <SmartPrescribingPad options={SHINGLES_PRESCRIBING} onSelect={handlePrescribe} title="Shingles Prescribing" />}
            {service === 'contraception' && <SmartPrescribingPad options={CONTRACEPTION_PRESCRIBING} onSelect={handlePrescribe} title="Contraception Resupply" />}
            {service === 'psoriasis' && (
              <Card><CardContent className="p-6 text-sm text-muted-foreground">Psoriasis topical therapy selection — coming soon. Use existing prescribing workflow.</CardContent></Card>
            )}
            <div className="flex justify-start">
              <Button variant="outline" onClick={() => setStep('clinical')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            </div>
          </div>
        )}

        {/* DOCUMENTATION step */}
        {step === 'documentation' && (
          <Card>
            <CardHeader><CardTitle className="text-base">Documentation & Outputs</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {selectedRx && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Prescribed Medication</p>
                  <p className="font-semibold">{selectedRx.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRx.dose} — {selectedRx.frequency} — {selectedRx.duration}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Safety-Net Counselling</Label>
                <Textarea placeholder="Document safety-net advice given to patient..." value={formData.safetyNet || ''} onChange={e => update('safetyNet', e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Plan / Follow-up</Label>
                <Textarea placeholder="Follow-up plan and additional notes..." value={formData.plan || ''} onChange={e => update('plan', e.target.value)} rows={2} />
              </div>

              {/* SOAP note preview */}
              <div className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Auto-Generated SOAP Note</p>
                <pre className="text-xs whitespace-pre-wrap font-mono text-foreground/80 leading-relaxed">{generateSoapNote()}</pre>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep('prescribing')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button variant="outline" onClick={() => alert('GP Report generated (demo)')}><Send className="mr-2 h-4 w-4" /> Email Report to GP</Button>
                <Button variant="outline" onClick={() => alert('Print script (demo)')}><FileText className="mr-2 h-4 w-4" /> Print Script</Button>
                {service === 'shingles' && (
                  <Button variant="outline" onClick={() => alert('Dept of Health notification (demo)')}><Bell className="mr-2 h-4 w-4" /> Notify Dept of Health</Button>
                )}
                <Button onClick={() => { alert('Consultation saved!'); navigate('/'); }}>Finalise Consultation</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ClinicalLayout>
  );
}
