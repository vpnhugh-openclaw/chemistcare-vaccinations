import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent } from '@/components/ui/card';

const Audit = () => (
  <ClinicalLayout>
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Audit</h1>
        <p className="text-sm text-muted-foreground mt-1">Full audit log of clinical decisions and system access</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No audit entries yet. All clinical decisions will be logged here.</p>
        </CardContent>
      </Card>
    </div>
  </ClinicalLayout>
);

export default Audit;
