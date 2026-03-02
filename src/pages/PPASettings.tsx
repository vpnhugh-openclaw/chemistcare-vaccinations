import { useState, useEffect } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Wifi, WifiOff, RefreshCw, Shield, ScrollText, ExternalLink } from 'lucide-react';

type PPASettings = {
  id: string;
  pharmacy_name: string;
  ppa_service_provider_id: string | null;
  ppa_user_id: string | null;
  environment: string;
  is_connected: boolean;
  last_connection_test_at: string | null;
  last_connection_status: string | null;
  registered_programs: any;
};

type AuditEntry = {
  id: string;
  event_type: string;
  program_code: string | null;
  request_summary: string | null;
  response_status: number | null;
  response_summary: string | null;
  error_message: string | null;
  created_at: string;
};

const PPASettingsPage = () => {
  const [settings, setSettings] = useState<PPASettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [form, setForm] = useState({
    ppa_service_provider_id: '',
    ppa_user_id: '',
    environment: 'sandbox',
  });
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('ppa_integration_settings').select('*').limit(1).maybeSingle();
    if (data) {
      setSettings(data as unknown as PPASettings);
      setForm({
        ppa_service_provider_id: data.ppa_service_provider_id || '',
        ppa_user_id: data.ppa_user_id || '',
        environment: data.environment || 'sandbox',
      });
    }
    setLoading(false);
  };

  const fetchAuditLog = async () => {
    const { data } = await supabase
      .from('integration_audit_log')
      .select('*')
      .eq('event_source', 'ppa')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setAuditLog(data as unknown as AuditEntry[]);
  };

  useEffect(() => {
    fetchSettings();
    fetchAuditLog();
  }, []);

  const handleSave = async () => {
    const payload = {
      ppa_service_provider_id: form.ppa_service_provider_id || null,
      ppa_user_id: form.ppa_user_id || null,
      environment: form.environment,
    };

    if (settings) {
      await supabase.from('ppa_integration_settings').update(payload as any).eq('id', settings.id);
    } else {
      await supabase.from('ppa_integration_settings').insert({ ...payload, pharmacy_name: 'My Pharmacy' } as any);
    }
    toast({ title: 'Settings saved' });
    fetchSettings();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ppa-integration', {
        body: { action: 'test_connection' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Connection successful', description: 'PPA API responded successfully.' });
      fetchSettings();
      fetchAuditLog();
    } catch (err: any) {
      toast({ title: 'Connection failed', description: err.message || 'Unable to reach PPA API', variant: 'destructive' });
      fetchSettings();
      fetchAuditLog();
    } finally {
      setTesting(false);
    }
  };

  return (
    <ClinicalLayout>
      <div className="p-6 space-y-6 animate-fade-in max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> PPA Integration Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your Pharmacy Programs Administrator (PPA) API integration for 8CPA program claiming.
          </p>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="config" className="gap-1.5 text-xs">
              <Settings className="h-3.5 w-3.5" /> Configuration
            </TabsTrigger>
            <TabsTrigger value="programs" className="gap-1.5 text-xs">
              <ScrollText className="h-3.5 w-3.5" /> Programs
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5 text-xs">
              <Shield className="h-3.5 w-3.5" /> Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="mt-4 space-y-4">
            {/* Connection status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {settings?.is_connected ? (
                    <Wifi className="h-4 w-4" style={{ color: 'hsl(var(--clinical-safe))' }} />
                  ) : (
                    <WifiOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={settings?.is_connected ? 'default' : 'secondary'}>
                    {settings?.is_connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment</span>
                  <Badge variant="outline">{form.environment}</Badge>
                </div>
                {settings?.last_connection_test_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Tested</span>
                    <span className="text-xs">{new Date(settings.last_connection_test_at).toLocaleString()}</span>
                  </div>
                )}
                {settings?.last_connection_status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Result</span>
                    <span className="text-xs max-w-[250px] truncate">{settings.last_connection_status}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Config form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">API Configuration</CardTitle>
                <CardDescription className="text-xs">
                  Your PPA API key is stored securely as a backend secret and is never exposed to the browser.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">PPA User ID</Label>
                  <Input
                    value={form.ppa_user_id}
                    onChange={e => setForm(f => ({ ...f, ppa_user_id: e.target.value }))}
                    placeholder="Your PPA user ID"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">PPA Service Provider ID</Label>
                  <Input
                    value={form.ppa_service_provider_id}
                    onChange={e => setForm(f => ({ ...f, ppa_service_provider_id: e.target.value }))}
                    placeholder="Your service provider ID"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Environment</Label>
                  <Select value={form.environment} onValueChange={v => setForm(f => ({ ...f, environment: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (testing)</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save Settings</Button>
                  <Button variant="outline" onClick={handleTestConnection} disabled={testing} className="gap-1.5">
                    <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
                    Test PPA Connection
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  To set or rotate your PPA API Key, contact your administrator to update the <code className="text-xs">PPA_API_KEY</code> backend secret.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="mt-4">
            <PPAProgramsList />
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Integration Audit Log</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Timestamp</TableHead>
                      <TableHead className="text-xs">Event</TableHead>
                      <TableHead className="text-xs">Program</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLog.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No events logged yet</TableCell>
                      </TableRow>
                    ) : auditLog.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">{new Date(log.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-xs font-medium">{log.event_type.replace(/_/g, ' ')}</TableCell>
                        <TableCell className="text-xs">{log.program_code || '—'}</TableCell>
                        <TableCell className="text-xs">{log.response_status || '—'}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{log.error_message || log.response_summary || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClinicalLayout>
  );
};

function PPAProgramsList() {
  const [programs, setPrograms] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from('claim_programs')
      .select('*')
      .order('category')
      .then(({ data }) => {
        if (data) setPrograms(data);
      });
  }, []);

  const categories = [...new Set(programs.map(p => p.category || 'Other'))];

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <Card key={cat}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Program</TableHead>
                  <TableHead className="text-xs">Code</TableHead>
                  <TableHead className="text-xs">Fee (ex GST)</TableHead>
                  <TableHead className="text-xs">API</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Rules</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.filter(p => (p.category || 'Other') === cat).map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-medium">{p.name}</TableCell>
                    <TableCell className="text-xs font-mono">{p.code}</TableCell>
                    <TableCell className="text-xs">${Number(p.standard_fee_ex_gst).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_api_supported ? 'default' : 'secondary'} className="text-[10px]">
                        {p.is_api_supported ? 'API' : 'Manual'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.is_active ? 'default' : 'outline'} className="text-[10px]">
                        {p.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.program_rules_url ? (
                        <a href={p.program_rules_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Rules
                        </a>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default PPASettingsPage;
