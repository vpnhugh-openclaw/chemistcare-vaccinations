import { useState } from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Shield, Plug, MessageSquare, Stethoscope, FileCheck, Database, Wifi, TestTube, XCircle, CheckCircle2 } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: string;
  connected: boolean;
  demoMode: boolean;
  apiKey?: string;
  endpoint?: string;
  lastSync?: string;
  error?: string;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: '1',
    name: 'Australian Immunisation Register',
    provider: 'Services Australia',
    description: 'Upload vaccination encounters to AIR for patient immunisation history.',
    category: 'Government',
    connected: true,
    demoMode: true,
    apiKey: 'AIR-KEY-****7821',
    endpoint: 'https://api.servicesaustralia.gov.au/air/v2',
    lastSync: '2026-04-30T14:22:00Z',
  },
  {
    id: '2',
    name: 'PPA Online Claims',
    provider: 'Pharmacy Programs Administrator',
    description: 'Submit 8CPA claims directly to PPA for reimbursement.',
    category: 'Government',
    connected: true,
    demoMode: true,
    apiKey: 'PPA-KEY-****3390',
    endpoint: 'https://ppaonline.com.au/api/v1',
    lastSync: '2026-04-29T09:15:00Z',
  },
  {
    id: '3',
    name: 'Twilio SMS',
    provider: 'Twilio',
    description: 'Send appointment reminders, follow-ups, and broadcast campaigns.',
    category: 'Messaging',
    connected: true,
    demoMode: true,
    apiKey: 'TWILIO-****SK9912',
    endpoint: 'https://api.twilio.com/2010-04-01',
    lastSync: '2026-05-01T08:00:00Z',
  },
  {
    id: '4',
    name: 'ElevenLabs Scribe',
    provider: 'ElevenLabs',
    description: 'Real-time voice transcription for clinical consultations.',
    category: 'Clinical AI',
    connected: true,
    demoMode: true,
    apiKey: 'EL-****VOICE223',
    endpoint: 'wss://api.elevenlabs.io/v1/scribe',
    lastSync: '2026-04-28T16:45:00Z',
  },
  {
    id: '5',
    name: 'myGov / Medicare Online',
    provider: 'Services Australia',
    description: 'Verify patient Medicare eligibility and PBS authority.',
    category: 'Government',
    connected: false,
    demoMode: true,
    error: 'Pending MO approval and PKI certificate installation.',
  },
  {
    id: '6',
    name: 'TGA Recall Feed',
    provider: 'Therapeutic Goods Administration',
    description: 'Real-time medicine and device recall notifications.',
    category: 'Safety',
    connected: false,
    demoMode: true,
    error: 'RSS feed URL not configured.',
  },
  {
    id: '7',
    name: 'GuildLink eRx',
    provider: 'Pharmacy Guild of Australia',
    description: 'Electronic prescription exchange and token handling.',
    category: 'ePrescribing',
    connected: true,
    demoMode: true,
    apiKey: 'ERX-****GUILD09',
    endpoint: 'https://erx.guildlink.com.au/api/v2',
    lastSync: '2026-04-27T11:30:00Z',
  },
  {
    id: '8',
    name: 'HL7 FHIR Gateway',
    provider: 'Internal',
    description: 'FHIR R4 compliant API for integration with GP software (Best Practice, MedicalDirector).',
    category: 'Interoperability',
    connected: false,
    demoMode: true,
    error: 'FHIR server not yet deployed.',
  },
];

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Government: <Shield className="h-4 w-4" />,
  Messaging: <MessageSquare className="h-4 w-4" />,
  'Clinical AI': <Stethoscope className="h-4 w-4" />,
  Safety: <TestTube className="h-4 w-4" />,
  ePrescribing: <FileCheck className="h-4 w-4" />,
  Interoperability: <Database className="h-4 w-4" />,
};

const CATEGORY_COLOUR: Record<string, string> = {
  Government: 'bg-blue-50 text-blue-700 border-blue-200',
  Messaging: 'bg-purple-50 text-purple-700 border-purple-200',
  'Clinical AI': 'bg-amber-50 text-amber-700 border-amber-200',
  Safety: 'bg-red-50 text-red-700 border-red-200',
  ePrescribing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Interoperability: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [filter, setFilter] = useState<'all' | 'connected' | 'disconnected'>('all');

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
  };

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.connected).length,
    disconnected: integrations.filter(i => !i.connected).length,
    government: integrations.filter(i => i.category === 'Government').length,
  };

  const filtered = filter === 'all' ? integrations : integrations.filter(i => (filter === 'connected' ? i.connected : !i.connected));

  return (
    <SettingsLayout title="Integrations">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Connected', value: stats.connected },
            { label: 'Disconnected', value: stats.disconnected },
            { label: 'Govt APIs', value: stats.government },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            Demo mode active. All integrations shown with masked keys. Upgrade to live credentials for production use.
          </AlertDescription>
        </Alert>

        {/* Filter */}
        <div className="flex bg-secondary/50 rounded-md p-0.5 w-fit">
          {(['all', 'connected', 'disconnected'] as const).map(f => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              className={`h-7 text-xs capitalize ${filter === f ? 'bg-card shadow-sm' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Integrations List */}
        <div className="space-y-2">
          {filtered.map((integration) => (
            <Card key={integration.id} className={!integration.connected ? 'opacity-70' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 shrink-0">
                      {CATEGORY_ICON[integration.category] || <Plug className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{integration.name}</p>
                        <Badge variant="outline" className={`text-[0.625rem] ${CATEGORY_COLOUR[integration.category]}`}>
                          {CATEGORY_ICON[integration.category] && <span className="mr-1"></>}
                          {integration.category}
                        </Badge>
                        {integration.connected ? (
                          <Badge variant="secondary" className="text-[0.625rem] gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Connected
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[0.625rem] gap-1">
                            <XCircle className="h-3 w-3" /> Disconnected
                          </Badge>
                        )}
                        {integration.demoMode && <Badge variant="outline" className="text-[0.625rem] border-amber-500 text-amber-600 font-mono">DEMO</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{integration.provider}</p>
                      <p className="text-xs mt-1">{integration.description}</p>

                      {integration.connected && integration.apiKey && (
                        <div className="mt-2.5 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Label className="text-[0.625rem] text-muted-foreground uppercase">API Key</Label>
                            <Input value={integration.apiKey} disabled className="h-7 text-xs font-mono opacity-60" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-[0.625rem] text-muted-foreground uppercase">Endpoint</Label>
                            <Input value={integration.endpoint} disabled className="h-7 text-xs font-mono opacity-60" />
                          </div>
                        </div>
                      )}

                      {integration.error && (
                        <div className="mt-2.5 flex items-start gap-1.5 rounded-md bg-destructive/10 p-2">
                          <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                          <p className="text-xs text-destructive">{integration.error}</p>
                        </div>
                      )}

                      {integration.lastSync && (
                        <p className="text-[0.625rem] text-muted-foreground mt-1">
                          Last sync: {new Date(integration.lastSync).toLocaleString('en-AU')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={integration.connected} onCheckedChange={() => toggleConnection(integration.id)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SettingsLayout>
  );
}
