import { useState, useEffect, useCallback } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConsultRecord {
  id: string;
  status: string;
  patient_first_name: string | null;
  patient_last_name: string | null;
  condition_name: string | null;
  working_diagnosis: string | null;
  finalised_at: string | null;
  created_at: string;
  red_flag_triggered: boolean;
}

const PrescribingLog = () => {
  const [records, setRecords] = useState<ConsultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.from('consultations') as any)
      .select('id, status, patient_first_name, patient_last_name, condition_name, working_diagnosis, finalised_at, created_at, red_flag_triggered')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setRecords(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void fetchRecords(); }, [fetchRecords]);

  return (
    <ClinicalLayout>
      <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Prescribing Log</h1>
            <p className="text-sm text-muted-foreground mt-1">Complete audit trail of all prescribing decisions</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRecords} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No prescribing records yet. Complete a consultation to generate entries.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/consultations/new')}>
                Start Consultation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {records.map(r => (
              <Card key={r.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {r.patient_first_name || ''} {r.patient_last_name || 'Unknown Patient'}
                        </span>
                        <Badge variant={r.status === 'finalised' ? 'default' : 'secondary'} className="text-[10px]">
                          {r.status}
                        </Badge>
                        {r.red_flag_triggered && (
                          <Badge variant="destructive" className="text-[10px]">Red Flag</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {r.condition_name || 'No condition'} · {r.working_diagnosis || 'No diagnosis'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        ID: {r.id.slice(0, 8)}… · {r.finalised_at
                          ? new Date(r.finalised_at).toLocaleString('en-AU')
                          : new Date(r.created_at).toLocaleString('en-AU')
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ClinicalLayout>
  );
};

export default PrescribingLog;
