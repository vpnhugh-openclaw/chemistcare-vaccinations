import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, XCircle, ArrowLeft, ArrowRight, Calendar, Shield } from 'lucide-react';
import { TriageFormData, TriageService, SERVICE_INFO, UTI_SYMPTOMS } from '@/types/triage';
import { evaluateTriage, TriageResult } from '@/lib/triageEngine';

type TriageStep = 'service' | 'eligibility' | 'result' | 'booking';

export default function PatientTriage() {
  const [step, setStep] = useState<TriageStep>('service');
  const [formData, setFormData] = useState<TriageFormData>({ service: null });
  const [result, setResult] = useState<TriageResult | null>(null);

  const update = useCallback((patch: Partial<TriageFormData>) => setFormData(prev => ({ ...prev, ...patch })), []);

  const handleEvaluate = () => {
    const r = evaluateTriage(formData);
    setResult(r);
    setStep('result');
  };

  const statusColor = (s: TriageResult['status']) => {
    switch (s) {
      case 'eligible': return 'hsl(var(--clinical-safe))';
      case 'ineligible': return 'hsl(var(--clinical-danger))';
      case 'warning': return 'hsl(var(--clinical-warning))';
    }
  };

  const StatusIcon = ({ status }: { status: TriageResult['status'] }) => {
    switch (status) {
      case 'eligible': return <CheckCircle className="h-6 w-6" style={{ color: statusColor('eligible') }} />;
      case 'ineligible': return <XCircle className="h-6 w-6" style={{ color: statusColor('ineligible') }} />;
      case 'warning': return <AlertCircle className="h-6 w-6" style={{ color: statusColor('warning') }} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Public header */}
      <header className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Shield className="h-6 w-6 text-accent" />
          <div>
            <h1 className="text-lg font-bold">ChemistCare PrescriberOS</h1>
            <p className="text-xs text-muted-foreground">Victorian Community Pharmacist Prescribing Program</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(['service', 'eligibility', 'result', 'booking'] as TriageStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`step-indicator text-xs ${step === s ? 'step-active' : i < ['service', 'eligibility', 'result', 'booking'].indexOf(step) ? 'step-complete' : 'step-pending'}`}>
                {i + 1}
              </div>
              {i < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
          <span className="ml-3 text-sm text-muted-foreground capitalize">{step === 'service' ? 'Select Service' : step === 'eligibility' ? 'Check Eligibility' : step === 'result' ? 'Result' : 'Book Appointment'}</span>
        </div>

        {/* Step: Service Selection */}
        {step === 'service' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select a Service</h2>
            <p className="text-sm text-muted-foreground">Choose the clinical service you need. We'll check your eligibility based on Victorian prescribing protocols.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.entries(SERVICE_INFO) as [TriageService, typeof SERVICE_INFO['uti']][]).map(([key, info]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all hover:border-accent ${formData.service === key ? 'border-accent ring-2 ring-accent/20' : ''}`}
                  onClick={() => update({ service: key })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{info.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button disabled={!formData.service} onClick={() => setStep('eligibility')}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Eligibility Questions */}
        {step === 'eligibility' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('service')}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <h2 className="text-xl font-semibold">{SERVICE_INFO[formData.service!].label} — Eligibility Check</h2>
            </div>

            <Card>
              <CardContent className="p-6 space-y-5">
                {/* UTI questions */}
                {formData.service === 'uti' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Sex assigned at birth *</Label>
                      <RadioGroup value={formData.sex || ''} onValueChange={(v) => update({ sex: v as 'male' | 'female' })}>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2"><RadioGroupItem value="female" id="female" /><Label htmlFor="female">Female</Label></div>
                          <div className="flex items-center gap-2"><RadioGroupItem value="male" id="male" /><Label htmlFor="male">Male</Label></div>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-semibold text-foreground">Age *</Label>
                      <Input id="age" type="number" min={0} max={120} placeholder="Enter your age" value={formData.age ?? ''} onChange={(e) => update({ age: e.target.value ? Number(e.target.value) : undefined })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Current symptoms (select all that apply) *</Label>
                      <div className="space-y-2">
                        {UTI_SYMPTOMS.map(s => (
                          <div key={s.id} className="flex items-center gap-2">
                            <Checkbox
                              id={s.id}
                              checked={(formData.utiSymptoms || []).includes(s.id)}
                              onCheckedChange={(checked) => {
                                const current = formData.utiSymptoms || [];
                                update({ utiSymptoms: checked ? [...current, s.id] : current.filter(x => x !== s.id) });
                              }}
                            />
                            <Label htmlFor={s.id} className="text-sm">{s.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Contraception questions */}
                {formData.service === 'contraception' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-semibold text-foreground">Age *</Label>
                      <Input id="age" type="number" min={0} max={120} placeholder="Enter your age" value={formData.age ?? ''} onChange={(e) => update({ age: e.target.value ? Number(e.target.value) : undefined })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gpReview" className="text-sm font-semibold text-foreground">Date of last GP review for contraception *</Label>
                      <Input id="gpReview" type="date" value={formData.lastGpReviewDate || ''} onChange={(e) => update({ lastGpReviewDate: e.target.value })} />
                    </div>
                  </>
                )}

                {/* Shingles questions */}
                {formData.service === 'shingles' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="rashHours" className="text-sm font-semibold text-foreground">Hours since rash first appeared *</Label>
                      <Input id="rashHours" type="number" min={0} placeholder="e.g. 24" value={formData.hoursSinceRash ?? ''} onChange={(e) => update({ hoursSinceRash: e.target.value ? Number(e.target.value) : undefined })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Are you immunocompetent (normal immune system)? *</Label>
                      <RadioGroup value={formData.isImmunocompetent === undefined ? '' : formData.isImmunocompetent ? 'yes' : 'no'} onValueChange={(v) => update({ isImmunocompetent: v === 'yes' })}>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="ic-yes" /><Label htmlFor="ic-yes">Yes</Label></div>
                          <div className="flex items-center gap-2"><RadioGroupItem value="no" id="ic-no" /><Label htmlFor="ic-no">No / Unsure</Label></div>
                        </div>
                      </RadioGroup>
                    </div>
                  </>
                )}

                {/* Psoriasis / Vaccines – direct pass */}
                {(formData.service === 'psoriasis' || formData.service === 'vaccines') && (
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-semibold text-foreground">Age *</Label>
                    <Input id="age" type="number" min={0} max={120} placeholder="Enter your age" value={formData.age ?? ''} onChange={(e) => update({ age: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleEvaluate}>Check Eligibility <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {/* Step: Result */}
        {step === 'result' && result && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('eligibility')}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <h2 className="text-xl font-semibold">Eligibility Result</h2>
            </div>

            <Card className="border-2" style={{ borderColor: statusColor(result.status) }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <StatusIcon status={result.status} />
                  <div className="space-y-1">
                    <p className="font-semibold text-base" style={{ color: statusColor(result.status) }}>
                      {result.status === 'eligible' ? 'Eligible' : result.status === 'ineligible' ? 'Not Eligible' : 'Further Review Needed'}
                    </p>
                    <p className="text-sm text-foreground">{result.message}</p>
                    {result.details && <p className="text-xs text-muted-foreground mt-2">{result.details}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.eligible && (
              <div className="flex justify-end">
                <Button onClick={() => setStep('booking')}>
                  Book Appointment <Calendar className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {!result.eligible && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">If you believe this result is incorrect, please contact your local pharmacy directly or book a GP appointment for further assessment.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step: Booking */}
        {step === 'booking' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('result')}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <h2 className="text-xl font-semibold">Pre-Consultation Details</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Appointment Information</CardTitle>
                <CardDescription>Provide your details so the pharmacist can prepare for your consultation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prefDate" className="text-sm font-semibold text-foreground">Preferred date</Label>
                    <Input id="prefDate" type="date" value={formData.preferredDate || ''} onChange={(e) => update({ preferredDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prefTime" className="text-sm font-semibold text-foreground">Preferred time</Label>
                    <Select value={formData.preferredTime || ''} onValueChange={(v) => update({ preferredTime: v })}>
                      <SelectTrigger id="prefTime"><SelectValue placeholder="Select time" /></SelectTrigger>
                      <SelectContent>
                        {['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meds" className="text-sm font-semibold text-foreground">Current medications</Label>
                  <Textarea id="meds" placeholder="List any medications you are currently taking" value={formData.currentMedications || ''} onChange={(e) => update({ currentMedications: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-sm font-semibold text-foreground">Known allergies</Label>
                  <Textarea id="allergies" placeholder="List any known allergies" value={formData.allergies || ''} onChange={(e) => update({ allergies: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => alert('Booking confirmed! (Demo)')}>
                <CheckCircle className="mr-2 h-4 w-4" /> Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
