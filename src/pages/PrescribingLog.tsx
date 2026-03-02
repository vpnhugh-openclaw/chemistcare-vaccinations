import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent } from '@/components/ui/card';

const PrescribingLog = () => (
  <ClinicalLayout>
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Prescribing Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete audit trail of all prescribing decisions</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No prescribing records yet. Complete a consultation to generate entries.</p>
        </CardContent>
      </Card>
    </div>
  </ClinicalLayout>
);

export default PrescribingLog;
