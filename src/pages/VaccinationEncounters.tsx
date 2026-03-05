import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Syringe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VaccinationEncounters() {
  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 space-y-4 animate-fade-in max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Encounters</h1>
            <p className="text-sm text-muted-foreground mt-1">Vaccination and prescribing encounters</p>
          </div>
          <Link to="/consultation">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Encounter
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Syringe className="h-4 w-4" /> Recent Encounters</CardTitle>
            <CardDescription>Consultation and vaccination encounters will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No encounters recorded yet. Start a new encounter from the button above or from the Calendar.</p>
          </CardContent>
        </Card>
      </div>
    </ClinicalLayout>
  );
}
