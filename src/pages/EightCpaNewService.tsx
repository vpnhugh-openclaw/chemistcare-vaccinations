import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClinicalLayout } from "@/components/ClinicalLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, CheckCircle2, Trash2, ArrowLeft } from "lucide-react";
import { PatientServiceSection } from "@/components/eight-cpa/PatientServiceSection";
import { PharmacistPrescriberSection, type PrescriberData } from "@/components/eight-cpa/PharmacistPrescriberSection";
import { EligibilityConsentSection } from "@/components/eight-cpa/EligibilityConsentSection";
import { LifestyleHealthSection } from "@/components/eight-cpa/LifestyleHealthSection";
import { MedicationListSection, type MedicationItem } from "@/components/eight-cpa/MedicationListSection";
import { ActionPlanSection, type ActionItem } from "@/components/eight-cpa/ActionPlanSection";
import { AttachmentsSection, type AttachmentFile } from "@/components/eight-cpa/AttachmentsSection";
import { ClaimStatusSection } from "@/components/eight-cpa/ClaimStatusSection";
import { EightCpaServiceType, ResidentialStatus, MEDSCHECK_FEE, DIABETES_MEDSCHECK_FEE } from "@/types/eightCpa";

type SmokingStatusEnum = 'NEVER' | 'FORMER' | 'CURRENT' | 'UNKNOWN';
type AlcoholUseEnum = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'UNKNOWN';
type PharmacistRoleEnum = 'REGISTERED_PHARMACIST' | 'INTERN_UNDER_SUPERVISION';
type ConsentSignerEnum = 'PATIENT' | 'CARER';
type ResponsiblePartyEnum = 'PATIENT' | 'PHARMACIST' | 'GP' | 'SPECIALIST' | 'OTHER';
type ClaimStatusEnum = 'NOT_SUBMITTED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'MANUAL_ONLY';
type AttachmentTypeEnum = 'PDF' | 'JPG' | 'PNG' | 'OTHER';
type AttachmentCategoryEnum = 'CONSENT_FORM' | 'GP_REPORT' | 'PATIENT_REPORT' | 'HANDWRITTEN_NOTES' | 'OTHER';

const today = new Date().toISOString().split('T')[0];
const nowTime = new Date().toTimeString().slice(0, 5);

export default function EightCpaNewService() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("patient");
  const [serviceId, setServiceId] = useState<string | null>(id || null);
  const [reconciliationCompleted, setReconciliationCompleted] = useState(false);

  const [service, setService] = useState({
    service_type: 'MEDSCHECK' as EightCpaServiceType,
    service_date: today,
    service_time: nowTime,
    pharmacy_name: 'My Pharmacy',
    section_90_number: '',
    pharmacy_accreditation_id: '',
  });

  const [patient, setPatient] = useState<{
    full_name: string; date_of_birth: string; address_line_1: string; address_line_2: string;
    suburb: string; postcode: string; state: string; phone: string; email: string;
    medicare_number: string; medicare_reference_number: string; dva_number: string;
    gender: string; residential_status: ResidentialStatus;
    is_atsi: boolean; primary_language: string; has_carer: boolean;
    carer_details: string; my_health_record_available: boolean;
  }>({
    full_name: '', date_of_birth: '', address_line_1: '', address_line_2: '',
    suburb: '', postcode: '', state: '', phone: '', email: '',
    medicare_number: '', medicare_reference_number: '', dva_number: '',
    gender: '', residential_status: 'LIVING_AT_HOME',
    is_atsi: false, primary_language: 'English', has_carer: false,
    carer_details: '', my_health_record_available: false,
  });

  const [pharmacist, setPharmacist] = useState({
    pharmacist_name: '', ahpra_registration_number: '',
    role: 'REGISTERED_PHARMACIST', is_responsible_pharmacist_for_service: true,
  });

  const [prescribers, setPrescribers] = useState<PrescriberData[]>([]);

  const [eligibility, setEligibility] = useState({
    is_medicare_or_dva_eligible: false, has_received_medscheck_hmr_rmmr_last_12m: false,
    is_living_in_community_setting: true, notes_on_residential_status: '',
    taking_5_or_more_prescription_medicines: false, recent_significant_medical_event: false,
    recent_significant_medical_event_details: '', high_risk_medicine_use: false,
    high_risk_medicine_details: '', recent_type2_diagnosis_last_12m: false,
    poorly_controlled_type2: false, barriers_to_timely_access_diabetes_services: '',
    pharmacist_declares_eligibility_met: false, pharmacist_eligibility_notes: '',
  });

  const [consent, setConsent] = useState({
    written_consent_obtained: false, consent_date: today,
    consent_signed_by: 'PATIENT', consent_comments: '', has_consent_pdf_attached: false,
  });

  const [clinical, setClinical] = useState({
    lifestyle_smoking_status: 'UNKNOWN', lifestyle_alcohol_use: 'UNKNOWN',
    lifestyle_diet_notes: '', lifestyle_activity_notes: '',
    clinical_bp_systolic: '', clinical_bp_diastolic: '', clinical_bp_date: '',
    clinical_weight: '', clinical_height: '', clinical_bmi: '', clinical_pulse: '',
    diabetes_bgl_readings_summary: '', diabetes_hba1c_value: '', diabetes_hba1c_date: '',
    monitoring_device_used: '', allergies_adverse_reactions: '', underlying_medical_conditions: '',
  });

  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  const [claim, setClaim] = useState({
    ppa_claim_required: true, ppa_claim_status: 'NOT_SUBMITTED',
    ppa_submission_date: '', ppa_rejection_reason: '', notes: '',
  });

  // Load existing service
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: svc } = await supabase.from('eight_cpa_services').select('*').eq('id', id).single();
      if (!svc) return;
      setService({ service_type: svc.service_type as EightCpaServiceType, service_date: svc.service_date, service_time: svc.service_time, pharmacy_name: svc.pharmacy_name, section_90_number: svc.section_90_number || '', pharmacy_accreditation_id: svc.pharmacy_accreditation_id || '' });

      const { data: pat } = await supabase.from('eight_cpa_patient_snapshots').select('*').eq('service_id', id).single();
      if (pat) setPatient({ full_name: pat.full_name, date_of_birth: pat.date_of_birth || '', address_line_1: pat.address_line_1 || '', address_line_2: pat.address_line_2 || '', suburb: pat.suburb || '', postcode: pat.postcode || '', state: pat.state || '', phone: pat.phone || '', email: pat.email || '', medicare_number: pat.medicare_number || '', medicare_reference_number: pat.medicare_reference_number || '', dva_number: pat.dva_number || '', gender: pat.gender || '', residential_status: (pat.residential_status as any) || 'LIVING_AT_HOME', is_atsi: pat.is_atsi || false, primary_language: pat.primary_language || 'English', has_carer: pat.has_carer || false, carer_details: pat.carer_details || '', my_health_record_available: pat.my_health_record_available || false });

      const { data: pharm } = await supabase.from('eight_cpa_pharmacist_snapshots').select('*').eq('service_id', id).single();
      if (pharm) setPharmacist({ pharmacist_name: pharm.pharmacist_name, ahpra_registration_number: pharm.ahpra_registration_number || '', role: pharm.role || 'REGISTERED_PHARMACIST', is_responsible_pharmacist_for_service: pharm.is_responsible_pharmacist_for_service ?? true });

      const { data: presc } = await supabase.from('eight_cpa_prescribers').select('*').eq('service_id', id);
      if (presc) setPrescribers(presc.map(p => ({ id: p.id, prescriber_type: (p.prescriber_type as any) || 'USUAL', prescriber_name: p.prescriber_name, provider_number: p.provider_number || '', practice_name: p.practice_name || '', practice_address: p.practice_address || '', phone: p.phone || '', email: p.email || '', is_primary: p.is_primary || false })));

      const { data: elig } = await supabase.from('eight_cpa_eligibility').select('*').eq('service_id', id).single();
      if (elig) setEligibility({ is_medicare_or_dva_eligible: elig.is_medicare_or_dva_eligible, has_received_medscheck_hmr_rmmr_last_12m: elig.has_received_medscheck_hmr_rmmr_last_12m, is_living_in_community_setting: elig.is_living_in_community_setting, notes_on_residential_status: elig.notes_on_residential_status || '', taking_5_or_more_prescription_medicines: elig.taking_5_or_more_prescription_medicines, recent_significant_medical_event: elig.recent_significant_medical_event, recent_significant_medical_event_details: elig.recent_significant_medical_event_details || '', high_risk_medicine_use: elig.high_risk_medicine_use, high_risk_medicine_details: elig.high_risk_medicine_details || '', recent_type2_diagnosis_last_12m: elig.recent_type2_diagnosis_last_12m, poorly_controlled_type2: elig.poorly_controlled_type2, barriers_to_timely_access_diabetes_services: (elig.barriers_to_timely_access_diabetes_services as any) || '', pharmacist_declares_eligibility_met: elig.pharmacist_declares_eligibility_met, pharmacist_eligibility_notes: elig.pharmacist_eligibility_notes || '' });

      const { data: con } = await supabase.from('eight_cpa_consent').select('*').eq('service_id', id).single();
      if (con) setConsent({ written_consent_obtained: con.written_consent_obtained, consent_date: con.consent_date || today, consent_signed_by: (con.consent_signed_by as any) || 'PATIENT', consent_comments: con.consent_comments || '', has_consent_pdf_attached: con.has_consent_pdf_attached });

      const { data: clin } = await supabase.from('eight_cpa_clinical_data').select('*').eq('service_id', id).single();
      if (clin) setClinical({ lifestyle_smoking_status: (clin.lifestyle_smoking_status as any) || 'UNKNOWN', lifestyle_alcohol_use: (clin.lifestyle_alcohol_use as any) || 'UNKNOWN', lifestyle_diet_notes: clin.lifestyle_diet_notes || '', lifestyle_activity_notes: clin.lifestyle_activity_notes || '', clinical_bp_systolic: clin.clinical_bp_systolic?.toString() || '', clinical_bp_diastolic: clin.clinical_bp_diastolic?.toString() || '', clinical_bp_date: clin.clinical_bp_date || '', clinical_weight: clin.clinical_weight?.toString() || '', clinical_height: clin.clinical_height?.toString() || '', clinical_bmi: clin.clinical_bmi?.toString() || '', clinical_pulse: clin.clinical_pulse?.toString() || '', diabetes_bgl_readings_summary: clin.diabetes_bgl_readings_summary || '', diabetes_hba1c_value: clin.diabetes_hba1c_value?.toString() || '', diabetes_hba1c_date: clin.diabetes_hba1c_date || '', monitoring_device_used: clin.monitoring_device_used || '', allergies_adverse_reactions: JSON.stringify(clin.allergies_adverse_reactions || []), underlying_medical_conditions: JSON.stringify(clin.underlying_medical_conditions || []) });

      const { data: meds } = await supabase.from('eight_cpa_medication_items').select('*').eq('service_id', id).order('order_index');
      if (meds) setMedications(meds.map(m => ({ id: m.id, brand_name: m.brand_name || '', generic_name: m.generic_name || '', form: m.form || '', strength: m.strength || '', dose_and_regimen: m.dose_and_regimen || '', indication: m.indication || '', special_instructions: m.special_instructions || '', start_date: m.start_date || '', prescriber_name: m.prescriber_name || '', is_prescription: m.is_prescription, is_non_prescription: m.is_non_prescription, is_complementary: m.is_complementary })));

      const { data: actions } = await supabase.from('eight_cpa_action_plan_items').select('*').eq('service_id', id).order('order_index');
      if (actions) setActionItems(actions.map(a => ({ id: a.id, issue_description: a.issue_description, outcome: a.outcome || '', follow_up_required: a.follow_up_required, follow_up_date: a.follow_up_date || '', responsible_party: (a.responsible_party as any) || 'PHARMACIST', goal_text: a.goal_text || '' })));

      const { data: claimData } = await supabase.from('eight_cpa_claim_tracking').select('*').eq('service_id', id).single();
      if (claimData) setClaim({ ppa_claim_required: claimData.ppa_claim_required, ppa_claim_status: (claimData.ppa_claim_status as any) || 'NOT_SUBMITTED', ppa_submission_date: claimData.ppa_submission_date || '', ppa_rejection_reason: claimData.ppa_rejection_reason || '', notes: claimData.notes || '' });

      const { data: atts } = await supabase.from('eight_cpa_attachments').select('*').eq('service_id', id).eq('is_deleted', false);
      if (atts) setAttachments(atts.map(a => ({ id: a.id, file: null, file_name: a.file_name, file_type: (a.file_type as any) || 'OTHER', category: (a.category as any) || 'OTHER', notes: a.notes || '', storage_path: a.storage_path, filesize: a.filesize, uploaded_at: a.uploaded_at })));
    };
    load();
  }, [id]);

  const isEligible = (() => {
    const base = eligibility.is_medicare_or_dva_eligible && !eligibility.has_received_medscheck_hmr_rmmr_last_12m && eligibility.is_living_in_community_setting;
    if (service.service_type === 'MEDSCHECK') return base && (eligibility.taking_5_or_more_prescription_medicines || eligibility.recent_significant_medical_event || eligibility.high_risk_medicine_use);
    return base && (eligibility.recent_type2_diagnosis_last_12m || eligibility.poorly_controlled_type2 || eligibility.barriers_to_timely_access_diabetes_services.length > 0);
  })();

  const canComplete = patient.full_name && patient.medicare_number && consent.written_consent_obtained && medications.length > 0 && actionItems.length > 0;

  const saveService = async (status: 'DRAFT' | 'COMPLETED') => {
    setSaving(true);
    try {
      let svcId = serviceId;

      // Upsert service
      if (svcId) {
        await supabase.from('eight_cpa_services').update({
          service_type: service.service_type, status, service_date: service.service_date,
          service_time: service.service_time, pharmacy_name: service.pharmacy_name,
          section_90_number: service.section_90_number || null,
          pharmacy_accreditation_id: service.pharmacy_accreditation_id || null,
        }).eq('id', svcId);
      } else {
        const { data: newSvc } = await supabase.from('eight_cpa_services').insert({
          service_type: service.service_type, status, service_date: service.service_date,
          service_time: service.service_time, pharmacy_name: service.pharmacy_name,
          section_90_number: service.section_90_number || null,
          pharmacy_accreditation_id: service.pharmacy_accreditation_id || null,
        }).select().single();
        if (!newSvc) throw new Error('Failed to create service');
        svcId = newSvc.id;
        setServiceId(svcId);
      }

      // Patient snapshot - upsert
      const patientPayload = { ...patient, service_id: svcId, date_of_birth: patient.date_of_birth || null, dva_number: patient.dva_number || null, carer_details: patient.carer_details || null };
      const { data: existingPat } = await supabase.from('eight_cpa_patient_snapshots').select('id').eq('service_id', svcId).single();
      if (existingPat) await supabase.from('eight_cpa_patient_snapshots').update(patientPayload).eq('id', existingPat.id);
      else await supabase.from('eight_cpa_patient_snapshots').insert(patientPayload);

      // Pharmacist snapshot
      const pharmacistPayload = { ...pharmacist, service_id: svcId, role: pharmacist.role as PharmacistRoleEnum };
      const { data: existingPharm } = await supabase.from('eight_cpa_pharmacist_snapshots').select('id').eq('service_id', svcId).single();
      if (existingPharm) await supabase.from('eight_cpa_pharmacist_snapshots').update(pharmacistPayload).eq('id', existingPharm.id);
      else await supabase.from('eight_cpa_pharmacist_snapshots').insert(pharmacistPayload);

      // Prescribers - delete and re-insert
      await supabase.from('eight_cpa_prescribers').delete().eq('service_id', svcId);
      if (prescribers.length > 0) {
        await supabase.from('eight_cpa_prescribers').insert(prescribers.map(p => ({
          service_id: svcId!, prescriber_type: p.prescriber_type, prescriber_name: p.prescriber_name,
          provider_number: p.provider_number || null, practice_name: p.practice_name || null,
          practice_address: p.practice_address || null, phone: p.phone || null, email: p.email || null,
          is_primary: p.is_primary,
        })));
      }

      // Eligibility
      const eligPayload = { ...eligibility, service_id: svcId, barriers_to_timely_access_diabetes_services: eligibility.barriers_to_timely_access_diabetes_services ? [eligibility.barriers_to_timely_access_diabetes_services] : [] };
      const { data: existingElig } = await supabase.from('eight_cpa_eligibility').select('id').eq('service_id', svcId).single();
      if (existingElig) await supabase.from('eight_cpa_eligibility').update(eligPayload).eq('id', existingElig.id);
      else await supabase.from('eight_cpa_eligibility').insert(eligPayload);

      // Consent
      const consentPayload = { ...consent, service_id: svcId, consent_date: consent.consent_date || null, has_consent_pdf_attached: attachments.some(a => a.category === 'CONSENT_FORM'), consent_signed_by: consent.consent_signed_by as ConsentSignerEnum };
      const { data: existingCon } = await supabase.from('eight_cpa_consent').select('id').eq('service_id', svcId).single();
      if (existingCon) await supabase.from('eight_cpa_consent').update(consentPayload).eq('id', existingCon.id);
      else await supabase.from('eight_cpa_consent').insert(consentPayload);

      // Clinical data
      const clinPayload = {
        service_id: svcId,
        lifestyle_smoking_status: clinical.lifestyle_smoking_status as SmokingStatusEnum,
        lifestyle_alcohol_use: clinical.lifestyle_alcohol_use as AlcoholUseEnum,
        lifestyle_diet_notes: clinical.lifestyle_diet_notes || null,
        lifestyle_activity_notes: clinical.lifestyle_activity_notes || null,
        clinical_bp_systolic: clinical.clinical_bp_systolic ? parseInt(clinical.clinical_bp_systolic) : null,
        clinical_bp_diastolic: clinical.clinical_bp_diastolic ? parseInt(clinical.clinical_bp_diastolic) : null,
        clinical_bp_date: clinical.clinical_bp_date || null,
        clinical_weight: clinical.clinical_weight ? parseFloat(clinical.clinical_weight) : null,
        clinical_height: clinical.clinical_height ? parseFloat(clinical.clinical_height) : null,
        clinical_bmi: clinical.clinical_bmi ? parseFloat(clinical.clinical_bmi) : null,
        clinical_pulse: clinical.clinical_pulse ? parseInt(clinical.clinical_pulse) : null,
        diabetes_bgl_readings_summary: clinical.diabetes_bgl_readings_summary || null,
        diabetes_hba1c_value: clinical.diabetes_hba1c_value ? parseFloat(clinical.diabetes_hba1c_value) : null,
        diabetes_hba1c_date: clinical.diabetes_hba1c_date || null,
        monitoring_device_used: clinical.monitoring_device_used || null,
        allergies_adverse_reactions: clinical.allergies_adverse_reactions ? [clinical.allergies_adverse_reactions] : [],
        underlying_medical_conditions: clinical.underlying_medical_conditions ? [clinical.underlying_medical_conditions] : [],
      };
      const { data: existingClin } = await supabase.from('eight_cpa_clinical_data').select('id').eq('service_id', svcId).single();
      if (existingClin) await supabase.from('eight_cpa_clinical_data').update(clinPayload).eq('id', existingClin.id);
      else await supabase.from('eight_cpa_clinical_data').insert(clinPayload);

      // Medications - delete and re-insert
      await supabase.from('eight_cpa_medication_items').delete().eq('service_id', svcId);
      if (medications.length > 0) {
        await supabase.from('eight_cpa_medication_items').insert(medications.map((m, i) => ({
          service_id: svcId!, brand_name: m.brand_name || null, generic_name: m.generic_name || null,
          form: m.form || null, strength: m.strength || null, dose_and_regimen: m.dose_and_regimen || null,
          indication: m.indication || null, special_instructions: m.special_instructions || null,
          start_date: m.start_date || null, prescriber_name: m.prescriber_name || null,
          is_prescription: m.is_prescription, is_non_prescription: m.is_non_prescription,
          is_complementary: m.is_complementary, order_index: i,
        })));
      }

      // Action plan - delete and re-insert
      await supabase.from('eight_cpa_action_plan_items').delete().eq('service_id', svcId);
      if (actionItems.length > 0) {
        await supabase.from('eight_cpa_action_plan_items').insert(actionItems.map((a, i) => ({
          service_id: svcId!, issue_description: a.issue_description, outcome: a.outcome || null,
          follow_up_required: a.follow_up_required, follow_up_date: a.follow_up_date || null,
          responsible_party: a.responsible_party as ResponsiblePartyEnum, goal_text: a.goal_text || null, order_index: i,
        })));
      }

      // Upload new attachments
      for (const att of attachments) {
        if (att.file && !att.storage_path) {
          const path = `${svcId}/${crypto.randomUUID()}-${att.file_name}`;
          const { error: uploadError } = await supabase.storage.from('eight-cpa-attachments').upload(path, att.file);
          if (uploadError) { console.error('Upload error:', uploadError); continue; }
          await supabase.from('eight_cpa_attachments').insert({
            service_id: svcId!, file_name: att.file_name, file_type: att.file_type as AttachmentTypeEnum,
            category: att.category as AttachmentCategoryEnum, notes: att.notes || null, storage_path: path,
            filesize: att.filesize,
          });
        }
      }

      // Claim tracking
      const fee = service.service_type === 'MEDSCHECK' ? MEDSCHECK_FEE : DIABETES_MEDSCHECK_FEE;
      const claimPayload = { ...claim, service_id: svcId, fee_amount: fee, ppa_submission_date: claim.ppa_submission_date || null, ppa_rejection_reason: claim.ppa_rejection_reason || null, notes: claim.notes || null, ppa_claim_status: claim.ppa_claim_status as ClaimStatusEnum };
      const { data: existingClaim } = await supabase.from('eight_cpa_claim_tracking').select('id').eq('service_id', svcId).single();
      if (existingClaim) await supabase.from('eight_cpa_claim_tracking').update(claimPayload).eq('id', existingClaim.id);
      else await supabase.from('eight_cpa_claim_tracking').insert(claimPayload);

      toast({ title: status === 'DRAFT' ? "Draft saved" : "Service completed", description: `${service.service_type === 'MEDSCHECK' ? 'MedsCheck' : 'Diabetes MedsCheck'} record saved.` });
      
      if (status === 'COMPLETED') navigate('/eight-cpa/history');
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!serviceId) { navigate('/eight-cpa'); return; }
    if (!confirm('Delete this draft service? This cannot be undone.')) return;
    await supabase.from('eight_cpa_services').delete().eq('id', serviceId);
    toast({ title: "Deleted" });
    navigate('/eight-cpa');
  };

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/eight-cpa')}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-lg font-semibold">{isEdit ? 'Edit' : 'New'} 8CPA Service</h1>
              <p className="text-xs text-muted-foreground">{service.service_type === 'MEDSCHECK' ? 'MedsCheck' : 'Diabetes MedsCheck'} Recording</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
            <Button variant="outline" size="sm" onClick={() => saveService('DRAFT')} disabled={saving}><Save className="h-4 w-4 mr-1" /> Save Draft</Button>
            <Button size="sm" onClick={() => saveService('COMPLETED')} disabled={saving || !canComplete}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Complete
            </Button>
          </div>
        </div>

        {!canComplete && (
          <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
            <strong>To complete:</strong> Patient name, Medicare number, written consent, ≥1 medication, ≥1 action plan item required.
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full">
            <TabsTrigger value="patient" className="text-xs">Patient</TabsTrigger>
            <TabsTrigger value="pharmacist" className="text-xs">Pharmacist</TabsTrigger>
            <TabsTrigger value="eligibility" className="text-xs">Eligibility</TabsTrigger>
            <TabsTrigger value="lifestyle" className="text-xs">Health</TabsTrigger>
            <TabsTrigger value="medications" className="text-xs">Medicines</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Action Plan</TabsTrigger>
            <TabsTrigger value="attachments" className="text-xs">Files</TabsTrigger>
            <TabsTrigger value="claim" className="text-xs">Claim</TabsTrigger>
          </TabsList>

          <TabsContent value="patient">
            <PatientServiceSection patient={patient} service={service} onPatientChange={(d) => setPatient(p => ({ ...p, ...d }))} onServiceChange={(d) => setService(s => ({ ...s, ...d }))} />
          </TabsContent>

          <TabsContent value="pharmacist">
            <PharmacistPrescriberSection pharmacist={pharmacist} prescribers={prescribers} onPharmacistChange={(d) => setPharmacist(p => ({ ...p, ...d }))} onPrescribersChange={setPrescribers} />
          </TabsContent>

          <TabsContent value="eligibility">
            <EligibilityConsentSection serviceType={service.service_type} eligibility={eligibility} consent={consent} onEligibilityChange={(d) => setEligibility(e => ({ ...e, ...d }))} onConsentChange={(d) => setConsent(c => ({ ...c, ...d }))} />
          </TabsContent>

          <TabsContent value="lifestyle">
            <LifestyleHealthSection serviceType={service.service_type} data={clinical} onChange={(d) => setClinical(c => ({ ...c, ...d }))} />
          </TabsContent>

          <TabsContent value="medications">
            <MedicationListSection medications={medications} reconciliationCompleted={reconciliationCompleted} onMedicationsChange={setMedications} onReconciliationChange={setReconciliationCompleted} />
          </TabsContent>

          <TabsContent value="actions">
            <ActionPlanSection items={actionItems} onChange={setActionItems} />
          </TabsContent>

          <TabsContent value="attachments">
            <AttachmentsSection attachments={attachments} onChange={setAttachments} consentPdfNeeded={consent.written_consent_obtained} />
          </TabsContent>

          <TabsContent value="claim">
            <ClaimStatusSection serviceType={service.service_type} isEligible={isEligible} claim={claim} onChange={(d) => setClaim(c => ({ ...c, ...d }))} />
          </TabsContent>
        </Tabs>

        {/* Bottom save bar */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => saveService('DRAFT')} disabled={saving}><Save className="h-4 w-4 mr-1" /> Save Draft</Button>
          <Button size="sm" onClick={() => saveService('COMPLETED')} disabled={saving || !canComplete}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Complete
          </Button>
        </div>
      </div>
    </ClinicalLayout>
  );
}
