import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EightCpaServiceType, ResidentialStatus } from "@/types/eightCpa";

interface PatientData {
  full_name: string;
  date_of_birth: string;
  address_line_1: string;
  address_line_2: string;
  suburb: string;
  postcode: string;
  state: string;
  phone: string;
  email: string;
  medicare_number: string;
  medicare_reference_number: string;
  dva_number: string;
  gender: string;
  residential_status: ResidentialStatus;
  is_atsi: boolean;
  primary_language: string;
  has_carer: boolean;
  carer_details: string;
  my_health_record_available: boolean;
}

interface ServiceData {
  service_type: EightCpaServiceType;
  service_date: string;
  service_time: string;
  pharmacy_name: string;
  section_90_number: string;
  pharmacy_accreditation_id: string;
}

interface Props {
  patient: PatientData;
  service: ServiceData;
  onPatientChange: (data: Partial<PatientData>) => void;
  onServiceChange: (data: Partial<ServiceData>) => void;
}

export function PatientServiceSection({ patient, service, onPatientChange, onServiceChange }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Service Type</Label>
            <Select value={service.service_type} onValueChange={(v) => onServiceChange({ service_type: v as EightCpaServiceType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MEDSCHECK">MedsCheck</SelectItem>
                <SelectItem value="DIABETES_MEDSCHECK">Diabetes MedsCheck</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Service Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={service.service_date} onChange={(e) => onServiceChange({ service_date: e.target.value })} />
          </div>
          <div>
            <Label>Service Time</Label>
            <Input type="time" value={service.service_time} onChange={(e) => onServiceChange({ service_time: e.target.value })} />
          </div>
          <div>
            <Label>Pharmacy Name</Label>
            <Input value={service.pharmacy_name} onChange={(e) => onServiceChange({ pharmacy_name: e.target.value })} />
          </div>
          <div>
            <Label>Section 90 Number</Label>
            <Input value={service.section_90_number} onChange={(e) => onServiceChange({ section_90_number: e.target.value })} />
          </div>
          <div>
            <Label>Pharmacy Accreditation ID</Label>
            <Input value={service.pharmacy_accreditation_id} onChange={(e) => onServiceChange({ pharmacy_accreditation_id: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patient Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input value={patient.full_name} onChange={(e) => onPatientChange({ full_name: e.target.value })} />
            </div>
            <div>
              <Label>Date of Birth <span className="text-destructive">*</span></Label>
              <Input type="date" value={patient.date_of_birth} onChange={(e) => onPatientChange({ date_of_birth: e.target.value })} />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={patient.gender} onValueChange={(v) => onPatientChange({ gender: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Medicare Number <span className="text-destructive">*</span></Label>
              <Input value={patient.medicare_number} onChange={(e) => onPatientChange({ medicare_number: e.target.value })} />
            </div>
            <div>
              <Label>Medicare Reference No.</Label>
              <Input value={patient.medicare_reference_number} onChange={(e) => onPatientChange({ medicare_reference_number: e.target.value })} />
            </div>
            <div>
              <Label>DVA Number</Label>
              <Input value={patient.dva_number} onChange={(e) => onPatientChange({ dva_number: e.target.value })} placeholder="If applicable" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Address Line 1</Label>
              <Input value={patient.address_line_1} onChange={(e) => onPatientChange({ address_line_1: e.target.value })} />
            </div>
            <div>
              <Label>Address Line 2</Label>
              <Input value={patient.address_line_2} onChange={(e) => onPatientChange({ address_line_2: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Suburb</Label>
              <Input value={patient.suburb} onChange={(e) => onPatientChange({ suburb: e.target.value })} />
            </div>
            <div>
              <Label>Postcode</Label>
              <Input value={patient.postcode} onChange={(e) => onPatientChange({ postcode: e.target.value })} />
            </div>
            <div>
              <Label>State</Label>
              <Select value={patient.state} onValueChange={(v) => onPatientChange({ state: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['ACT','NSW','NT','QLD','SA','TAS','VIC','WA'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={patient.phone} onChange={(e) => onPatientChange({ phone: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={patient.email} onChange={(e) => onPatientChange({ email: e.target.value })} />
            </div>
            <div>
              <Label>Primary Language</Label>
              <Input value={patient.primary_language} onChange={(e) => onPatientChange({ primary_language: e.target.value })} />
            </div>
            <div>
              <Label>Residential Status <span className="text-destructive">*</span></Label>
              <Select value={patient.residential_status} onValueChange={(v) => onPatientChange({ residential_status: v as ResidentialStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIVING_AT_HOME">Living at Home</SelectItem>
                  <SelectItem value="AGED_CARE">Aged Care</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Switch checked={patient.is_atsi} onCheckedChange={(v) => onPatientChange({ is_atsi: v })} />
              <Label className="mb-0">Aboriginal / Torres Strait Islander</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={patient.has_carer} onCheckedChange={(v) => onPatientChange({ has_carer: v })} />
              <Label className="mb-0">Has Carer</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={patient.my_health_record_available} onCheckedChange={(v) => onPatientChange({ my_health_record_available: v })} />
              <Label className="mb-0">My Health Record Available</Label>
            </div>
          </div>
          {patient.has_carer && (
            <div>
              <Label>Carer Details</Label>
              <Input value={patient.carer_details} onChange={(e) => onPatientChange({ carer_details: e.target.value })} placeholder="Name, relationship, contact" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
