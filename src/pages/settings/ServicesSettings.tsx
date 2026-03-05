import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ServicesSettings() {
  return (
    <SettingsLayout title="Services">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pharmacy Services</CardTitle>
            <CardDescription>Configure available services and booking types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Vaccination Consultation', 'MedsCheck', 'Diabetes MedsCheck', 'Travel Medicine'].map((svc) => (
                <div key={svc} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium">{svc}</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
