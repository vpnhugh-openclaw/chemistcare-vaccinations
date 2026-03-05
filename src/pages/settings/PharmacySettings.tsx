import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PharmacySettings() {
  return (
    <SettingsLayout title="Pharmacy Details">
      <Card>
        <CardHeader><CardTitle className="text-base">Pharmacy Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Pharmacy Name</span><span className="font-medium">—</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ABN</span><span className="font-medium">—</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="font-medium">—</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Section 90 Number</span><span className="font-medium">—</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Jurisdiction</span><span className="font-medium">Victoria</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Prescribing Authority</span><span className="font-medium">Community Pharmacist Prescriber</span></div>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
