import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Shield } from 'lucide-react';

export default function IntegrationSettings() {
  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 space-y-4 animate-fade-in max-w-2xl">
        <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 font-mono text-xs">DEMO – Public Data Mode</Badge>

        <h1 className="text-2xl font-bold">Integration Settings</h1>
        <p className="text-sm text-muted-foreground">Configure API integrations and demo mode toggles</p>

        <Alert className="border-blue-500/30 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            Demo mode active. Upgrade to live integrations when credentials are available.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demo Mode Toggles</CardTitle>
            <CardDescription>Current operational modes for each integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">DEMO_MODE</Label>
                <p className="text-xs text-muted-foreground">All integrations run in demo mode</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">true</Badge>
                <Switch checked disabled />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">PBS_PUBLIC</Label>
                <p className="text-xs text-muted-foreground">Using public PBS demo dataset</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">true</Badge>
                <Switch checked disabled />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">FHIR_SANDBOX</Label>
                <p className="text-xs text-muted-foreground">Using mock patient data (sandbox fallback)</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">true</Badge>
                <Switch checked disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />API Credentials (Future)</CardTitle>
            <CardDescription>Placeholder inputs for production API keys — not required in demo mode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">PPA_KEY</Label>
              <Input placeholder="Enter PPA API key for live claims…" disabled className="mt-1 opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">PPA Online claims submission key</p>
            </div>
            <div>
              <Label className="text-sm">FHIR_CLIENT_ID</Label>
              <Input placeholder="Enter FHIR OAuth client ID…" disabled className="mt-1 opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">My Health Record FHIR Gateway client</p>
            </div>
            <div>
              <Label className="text-sm">FHIR_CLIENT_SECRET</Label>
              <Input placeholder="Enter FHIR OAuth client secret…" type="password" disabled className="mt-1 opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">My Health Record FHIR Gateway secret</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClinicalLayout>
  );
}
