import { useState, useMemo } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/PageSkeleton';
import { UserPlus, Search } from 'lucide-react';

const MOCK_PATIENTS = [
  { id: '1', firstName: 'Sarah', lastName: 'Mitchell', dateOfBirth: '1985-03-14', sex: 'female', phone: '0412 345 678', medicare: '2345 67890 1', lastVisit: '2026-02-28', conditions: ['UTI'] },
  { id: '2', firstName: 'James', lastName: 'Chen', dateOfBirth: '1972-08-22', sex: 'male', phone: '0423 456 789', medicare: '3456 78901 2', lastVisit: '2026-02-25', conditions: ['Hypertension', 'T2DM'] },
  { id: '3', firstName: 'Emily', lastName: "O'Brien", dateOfBirth: '1990-11-05', sex: 'female', phone: '0434 567 890', medicare: '4567 89012 3', lastVisit: '2026-02-20', conditions: ['OCP Resupply'] },
];

function fuzzyMatch(query: string, ...fields: string[]): boolean {
  const q = query.toLowerCase().replace(/\s+/g, '');
  return fields.some(f => {
    const field = (f || '').toLowerCase().replace(/\s+/g, '');
    if (field.includes(q)) return true;
    // Simple character-order fuzzy
    let qi = 0;
    for (let i = 0; i < field.length && qi < q.length; i++) {
      if (field[i] === q[qi]) qi++;
    }
    return qi === q.length;
  });
}

const Patients = () => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_PATIENTS;
    return MOCK_PATIENTS.filter(p =>
      fuzzyMatch(search, p.firstName, p.lastName, `${p.firstName} ${p.lastName}`, p.dateOfBirth, p.phone || '', p.medicare || '')
    );
  }, [search]);

  const duplicateWarning = useMemo(() => {
    if (!search.trim() || filtered.length <= 1) return null;
    const names = filtered.map(p => `${p.firstName} ${p.lastName}`.toLowerCase());
    const dups = names.filter((n, i) => names.indexOf(n) !== i);
    return dups.length > 0 ? 'Possible duplicate patients detected' : null;
  }, [search, filtered]);

  return (
    <ClinicalLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1>Patients</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage patient profiles and consultation history</p>
          </div>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" /> Add Patient
          </Button>
        </div>

        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, DOB, Medicare, or phone..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {duplicateWarning && (
          <div className="text-xs px-3 py-2 rounded-md bg-clinical-warning-bg" style={{ color: 'hsl(var(--clinical-warning))' }}>
            ⚠ {duplicateWarning}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState message="No patients matching your search." />
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">DOB: {p.dateOfBirth} · {p.sex} · Medicare: {p.medicare}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {p.conditions.map(c => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">Last: {p.lastVisit}</span>
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

export default Patients;
