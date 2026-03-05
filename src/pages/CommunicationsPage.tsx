import { useState, useEffect } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send, Clock, CheckCircle2, XCircle, Megaphone, List } from 'lucide-react';
import { SmsAnalytics } from '@/components/messaging/SmsAnalytics';

type SmsMessage = {
  id: string;
  patient_name: string;
  patient_phone: string;
  message_type: string;
  message_body: string;
  status: string;
  direction: string;
  response_text: string | null;
  response_rating: number | null;
  sent_at: string | null;
  created_at: string;
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'delivered': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    case 'failed': return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case 'queued': case 'sent': return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'delivered': return 'default' as const;
    case 'failed': return 'destructive' as const;
    default: return 'secondary' as const;
  }
};

export default function CommunicationsPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Campaign form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [messageType, setMessageType] = useState('pre_screen');
  const [customMessage, setCustomMessage] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sms_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      toast({ title: 'Error loading messages', description: error.message, variant: 'destructive' });
    } else {
      setMessages((data as SmsMessage[]) || []);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!patientName || !patientPhone || !consentChecked) {
      toast({ title: 'Missing fields', description: 'Fill all required fields and confirm consent.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-sms', {
        body: { patientName, patientPhone, messageType, customMessage: customMessage || undefined },
      });
      if (error) throw error;
      toast({ title: 'Message sent' });
      setPatientName('');
      setPatientPhone('');
      setCustomMessage('');
      setConsentChecked(false);
      fetchMessages();
    } catch (err: any) {
      toast({ title: 'Send failed', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 space-y-4 animate-fade-in max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold">Communications</h1>
          <p className="text-sm text-muted-foreground mt-1">Patient messaging campaigns and message history</p>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="campaigns" className="gap-1.5 text-xs">
              <Megaphone className="h-3.5 w-3.5" /> Campaigns
            </TabsTrigger>
            <TabsTrigger value="log" className="gap-1.5 text-xs">
              <List className="h-3.5 w-3.5" /> Message Log
            </TabsTrigger>
          </TabsList>

          {/* Campaigns tab */}
          <TabsContent value="campaigns" className="mt-4 space-y-4">
            <SmsAnalytics messages={messages} />

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Send className="h-4 w-4" /> Send Message</CardTitle>
                <CardDescription>Send an SMS to a patient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Patient Name *</Label>
                    <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Full name" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Phone Number *</Label>
                    <Input value={patientPhone} onChange={e => setPatientPhone(e.target.value)} placeholder="+61…" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Message Type</Label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre_screen">Pre-screening</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="safety_net">Safety-net</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {messageType === 'custom' && (
                  <div>
                    <Label className="text-xs">Custom Message</Label>
                    <Textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)} placeholder="Type your message…" className="mt-1" rows={3} />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Checkbox checked={consentChecked} onCheckedChange={v => setConsentChecked(!!v)} id="consent" />
                  <Label htmlFor="consent" className="text-xs text-muted-foreground">Patient has given consent to receive this SMS</Label>
                </div>
                <Button onClick={sendMessage} disabled={sending} className="gap-2">
                  <Send className="h-3.5 w-3.5" /> {sending ? 'Sending…' : 'Send SMS'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Message Log tab */}
          <TabsContent value="log" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Message Log</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs">Patient</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs">Message</TableHead>
                          <TableHead className="text-xs">Sent</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((msg) => (
                          <TableRow key={msg.id}>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {statusIcon(msg.status)}
                                <Badge variant={statusBadgeVariant(msg.status)} className="text-[0.625rem]">{msg.status}</Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium">{msg.patient_name}</TableCell>
                            <TableCell><Badge variant="outline" className="text-[0.625rem]">{msg.message_type}</Badge></TableCell>
                            <TableCell className="text-xs max-w-[200px] truncate">{msg.message_body}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {msg.sent_at ? new Date(msg.sent_at).toLocaleDateString('en-AU') : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClinicalLayout>
  );
}
