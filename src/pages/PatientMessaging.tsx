import { useState, useEffect } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send, Clock, CheckCircle2, XCircle, ArrowDownToLine, Phone } from 'lucide-react';

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

const PatientMessaging = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Send form state
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
      console.error('Error fetching messages:', error);
    } else {
      setMessages((data as SmsMessage[]) || []);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!patientName.trim() || !patientPhone.trim()) {
      toast({ title: 'Missing fields', description: 'Patient name and phone are required.', variant: 'destructive' });
      return;
    }
    if (!consentChecked) {
      toast({ title: 'Consent required', description: 'Please confirm patient has opted in to receive SMS.', variant: 'destructive' });
      return;
    }
    // Basic AU phone validation
    const cleanPhone = patientPhone.replace(/\s/g, '');
    if (!/^\+61\d{9}$/.test(cleanPhone)) {
      toast({ title: 'Invalid phone', description: 'Enter a valid AU number in +61XXXXXXXXX format.', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          patientName: patientName.trim(),
          patientPhone: cleanPhone,
          messageType,
          customMessage: messageType === 'custom' ? customMessage : undefined,
        },
      });

      if (error) throw error;

      toast({ title: 'SMS sent', description: `Message sent to ${patientName}.` });
      setPatientName('');
      setPatientPhone('');
      setCustomMessage('');
      setConsentChecked(false);
      fetchMessages();
    } catch (err: any) {
      toast({ title: 'Send failed', description: err.message || 'Could not send SMS.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const exportCsv = () => {
    if (!messages.length) return;
    const headers = ['Date', 'Patient', 'Phone', 'Type', 'Status', 'Message', 'Response', 'Rating'];
    const rows = messages.map(m => [
      new Date(m.created_at).toLocaleDateString('en-AU'),
      m.patient_name,
      m.patient_phone,
      m.message_type,
      m.status,
      `"${m.message_body.replace(/"/g, '""')}"`,
      m.response_text || '',
      m.response_rating?.toString() || '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sms-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewMessage = messageType === 'pre_screen'
    ? `Hi ${patientName || '[Name]'}, prepare for your consult at Burke Road Pharmacy.\n\nPlease complete your pre-screening questionnaire:\nhttps://forms.gle/YOUR_FORM_ID\n\nThis helps us provide the best care.\n\nReply STOP to opt-out.\n— ChemistCare`
    : messageType === 'follow_up'
    ? `Hi ${patientName || '[Name]'}, how did your consult go? Rate 1-5 (1=poor, 5=excellent).\n\nAny issues? Reply or call (03) XXXX XXXX.\n\nThanks, ChemistCare\nReply STOP to unsubscribe.`
    : customMessage || 'Enter a custom message...';

  return (
    <ClinicalLayout>
      <div className="p-6 space-y-6 animate-fade-in max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Patient Messaging
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Send pre-screening &amp; follow-up SMS · AU Spam Act compliant
            </p>
          </div>
          <Badge variant="outline" className="text-xs gap-1">
            <Phone className="h-3 w-3" /> Twilio SMS
          </Badge>
        </div>

        <Tabs defaultValue="send" className="space-y-4">
          <TabsList>
            <TabsTrigger value="send">Send Message</TabsTrigger>
            <TabsTrigger value="log">Message Log</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Send Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Compose SMS</CardTitle>
                  <CardDescription>Send a pre-screening or follow-up message</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Patient Name</Label>
                    <Input placeholder="e.g. Jane Smith" value={patientName} onChange={e => setPatientName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number (AU)</Label>
                    <Input placeholder="+61412345678" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Message Type</Label>
                    <Select value={messageType} onValueChange={setMessageType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pre_screen">Pre-Screening Questionnaire</SelectItem>
                        <SelectItem value="follow_up">Post-Consult Follow-Up</SelectItem>
                        <SelectItem value="custom">Custom Message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {messageType === 'custom' && (
                    <div className="space-y-2">
                      <Label>Custom Message</Label>
                      <Textarea
                        placeholder="Enter your message..."
                        value={customMessage}
                        onChange={e => setCustomMessage(e.target.value)}
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        "Reply STOP to opt-out" will be appended automatically.
                      </p>
                    </div>
                  )}
                  <div className="flex items-start gap-2 pt-2">
                    <Checkbox
                      id="consent"
                      checked={consentChecked}
                      onCheckedChange={(v) => setConsentChecked(v === true)}
                    />
                    <label htmlFor="consent" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                      I confirm this patient has provided opt-in consent to receive SMS communications from this pharmacy, in compliance with the Australian Spam Act 2003. Messages are for clinical purposes only.
                    </label>
                  </div>
                  <Button onClick={handleSend} disabled={sending} className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    {sending ? 'Sending...' : 'Send SMS'}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Message Preview</CardTitle>
                  <CardDescription>How the patient will see it</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MessageSquare className="h-3.5 w-3.5" />
                      SMS from ChemistCare
                    </div>
                    <div className="bg-background rounded-lg p-3 text-sm whitespace-pre-wrap shadow-sm border max-w-[280px]">
                      {previewMessage}
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-xs font-medium text-accent-foreground mb-1">🔒 Compliance Notes</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• AU Spam Act 2003 — opt-in required, STOP to unsubscribe</li>
                      <li>• Clinical messages only — no marketing content</li>
                      <li>• Compliant with My Health Record standards</li>
                      <li>• HIPAA-eligible Twilio APIs</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="log" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Message Log</CardTitle>
                  <CardDescription>{messages.length} messages</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
                  <ArrowDownToLine className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No messages sent yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="max-w-[200px]">Message</TableHead>
                          <TableHead>Response</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((msg) => (
                          <TableRow key={msg.id}>
                            <TableCell className="text-xs whitespace-nowrap">
                              {new Date(msg.created_at).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </TableCell>
                            <TableCell className="font-medium text-sm">{msg.patient_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs capitalize">
                                {msg.message_type.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {statusIcon(msg.status)}
                                <Badge variant={statusBadgeVariant(msg.status)} className="text-xs capitalize">
                                  {msg.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                              {msg.message_body}
                            </TableCell>
                            <TableCell className="text-xs">
                              {msg.response_rating ? (
                                <Badge variant="default">{msg.response_rating}/5</Badge>
                              ) : msg.response_text ? (
                                <span className="text-muted-foreground">{msg.response_text}</span>
                              ) : (
                                <span className="text-muted-foreground/50">—</span>
                              )}
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
};

export default PatientMessaging;
