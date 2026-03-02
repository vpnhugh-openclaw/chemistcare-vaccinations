import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ActionItem {
  id: string;
  issue_description: string;
  outcome: string;
  follow_up_required: boolean;
  follow_up_date: string;
  responsible_party: string;
  goal_text: string;
}

interface Props {
  items: ActionItem[];
  onChange: (items: ActionItem[]) => void;
}

const emptyItem = (): ActionItem => ({
  id: crypto.randomUUID(),
  issue_description: '',
  outcome: '',
  follow_up_required: false,
  follow_up_date: '',
  responsible_party: 'PHARMACIST',
  goal_text: '',
});

export function ActionPlanSection({ items, onChange }: Props) {
  const addItem = () => onChange([...items, emptyItem()]);
  const updateItem = (index: number, data: Partial<ActionItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...data };
    onChange(updated);
  };
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Action Plan</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Document issues, outcomes and follow-up actions (PSA-compliant SMART goals recommended).</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{items.length} item{items.length !== 1 ? 's' : ''}</Badge>
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" /> Add Issue</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No action plan items recorded yet.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={addItem}><Plus className="h-4 w-4 mr-1" /> Add First Issue</Button>
          </div>
        )}

        {items.map((item, i) => (
          <div key={item.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Issue #{i + 1}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Issue / Problem <span className="text-destructive">*</span></Label>
                <Textarea className="text-xs" rows={2} value={item.issue_description} onChange={(e) => updateItem(i, { issue_description: e.target.value })} placeholder="e.g. Missed evening dose of metoprolol" />
              </div>
              <div>
                <Label className="text-[10px]">Outcome / Recommendation</Label>
                <Textarea className="text-xs" rows={2} value={item.outcome} onChange={(e) => updateItem(i, { outcome: e.target.value })} placeholder="e.g. Dose administration aid set up" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <Label className="text-[10px]">Responsible Party</Label>
                <Select value={item.responsible_party} onValueChange={(v) => updateItem(i, { responsible_party: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PATIENT">Patient</SelectItem>
                    <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                    <SelectItem value="GP">GP</SelectItem>
                    <SelectItem value="SPECIALIST">Specialist</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={item.follow_up_required} onCheckedChange={(v) => updateItem(i, { follow_up_required: v })} />
                <Label className="text-[10px] mb-0">Follow-up?</Label>
              </div>
              {item.follow_up_required && (
                <div>
                  <Label className="text-[10px]">Follow-up Date</Label>
                  <Input type="date" className="h-8 text-xs" value={item.follow_up_date} onChange={(e) => updateItem(i, { follow_up_date: e.target.value })} />
                </div>
              )}
            </div>
            <div>
              <Label className="text-[10px]">Goal (SMART format recommended)</Label>
              <Input className="h-8 text-xs" value={item.goal_text} onChange={(e) => updateItem(i, { goal_text: e.target.value })} placeholder="e.g. Patient to take metoprolol at 6pm daily using DAA by end of week" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
