import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { EightCpaServiceType } from "@/types/eightCpa";

interface ClinicalData {
  lifestyle_smoking_status: string;
  lifestyle_alcohol_use: string;
  lifestyle_diet_notes: string;
  lifestyle_activity_notes: string;
  clinical_bp_systolic: string;
  clinical_bp_diastolic: string;
  clinical_bp_date: string;
  clinical_weight: string;
  clinical_height: string;
  clinical_bmi: string;
  clinical_pulse: string;
  diabetes_bgl_readings_summary: string;
  diabetes_hba1c_value: string;
  diabetes_hba1c_date: string;
  monitoring_device_used: string;
  allergies_adverse_reactions: string;
  underlying_medical_conditions: string;
}

interface Props {
  serviceType: EightCpaServiceType;
  data: ClinicalData;
  onChange: (data: Partial<ClinicalData>) => void;
}

export function LifestyleHealthSection({ serviceType, data, onChange }: Props) {
  const [lifestyleOpen, setLifestyleOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);

  // Auto-calc BMI
  const calcBmi = (weight: string, height: string) => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1);
    return '';
  };

  return (
    <div className="space-y-4">
      <Collapsible open={lifestyleOpen} onOpenChange={setLifestyleOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-base flex items-center justify-between">
                Lifestyle Screening <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${lifestyleOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Smoking Status</Label>
                <Select value={data.lifestyle_smoking_status} onValueChange={(v) => onChange({ lifestyle_smoking_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEVER">Never smoked</SelectItem>
                    <SelectItem value="FORMER">Former smoker</SelectItem>
                    <SelectItem value="CURRENT">Current smoker</SelectItem>
                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Alcohol Use</Label>
                <Select value={data.lifestyle_alcohol_use} onValueChange={(v) => onChange({ lifestyle_alcohol_use: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MODERATE">Moderate</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Diet Notes</Label>
                <Textarea value={data.lifestyle_diet_notes} onChange={(e) => onChange({ lifestyle_diet_notes: e.target.value })} rows={2} placeholder="Any relevant dietary info" />
              </div>
              <div>
                <Label>Physical Activity Notes</Label>
                <Textarea value={data.lifestyle_activity_notes} onChange={(e) => onChange({ lifestyle_activity_notes: e.target.value })} rows={2} placeholder="Exercise frequency, type" />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={healthOpen} onOpenChange={setHealthOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-base flex items-center justify-between">
                Health Check <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${healthOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Systolic BP (mmHg)</Label>
                  <Input type="number" value={data.clinical_bp_systolic} onChange={(e) => onChange({ clinical_bp_systolic: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Diastolic BP (mmHg)</Label>
                  <Input type="number" value={data.clinical_bp_diastolic} onChange={(e) => onChange({ clinical_bp_diastolic: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">BP Date</Label>
                  <Input type="date" value={data.clinical_bp_date} onChange={(e) => onChange({ clinical_bp_date: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Pulse (bpm)</Label>
                  <Input type="number" value={data.clinical_pulse} onChange={(e) => onChange({ clinical_pulse: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Weight (kg)</Label>
                  <Input type="number" value={data.clinical_weight} onChange={(e) => {
                    onChange({ clinical_weight: e.target.value, clinical_bmi: calcBmi(e.target.value, data.clinical_height) });
                  }} />
                </div>
                <div>
                  <Label className="text-xs">Height (cm)</Label>
                  <Input type="number" value={data.clinical_height} onChange={(e) => {
                    onChange({ clinical_height: e.target.value, clinical_bmi: calcBmi(data.clinical_weight, e.target.value) });
                  }} />
                </div>
                <div>
                  <Label className="text-xs">BMI</Label>
                  <Input value={data.clinical_bmi} readOnly className="bg-muted" />
                </div>
              </div>

              {serviceType === 'DIABETES_MEDSCHECK' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
                  <div>
                    <Label className="text-xs">HbA1c (%)</Label>
                    <Input type="number" step="0.1" value={data.diabetes_hba1c_value} onChange={(e) => onChange({ diabetes_hba1c_value: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">HbA1c Date</Label>
                    <Input type="date" value={data.diabetes_hba1c_date} onChange={(e) => onChange({ diabetes_hba1c_date: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">BGL Monitoring Device</Label>
                    <Input value={data.monitoring_device_used} onChange={(e) => onChange({ monitoring_device_used: e.target.value })} placeholder="Brand/model" />
                  </div>
                  <div className="col-span-full">
                    <Label className="text-xs">BGL Readings Summary</Label>
                    <Textarea value={data.diabetes_bgl_readings_summary} onChange={(e) => onChange({ diabetes_bgl_readings_summary: e.target.value })} rows={2} placeholder="Recent BGL readings, patterns, etc." />
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allergies & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Allergies / Adverse Drug Reactions</Label>
            <Textarea value={data.allergies_adverse_reactions} onChange={(e) => onChange({ allergies_adverse_reactions: e.target.value })} rows={3} placeholder="List known allergies and adverse drug reactions (e.g. Penicillin – rash, Codeine – nausea)" />
          </div>
          <div>
            <Label>Underlying Medical Conditions</Label>
            <Textarea value={data.underlying_medical_conditions} onChange={(e) => onChange({ underlying_medical_conditions: e.target.value })} rows={3} placeholder="List current medical conditions (e.g. Type 2 Diabetes, Hypertension, Osteoarthritis)" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
