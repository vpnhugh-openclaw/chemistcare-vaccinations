import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Calculators
import { CrClCalculator } from '@/components/calculators/CrClCalculator';
import { EGFRCalculator } from '@/components/calculators/EGFRCalculator';
import { FraminghamCalculator } from '@/components/calculators/FraminghamCalculator';
import { ACTCalculator } from '@/components/calculators/ACTCalculator';
import { COPDRiskCalculator } from '@/components/calculators/COPDRiskCalculator';
import { MetforminRenalCalculator } from '@/components/calculators/MetforminRenalCalculator';
import { NRTCalculator } from '@/components/calculators/NRTCalculator';
import { OCPSuitabilityCalculator } from '@/components/calculators/OCPSuitabilityCalculator';
import { AcneSeverityCalculator } from '@/components/calculators/AcneSeverityCalculator';
import { AntibioticRenalCalculator } from '@/components/calculators/AntibioticRenalCalculator';
import { PasiCalculator } from '@/components/protocols/PasiCalculator';

const CALC_CATEGORIES = [
  {
    id: 'renal',
    label: 'Renal',
    calculators: [
      { id: 'crcl', label: 'CrCl', component: CrClCalculator },
      { id: 'egfr', label: 'eGFR', component: EGFRCalculator },
      { id: 'metformin', label: 'Metformin', component: MetforminRenalCalculator },
      { id: 'abx-renal', label: 'Antibiotic Renal', component: AntibioticRenalCalculator },
    ],
  },
  {
    id: 'cvd',
    label: 'CVD & Chronic',
    calculators: [
      { id: 'framingham', label: 'Framingham', component: FraminghamCalculator },
      { id: 'act', label: 'ACT', component: ACTCalculator },
      { id: 'copd', label: 'COPD Risk', component: COPDRiskCalculator },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    calculators: [
      { id: 'pasi', label: 'PASI', component: PasiCalculator },
      { id: 'nrt', label: 'NRT', component: NRTCalculator },
      { id: 'ocp', label: 'OCP', component: OCPSuitabilityCalculator },
      { id: 'acne', label: 'Acne', component: AcneSeverityCalculator },
    ],
  },
];

export function CalculatorsDialog() {
  const [activeCalc, setActiveCalc] = useState('crcl');

  const allCalcs = CALC_CATEGORIES.flatMap(c => c.calculators);
  const ActiveComponent = allCalcs.find(c => c.id === activeCalc)?.component;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 border-accent/40 text-accent hover:bg-accent/10 hover:text-accent ml-1">
          <Calculator className="h-4 w-4" />
          <span className="hidden sm:inline">Calculators</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base">Clinical Calculators</DialogTitle>
        </DialogHeader>
        <Tabs value={activeCalc} onValueChange={setActiveCalc} className="flex flex-col">
          <div className="px-6 pt-2">
            {CALC_CATEGORIES.map(cat => (
              <div key={cat.id} className="mb-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{cat.label}</p>
                <div className="flex flex-wrap gap-1">
                  {cat.calculators.map(calc => (
                    <button
                      key={calc.id}
                      onClick={() => setActiveCalc(calc.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        activeCalc === calc.id
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {calc.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <ScrollArea className="px-6 pb-6 pt-2 max-h-[55vh]">
            {ActiveComponent && <ActiveComponent />}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
