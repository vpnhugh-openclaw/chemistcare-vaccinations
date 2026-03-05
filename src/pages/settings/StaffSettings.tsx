import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function StaffSettings() {
  return (
    <SettingsLayout title="Staff">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Staff Management</CardTitle>
          <CardDescription>Staff profiles, roles, and AHPRA registration details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Staff profiles and role assignments will be managed here.</p>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
