import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  FilePlus,
  Users,
  ClipboardList,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <ClinicalLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Clinical Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">ChemistCare PrescriberOS — Pharmacist Prescriber Workspace</p>
          </div>
          <Button onClick={() => navigate('/consultation')} className="gap-2">
            <FilePlus className="h-4 w-4" />
            New Consultation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Today\'s Consultations', value: '0', icon: Activity, color: 'text-accent' },
            { label: 'Active Patients', value: '0', icon: Users, color: 'text-clinical-safe' },
            { label: 'Pending Follow-ups', value: '0', icon: Clock, color: 'text-clinical-warning' },
            { label: 'Scripts This Month', value: '0', icon: ClipboardList, color: 'text-foreground' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-30`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Start New Consultation', desc: 'Begin structured clinical assessment', icon: FilePlus, action: () => navigate('/consultation') },
                { label: 'View Conditions Library', desc: 'Browse 22 supported conditions', icon: TrendingUp, action: () => navigate('/conditions') },
                { label: 'Patient Records', desc: 'Search and manage patient profiles', icon: Users, action: () => navigate('/patients') },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={a.action}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
                    <a.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Safety reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-clinical-warning" />
                Safety Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'Complete all assessment steps before prescribing',
                'Red flags always require referral documentation',
                'Verify PBS eligibility before script generation',
                'Document differential diagnoses for every encounter',
                'Check pregnancy status for all female patients',
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-clinical-safe mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{r}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Supported conditions summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supported Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Acute', count: 7 },
                { label: 'Chronic', count: 10 },
                { label: 'Preventive', count: 3 },
                { label: 'Resupply', count: 1 },
              ].map((cat) => (
                <Badge key={cat.label} variant="secondary" className="gap-1.5">
                  {cat.label}
                  <span className="text-accent font-bold">{cat.count}</span>
                </Badge>
              ))}
              <Badge variant="outline" className="ml-2">22 Total Conditions</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClinicalLayout>
  );
};

export default Dashboard;
