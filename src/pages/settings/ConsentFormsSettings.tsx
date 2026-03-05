import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ConsentFormsSettings() {
  return (
    <SettingsLayout title="Consent Forms">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consent Form Templates</CardTitle>
          <CardDescription>Manage consent form templates and version control</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Consent form templates and versioning will be managed here.</p>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
