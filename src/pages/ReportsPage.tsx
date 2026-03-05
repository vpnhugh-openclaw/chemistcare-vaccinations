import { useState } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EligibleCases } from '@/components/claims/EligibleCases';
import { ClaimBatches } from '@/components/claims/ClaimBatches';
import { ClaimHistory } from '@/components/claims/ClaimHistory';
import { FileText, Package, History } from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('eligible');

  return (
    <ClinicalLayout>
      <div className="p-6 space-y-6 animate-fade-in max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Claims, reporting, and analytics for funded community pharmacist programs.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="eligible" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" /> Eligible Cases
            </TabsTrigger>
            <TabsTrigger value="batches" className="gap-1.5 text-xs">
              <Package className="h-3.5 w-3.5" /> Batches
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs">
              <History className="h-3.5 w-3.5" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eligible" className="mt-4">
            <EligibleCases />
          </TabsContent>
          <TabsContent value="batches" className="mt-4">
            <ClaimBatches />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <ClaimHistory />
          </TabsContent>
        </Tabs>
      </div>
    </ClinicalLayout>
  );
}
