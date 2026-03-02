import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClinicalLayout } from "@/components/ClinicalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ClipboardList, Activity, FileCheck } from "lucide-react";
import { SERVICE_TYPE_LABELS, SERVICE_STATUS_LABELS, EightCpaServiceType, EightCpaServiceStatus } from "@/types/eightCpa";

interface ServiceSummary {
  id: string;
  service_type: EightCpaServiceType;
  status: EightCpaServiceStatus;
  service_date: string;
  patient_name: string;
  created_at: string;
}

export default function EightCpaDashboard() {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, drafts: 0, medscheck: 0, diabetes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: svcs } = await supabase.from('eight_cpa_services').select('id, service_type, status, service_date, created_at').order('created_at', { ascending: false }).limit(10);
      if (!svcs) { setLoading(false); return; }

      // Get patient names
      const ids = svcs.map(s => s.id);
      const { data: patients } = await supabase.from('eight_cpa_patient_snapshots').select('service_id, full_name').in('service_id', ids);
      const patMap = new Map(patients?.map(p => [p.service_id, p.full_name]) || []);

      setServices(svcs.map(s => ({ ...s, service_type: s.service_type as EightCpaServiceType, status: s.status as EightCpaServiceStatus, patient_name: patMap.get(s.id) || 'Unknown' })));

      // Stats
      const { count: total } = await supabase.from('eight_cpa_services').select('id', { count: 'exact', head: true });
      const { count: completed } = await supabase.from('eight_cpa_services').select('id', { count: 'exact', head: true }).eq('status', 'COMPLETED');
      const { count: drafts } = await supabase.from('eight_cpa_services').select('id', { count: 'exact', head: true }).eq('status', 'DRAFT');
      const { count: medscheck } = await supabase.from('eight_cpa_services').select('id', { count: 'exact', head: true }).eq('service_type', 'MEDSCHECK');
      const { count: diabetes } = await supabase.from('eight_cpa_services').select('id', { count: 'exact', head: true }).eq('service_type', 'DIABETES_MEDSCHECK');
      setStats({ total: total || 0, completed: completed || 0, drafts: drafts || 0, medscheck: medscheck || 0, diabetes: diabetes || 0 });
      setLoading(false);
    };
    load();
  }, []);

  const statusColor = (s: EightCpaServiceStatus) => {
    switch (s) {
      case 'COMPLETED': return 'clinical-badge-safe';
      case 'DRAFT': return 'clinical-badge-warning';
      case 'INELIGIBLE': return 'clinical-badge-danger';
      case 'CANCELLED': return 'clinical-badge-info';
    }
  };

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">8CPA / PPA Services</h1>
            <p className="text-sm text-muted-foreground">MedsCheck & Diabetes MedsCheck Recording</p>
          </div>
          <Button onClick={() => navigate('/eight-cpa/new')}><Plus className="h-4 w-4 mr-1" /> New Service</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardList className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Services</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--clinical-safe-bg))' }}><FileCheck className="h-5 w-5" style={{ color: 'hsl(var(--clinical-safe))' }} /></div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--clinical-warning-bg))' }}><Activity className="h-5 w-5" style={{ color: 'hsl(var(--clinical-warning))' }} /></div>
              <div>
                <p className="text-2xl font-bold">{stats.drafts}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div>
                  <p className="text-lg font-bold">{stats.medscheck}</p>
                  <p className="text-[10px] text-muted-foreground">MedsCheck</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.diabetes}</p>
                  <p className="text-[10px] text-muted-foreground">Diabetes MC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Services</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/eight-cpa/history')}>View All</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
            ) : services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No services recorded yet.</p>
                <Button variant="outline" className="mt-3" onClick={() => navigate('/eight-cpa/new')}><Plus className="h-4 w-4 mr-1" /> Record First Service</Button>
              </div>
            ) : (
              <div className="divide-y">
                {services.map(svc => (
                  <div key={svc.id} className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 px-2 -mx-2 rounded transition-colors" onClick={() => navigate(`/eight-cpa/edit/${svc.id}`)}>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium">{svc.patient_name}</p>
                        <p className="text-xs text-muted-foreground">{svc.service_date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{SERVICE_TYPE_LABELS[svc.service_type]}</Badge>
                      <Badge className={`${statusColor(svc.status)} text-[10px]`}>{SERVICE_STATUS_LABELS[svc.status]}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClinicalLayout>
  );
}
