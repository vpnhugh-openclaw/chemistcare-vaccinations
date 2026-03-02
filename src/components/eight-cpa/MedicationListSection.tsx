import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MedicationItem {
  id: string;
  brand_name: string;
  generic_name: string;
  form: string;
  strength: string;
  dose_and_regimen: string;
  indication: string;
  special_instructions: string;
  start_date: string;
  prescriber_name: string;
  is_prescription: boolean;
  is_non_prescription: boolean;
  is_complementary: boolean;
}

interface Props {
  medications: MedicationItem[];
  reconciliationCompleted: boolean;
  onMedicationsChange: (meds: MedicationItem[]) => void;
  onReconciliationChange: (v: boolean) => void;
}

const emptyMed = (): MedicationItem => ({
  id: crypto.randomUUID(),
  brand_name: '',
  generic_name: '',
  form: '',
  strength: '',
  dose_and_regimen: '',
  indication: '',
  special_instructions: '',
  start_date: '',
  prescriber_name: '',
  is_prescription: true,
  is_non_prescription: false,
  is_complementary: false,
});

export function MedicationListSection({ medications, reconciliationCompleted, onMedicationsChange, onReconciliationChange }: Props) {
  const addMed = () => onMedicationsChange([...medications, emptyMed()]);
  
  const updateMed = (index: number, data: Partial<MedicationItem>) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], ...data };
    onMedicationsChange(updated);
  };

  const removeMed = (index: number) => onMedicationsChange(medications.filter((_, i) => i !== index));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Medicine List & Reconciliation</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Record all prescription, non-prescription, and complementary medicines per PSA guidelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{medications.length} medicine{medications.length !== 1 ? 's' : ''}</Badge>
          <Button variant="outline" size="sm" onClick={addMed}><Plus className="h-4 w-4 mr-1" /> Add Medicine</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {medications.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No medicines recorded yet.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={addMed}><Plus className="h-4 w-4 mr-1" /> Add First Medicine</Button>
          </div>
        )}

        {medications.map((med, i) => (
          <div key={med.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                <span className="text-xs font-medium text-muted-foreground">#{i + 1}</span>
                <div className="flex gap-2 ml-2">
                  {med.is_prescription && <Badge variant="outline" className="text-[10px] py-0">Rx</Badge>}
                  {med.is_non_prescription && <Badge variant="outline" className="text-[10px] py-0">OTC</Badge>}
                  {med.is_complementary && <Badge variant="outline" className="text-[10px] py-0">CAM</Badge>}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeMed(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <Label className="text-[10px]">Brand Name</Label>
                <Input className="h-8 text-xs" value={med.brand_name} onChange={(e) => updateMed(i, { brand_name: e.target.value })} />
              </div>
              <div>
                <Label className="text-[10px]">Generic Name</Label>
                <Input className="h-8 text-xs" value={med.generic_name} onChange={(e) => updateMed(i, { generic_name: e.target.value })} />
              </div>
              <div>
                <Label className="text-[10px]">Form</Label>
                <Input className="h-8 text-xs" value={med.form} onChange={(e) => updateMed(i, { form: e.target.value })} placeholder="e.g. Tablet" />
              </div>
              <div>
                <Label className="text-[10px]">Strength</Label>
                <Input className="h-8 text-xs" value={med.strength} onChange={(e) => updateMed(i, { strength: e.target.value })} placeholder="e.g. 500mg" />
              </div>
              <div className="col-span-2">
                <Label className="text-[10px]">Dose & Regimen</Label>
                <Input className="h-8 text-xs" value={med.dose_and_regimen} onChange={(e) => updateMed(i, { dose_and_regimen: e.target.value })} placeholder="e.g. 1 tablet twice daily" />
              </div>
              <div>
                <Label className="text-[10px]">Indication</Label>
                <Input className="h-8 text-xs" value={med.indication} onChange={(e) => updateMed(i, { indication: e.target.value })} />
              </div>
              <div>
                <Label className="text-[10px]">Prescriber</Label>
                <Input className="h-8 text-xs" value={med.prescriber_name} onChange={(e) => updateMed(i, { prescriber_name: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-4 pt-1">
              <div className="flex items-center gap-1.5">
                <Checkbox checked={med.is_prescription} onCheckedChange={(v) => updateMed(i, { is_prescription: !!v })} />
                <Label className="text-[10px] mb-0">Prescription</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Checkbox checked={med.is_non_prescription} onCheckedChange={(v) => updateMed(i, { is_non_prescription: !!v })} />
                <Label className="text-[10px] mb-0">Non-prescription</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Checkbox checked={med.is_complementary} onCheckedChange={(v) => updateMed(i, { is_complementary: !!v })} />
                <Label className="text-[10px] mb-0">Complementary</Label>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3 pt-3 border-t">
          <Switch checked={reconciliationCompleted} onCheckedChange={onReconciliationChange} />
          <Label className="mb-0 font-medium">Medication reconciliation completed</Label>
        </div>
      </CardContent>
    </Card>
  );
}
