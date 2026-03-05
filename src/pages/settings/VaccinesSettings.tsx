import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VaccinesSettings() {
  return (
    <SettingsLayout title="Vaccines">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vaccine Inventory</CardTitle>
          <CardDescription>Manage vaccine brands, batches, and stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Vaccine configuration will be managed here. Stock levels, batch numbers, and expiry tracking.</p>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
