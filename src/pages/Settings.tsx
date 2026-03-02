import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const SettingsPage = () => (
  <ClinicalLayout>
    <div className="p-6 space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">System configuration and prescriber profile</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Prescriber Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">—</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Ahpra Registration</span><span className="font-medium">—</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Pharmacy</span><span className="font-medium">—</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Jurisdiction</span><span className="font-medium">Victoria</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Prescribing Authority</span><span className="font-medium">Community Pharmacist Prescriber</span></div>
        </CardContent>
      </Card>
    </div>
  </ClinicalLayout>
);

export default SettingsPage;
