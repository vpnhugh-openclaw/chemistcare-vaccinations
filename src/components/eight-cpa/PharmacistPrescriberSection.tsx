import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

interface PharmacistData {
  pharmacist_name: string;
  ahpra_registration_number: string;
  role: string;
  is_responsible_pharmacist_for_service: boolean;
}

export interface PrescriberData {
  id: string;
  prescriber_type: 'USUAL' | 'OTHER';
  prescriber_name: string;
  provider_number: string;
  practice_name: string;
  practice_address: string;
  phone: string;
  email: string;
  is_primary: boolean;
}

interface Props {
  pharmacist: PharmacistData;
  prescribers: PrescriberData[];
  onPharmacistChange: (data: Partial<PharmacistData>) => void;
  onPrescribersChange: (data: PrescriberData[]) => void;
}

export function PharmacistPrescriberSection({ pharmacist, prescribers, onPharmacistChange, onPrescribersChange }: Props) {
  const addPrescriber = () => {
    onPrescribersChange([...prescribers, {
      id: crypto.randomUUID(),
      prescriber_type: 'USUAL',
      prescriber_name: '',
      provider_number: '',
      practice_name: '',
      practice_address: '',
      phone: '',
      email: '',
      is_primary: prescribers.length === 0,
    }]);
  };

  const updatePrescriber = (index: number, data: Partial<PrescriberData>) => {
    const updated = [...prescribers];
    updated[index] = { ...updated[index], ...data };
    if (data.is_primary) {
      updated.forEach((p, i) => { if (i !== index) p.is_primary = false; });
    }
    onPrescribersChange(updated);
  };

  const removePrescriber = (index: number) => {
    onPrescribersChange(prescribers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consulting Pharmacist</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Pharmacist Name <span className="text-destructive">*</span></Label>
            <Input value={pharmacist.pharmacist_name} onChange={(e) => onPharmacistChange({ pharmacist_name: e.target.value })} />
          </div>
          <div>
            <Label>AHPRA Registration No.</Label>
            <Input value={pharmacist.ahpra_registration_number} onChange={(e) => onPharmacistChange({ ahpra_registration_number: e.target.value })} placeholder="PHAxxxxxxx" />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={pharmacist.role} onValueChange={(v) => onPharmacistChange({ role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="REGISTERED_PHARMACIST">Registered Pharmacist</SelectItem>
                <SelectItem value="INTERN_UNDER_SUPERVISION">Intern (Under Supervision)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 col-span-full">
            <Switch checked={pharmacist.is_responsible_pharmacist_for_service} onCheckedChange={(v) => onPharmacistChange({ is_responsible_pharmacist_for_service: v })} />
            <Label className="mb-0">Responsible pharmacist for this service</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Prescriber(s)</CardTitle>
          <Button variant="outline" size="sm" onClick={addPrescriber}><Plus className="h-4 w-4 mr-1" /> Add Prescriber</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {prescribers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No prescribers added. Click "Add Prescriber" to add the patient's usual GP or other prescribers.</p>
          )}
          {prescribers.map((p, i) => (
            <div key={p.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Prescriber {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <Switch checked={p.is_primary} onCheckedChange={(v) => updatePrescriber(i, { is_primary: v })} />
                    <Label className="mb-0 text-xs">Primary</Label>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removePrescriber(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Name <span className="text-destructive">*</span></Label>
                  <Input value={p.prescriber_name} onChange={(e) => updatePrescriber(i, { prescriber_name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Provider Number</Label>
                  <Input value={p.provider_number} onChange={(e) => updatePrescriber(i, { provider_number: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={p.prescriber_type} onValueChange={(v) => updatePrescriber(i, { prescriber_type: v as 'USUAL' | 'OTHER' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USUAL">Usual</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Practice Name</Label>
                  <Input value={p.practice_name} onChange={(e) => updatePrescriber(i, { practice_name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input value={p.phone} onChange={(e) => updatePrescriber(i, { phone: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input type="email" value={p.email} onChange={(e) => updatePrescriber(i, { email: e.target.value })} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
