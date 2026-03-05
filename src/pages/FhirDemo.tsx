import { useState, useMemo } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, ShieldAlert, ChevronDown, User, Pill, Eye, EyeOff } from 'lucide-react';
import { fhirDemoPatients, type FhirPatient } from '@/data/fhir-demo-data';

function maskMedicare(m: string, show: boolean) {
  if (show) return m;
  return m.replace(/\d(?=.{3})/g, '•');
}

export default function FhirDemo() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return fhirDemoPatients;
    const q = search.toLowerCase();
    return fhirDemoPatients.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.medicare.includes(q));
  }, [search]);

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 space-y-4 animate-fade-in max-w-6xl">
        <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 font-mono text-xs">DEMO – Public Data Mode</Badge>

        <h1 className="text-2xl font-bold">FHIR Patient Dashboard</h1>
        <p className="text-sm text-muted-foreground">Mock My Health Record data using demo patients</p>

        <Alert className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            FHIR demo fallback — public sandbox access requires auth in production. Showing mock test patient data.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, patient ID, or Medicare #…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSensitive(!showSensitive)}>
            {showSensitive ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
            {showSensitive ? 'Mask Data' : 'Show Data'}
          </Button>
        </div>

        <div className="space-y-3">
          {filtered.map(patient => (
            <Collapsible key={patient.id} open={expandedId === patient.id} onOpenChange={open => setExpandedId(open ? patient.id : null)}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold">{patient.name}</CardTitle>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span>{patient.gender}</span>
                            <span>DOB: {patient.dob}</span>
                            <span>Medicare: {maskMedicare(patient.medicare, showSensitive)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex gap-3 text-xs">
                          <Badge variant="secondary">PBS: {patient.pbsTotal}</Badge>
                          <Badge variant="outline">MBS: {patient.mbsTotal}</Badge>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" style={{ transform: expandedId === patient.id ? 'rotate(180deg)' : 'none' }} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="flex gap-3 sm:hidden mb-3">
                      <Badge variant="secondary">PBS: {patient.pbsTotal}</Badge>
                      <Badge variant="outline">MBS: {patient.mbsTotal}</Badge>
                    </div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Pill className="h-3 w-3" />Recent Prescriptions
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medication</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="hidden sm:table-cell">Prescriber</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patient.recentScripts.map((rx, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium text-sm">{rx.drug}</TableCell>
                            <TableCell className="text-sm">{rx.date}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{rx.prescriber}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No patients match your search.</div>
          )}
        </div>
      </div>
    </ClinicalLayout>
  );
}
