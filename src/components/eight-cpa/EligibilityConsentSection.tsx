import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { EightCpaServiceType } from "@/types/eightCpa";

interface EligibilityData {
  is_medicare_or_dva_eligible: boolean;
  has_received_medscheck_hmr_rmmr_last_12m: boolean;
  is_living_in_community_setting: boolean;
  notes_on_residential_status: string;
  taking_5_or_more_prescription_medicines: boolean;
  recent_significant_medical_event: boolean;
  recent_significant_medical_event_details: string;
  high_risk_medicine_use: boolean;
  high_risk_medicine_details: string;
  recent_type2_diagnosis_last_12m: boolean;
  poorly_controlled_type2: boolean;
  barriers_to_timely_access_diabetes_services: string;
  pharmacist_declares_eligibility_met: boolean;
  pharmacist_eligibility_notes: string;
}

interface ConsentData {
  written_consent_obtained: boolean;
  consent_date: string;
  consent_signed_by: string;
  consent_comments: string;
  has_consent_pdf_attached: boolean;
}

interface Props {
  serviceType: EightCpaServiceType;
  eligibility: EligibilityData;
  consent: ConsentData;
  onEligibilityChange: (data: Partial<EligibilityData>) => void;
  onConsentChange: (data: Partial<ConsentData>) => void;
}

function EligibilityQuestion({ label, value, onChange, children }: { label: string; value: boolean; onChange: (v: boolean) => void; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b last:border-b-0">
      <Switch checked={value} onCheckedChange={onChange} className="mt-0.5" />
      <div className="flex-1">
        <Label className="mb-0 leading-snug">{label}</Label>
        {children}
      </div>
      {value ? <CheckCircle2 className="h-5 w-5 text-[hsl(var(--clinical-safe))] shrink-0" /> : <XCircle className="h-5 w-5 text-muted-foreground/40 shrink-0" />}
    </div>
  );
}

export function EligibilityConsentSection({ serviceType, eligibility, consent, onEligibilityChange, onConsentChange }: Props) {
  const isMedsCheck = serviceType === 'MEDSCHECK';
  const isDiabetes = serviceType === 'DIABETES_MEDSCHECK';

  // Auto-calculate eligibility
  const baseEligible = eligibility.is_medicare_or_dva_eligible && !eligibility.has_received_medscheck_hmr_rmmr_last_12m && eligibility.is_living_in_community_setting;
  
  const medsCheckCriteria = isMedsCheck ? (eligibility.taking_5_or_more_prescription_medicines || eligibility.recent_significant_medical_event || eligibility.high_risk_medicine_use) : true;
  const diabetesCriteria = isDiabetes ? (eligibility.recent_type2_diagnosis_last_12m || eligibility.poorly_controlled_type2 || (eligibility.barriers_to_timely_access_diabetes_services?.length > 0)) : true;
  
  const isEligible = baseEligible && (isMedsCheck ? medsCheckCriteria : diabetesCriteria);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Eligibility Assessment</CardTitle>
          <Badge variant={isEligible ? "default" : "destructive"} className={isEligible ? "clinical-badge-safe" : "clinical-badge-danger"}>
            {isEligible ? "Eligible" : "Not Eligible"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-xs text-muted-foreground mb-3">Answer each question based on the PPA Program Rules. All base criteria must be met.</p>
          
          <EligibilityQuestion label="Is the patient eligible for Medicare or DVA?" value={eligibility.is_medicare_or_dva_eligible} onChange={(v) => onEligibilityChange({ is_medicare_or_dva_eligible: v })} />
          
          <EligibilityQuestion label="Has the patient received a MedsCheck, Diabetes MedsCheck, HMR or RMMR in the last 12 months?" value={eligibility.has_received_medscheck_hmr_rmmr_last_12m} onChange={(v) => onEligibilityChange({ has_received_medscheck_hmr_rmmr_last_12m: v })}>
            {eligibility.has_received_medscheck_hmr_rmmr_last_12m && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Patient is NOT eligible if they have received one of these services in the last 12 months.</p>
            )}
          </EligibilityQuestion>
          
          <EligibilityQuestion label="Is the patient living at home in a community setting?" value={eligibility.is_living_in_community_setting} onChange={(v) => onEligibilityChange({ is_living_in_community_setting: v })}>
            {!eligibility.is_living_in_community_setting && (
              <div className="mt-1">
                <Input placeholder="Notes on residential status" value={eligibility.notes_on_residential_status} onChange={(e) => onEligibilityChange({ notes_on_residential_status: e.target.value })} className="text-xs" />
              </div>
            )}
          </EligibilityQuestion>

          {isMedsCheck && (
            <>
              <div className="pt-3 pb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">At least one of the following must be met:</p>
              </div>
              <EligibilityQuestion label="Patient is taking 5 or more regular prescription medicines" value={eligibility.taking_5_or_more_prescription_medicines} onChange={(v) => onEligibilityChange({ taking_5_or_more_prescription_medicines: v })} />
              <EligibilityQuestion label="Recent significant medical event" value={eligibility.recent_significant_medical_event} onChange={(v) => onEligibilityChange({ recent_significant_medical_event: v })}>
                {eligibility.recent_significant_medical_event && (
                  <Input placeholder="Describe the event" className="mt-1 text-xs" value={eligibility.recent_significant_medical_event_details} onChange={(e) => onEligibilityChange({ recent_significant_medical_event_details: e.target.value })} />
                )}
              </EligibilityQuestion>
              <EligibilityQuestion label="Taking a high-risk medicine (e.g. anticoagulants, insulin, opioids)" value={eligibility.high_risk_medicine_use} onChange={(v) => onEligibilityChange({ high_risk_medicine_use: v })}>
                {eligibility.high_risk_medicine_use && (
                  <Input placeholder="Specify high-risk medicine(s)" className="mt-1 text-xs" value={eligibility.high_risk_medicine_details} onChange={(e) => onEligibilityChange({ high_risk_medicine_details: e.target.value })} />
                )}
              </EligibilityQuestion>
            </>
          )}

          {isDiabetes && (
            <>
              <div className="pt-3 pb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Diabetes MedsCheck criteria (at least one):</p>
              </div>
              <EligibilityQuestion label="Recently diagnosed with Type 2 diabetes (within last 12 months)" value={eligibility.recent_type2_diagnosis_last_12m} onChange={(v) => onEligibilityChange({ recent_type2_diagnosis_last_12m: v })} />
              <EligibilityQuestion label="Poorly controlled Type 2 diabetes" value={eligibility.poorly_controlled_type2} onChange={(v) => onEligibilityChange({ poorly_controlled_type2: v })} />
              <div className="py-2">
                <Label className="text-sm">Barriers to timely access to diabetes services</Label>
                <Textarea placeholder="e.g. appointment availability, distance, transport, cost" value={eligibility.barriers_to_timely_access_diabetes_services} onChange={(e) => onEligibilityChange({ barriers_to_timely_access_diabetes_services: e.target.value })} className="text-xs mt-1" rows={2} />
              </div>
            </>
          )}

          <div className="pt-4 border-t mt-4">
            <EligibilityQuestion label="I declare that this patient meets the eligibility criteria for this program" value={eligibility.pharmacist_declares_eligibility_met} onChange={(v) => onEligibilityChange({ pharmacist_declares_eligibility_met: v })} />
            <div className="mt-2">
              <Label className="text-xs">Pharmacist notes on eligibility</Label>
              <Textarea value={eligibility.pharmacist_eligibility_notes} onChange={(e) => onEligibilityChange({ pharmacist_eligibility_notes: e.target.value })} rows={2} className="text-xs" placeholder="Any additional notes" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Consent
            {!consent.written_consent_obtained && <Badge variant="outline" className="clinical-badge-warning text-xs">Required</Badge>}
            {consent.written_consent_obtained && !consent.has_consent_pdf_attached && <Badge variant="outline" className="clinical-badge-warning text-xs">Consent PDF missing</Badge>}
            {consent.written_consent_obtained && consent.has_consent_pdf_attached && <Badge className="clinical-badge-safe text-xs">Complete</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <EligibilityQuestion label="Written consent obtained from patient/carer" value={consent.written_consent_obtained} onChange={(v) => onConsentChange({ written_consent_obtained: v })} />
          {consent.written_consent_obtained && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Consent Date</Label>
                <Input type="date" value={consent.consent_date} onChange={(e) => onConsentChange({ consent_date: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Signed By</Label>
                <Select value={consent.consent_signed_by} onValueChange={(v) => onConsentChange({ consent_signed_by: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PATIENT">Patient</SelectItem>
                    <SelectItem value="CARER">Carer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Comments</Label>
                <Input value={consent.consent_comments} onChange={(e) => onConsentChange({ consent_comments: e.target.value })} placeholder="Optional" />
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Upload the signed consent form in the Attachments section. Consent must be retained for 7 years per Program Rules.</p>
        </CardContent>
      </Card>
    </div>
  );
}
