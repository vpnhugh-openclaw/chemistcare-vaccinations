import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CommunicationsSettings() {
  return (
    <SettingsLayout title="Communications">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Communication Templates</CardTitle>
          <CardDescription>SMS templates, email settings, and follow-up rules</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Message templates and automated follow-up configuration will be managed here.</p>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
