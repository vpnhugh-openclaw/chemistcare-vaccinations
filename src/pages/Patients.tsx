import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search } from 'lucide-react';

const MOCK_PATIENTS = [
  { id: '1', firstName: 'Sarah', lastName: 'Mitchell', dateOfBirth: '1985-03-14', sex: 'female', lastVisit: '2026-02-28', conditions: ['UTI'] },
  { id: '2', firstName: 'James', lastName: 'Chen', dateOfBirth: '1972-08-22', sex: 'male', lastVisit: '2026-02-25', conditions: ['Hypertension', 'T2DM'] },
  { id: '3', firstName: 'Emily', lastName: 'O\'Brien', dateOfBirth: '1990-11-05', sex: 'female', lastVisit: '2026-02-20', conditions: ['OCP Resupply'] },
];

const Patients = () => {
  return (
    <ClinicalLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Patients</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage patient profiles and consultation history</p>
          </div>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" /> Add Patient
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients by name or ID..." className="pl-10" />
        </div>

        <div className="space-y-2">
          {MOCK_PATIENTS.map((p) => (
            <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-muted-foreground">DOB: {p.dateOfBirth} · {p.sex}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {p.conditions.map(c => (
                      <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Last: {p.lastVisit}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ClinicalLayout>
  );
};

export default Patients;
