import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Shield } from 'lucide-react';

export default function IntegrationsSettings() {
  return (
    <SettingsLayout title="Integrations">
      <div className="space-y-4">
        <Alert className="border-blue-500/30 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            Demo mode active. Upgrade to live integrations when credentials are available.
          </AlertDescription>
        </Alert>

        {/* AIR Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">AIR Integration</CardTitle>
                <CardDescription>Australian Immunisation Register reporting</CardDescription>
              </div>
              <Badge variant="outline" className="border-amber-500 text-amber-600 font-mono text-xs">DEMO</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">AIR Reporting</Label>
                <p className="text-xs text-muted-foreground">Automatically report vaccinations to AIR</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">demo</Badge>
                <Switch checked disabled />
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm">AIR Provider Number</Label>
              <Input placeholder="Enter AIR provider number…" disabled className="mt-1 opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">Your Medicare provider number for AIR submissions</p>
            </div>
          </CardContent>
        </Card>

        {/* PPA Claiming */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />PPA Claiming</CardTitle>
                <CardDescription>Pharmacy Programs Administrator claiming integration</CardDescription>
              </div>
              <Badge variant="outline" className="border-amber-500 text-amber-600 font-mono text-xs">DEMO</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">PPA API</Label>
                <p className="text-xs text-muted-foreground">Submit claims directly to PPA Online</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">demo</Badge>
                <Switch checked disabled />
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm">PPA_KEY</Label>
              <Input placeholder="Enter PPA API key for live claims…" disabled className="mt-1 opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">PPA Online claims submission key</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
