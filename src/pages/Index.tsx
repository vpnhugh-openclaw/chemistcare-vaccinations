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
      <div className="p-5 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1>Clinical Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Pharmacist Prescriber Workspace</p>
          </div>
          <Button onClick={() => navigate('/consultation')} className="gap-2">
            <FilePlus className="h-4 w-4" />
            New Consultation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Today\'s Consultations', value: '0', icon: Activity, color: 'text-accent' },
            { label: 'Active Patients', value: '0', icon: Users, color: 'text-clinical-safe' },
            { label: 'Pending Follow-ups', value: '0', icon: Clock, color: 'text-clinical-warning' },
            { label: 'Scripts This Month', value: '0', icon: ClipboardList, color: 'text-foreground' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="clinical-section-title mb-1">{stat.label}</p>
                    <p className="text-[1.75rem] font-semibold tabular-nums leading-none">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-7 w-7 ${stat.color} opacity-20`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Start New Consultation', desc: 'Begin structured clinical assessment', icon: FilePlus, action: () => navigate('/consultation') },
                { label: 'View Conditions Library', desc: 'Browse 22 supported conditions', icon: TrendingUp, action: () => navigate('/conditions') },
                { label: 'Patient Records', desc: 'Search and manage patient profiles', icon: Users, action: () => navigate('/patients') },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={a.action}
                  className="w-full flex items-center gap-3 p-3 rounded-md border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-accent/10">
                    <a.icon className="h-4 w-4 text-accent" />
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
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-clinical-warning" />
                Safety Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                'Complete all assessment steps before prescribing',
                'Red flags always require referral documentation',
                'Verify PBS eligibility before script generation',
                'Document differential diagnoses for every encounter',
                'Check pregnancy status for all female patients',
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-clinical-safe mt-0.5 shrink-0" />
                  <p className="text-[0.8125rem] text-muted-foreground leading-snug">{r}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Supported conditions summary */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Conditions</CardTitle>
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
                  <span className="text-accent font-semibold tabular-nums">{cat.count}</span>
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
