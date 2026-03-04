import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BookOpen, Lightbulb, Pill, GitCompare, UserPlus, Pin, Loader2 } from 'lucide-react';

interface EvidenceResult {
  question: string;
  answer: string;
  sources: string[];
  action: string;
}

interface EvidenceDrawerProps {
  conditionName?: string;
  onPinEvidence: (evidence: EvidenceResult) => void;
}

const QUICK_ACTIONS = [
  { key: 'explain', label: 'Explain', icon: Lightbulb, prompt: 'Explain the pathophysiology and clinical presentation of' },
  { key: 'treat', label: 'Treat', icon: Pill, prompt: 'What are the first-line treatment options for' },
  { key: 'compare', label: 'Compare', icon: GitCompare, prompt: 'Compare treatment options for' },
  { key: 'refer', label: 'Refer', icon: UserPlus, prompt: 'What are the referral criteria for' },
] as const;

export function EvidenceDrawer({ conditionName, onPinEvidence }: EvidenceDrawerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EvidenceResult[]>([]);

  const handleQuickAction = (action: typeof QUICK_ACTIONS[number]) => {
    const fullQuery = `${action.prompt} ${conditionName || 'this condition'}`;
    setQuery(fullQuery);
    runQuery(fullQuery, action.key);
  };

  const runQuery = async (q: string, action: string) => {
    setLoading(true);
    // Simulated evidence response — in production this would call AI
    await new Promise(r => setTimeout(r, 1200));
    const result: EvidenceResult = {
      question: q,
      answer: getSimulatedAnswer(action, conditionName),
      sources: ['Therapeutic Guidelines (TG)', 'Australian Medicines Handbook (AMH)', 'PBS Schedule'],
      action,
    };
    setResults(prev => [result, ...prev]);
    setLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Evidence</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent" />
            Evidence Panel
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Quick actions */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(a => (
                <Button
                  key={a.key}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => handleQuickAction(a)}
                  disabled={loading}
                >
                  <a.icon className="h-3 w-3" />
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom query */}
          <div className="space-y-2">
            <Textarea
              placeholder="Ask a clinical question..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="h-16 text-sm"
            />
            <Button
              size="sm"
              onClick={() => runQuery(query, 'custom')}
              disabled={loading || !query.trim()}
              className="w-full gap-2"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? 'Searching...' : 'Search Evidence'}
            </Button>
          </div>

          {/* Results */}
          {results.map((r, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{r.question}</p>
              <p className="text-sm leading-relaxed">{r.answer}</p>
              <div className="flex flex-wrap gap-1">
                {r.sources.map(s => (
                  <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs h-7"
                onClick={() => onPinEvidence(r)}
              >
                <Pin className="h-3 w-3" /> Pin to consult
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function getSimulatedAnswer(action: string, condition?: string): string {
  const name = condition || 'this condition';
  const answers: Record<string, string> = {
    explain: `${name} is a common presentation in community pharmacy. Key clinical features include characteristic symptoms that differentiate it from similar conditions. The pathophysiology involves inflammatory mediators and requires systematic assessment to rule out red flags before pharmacist-initiated treatment.`,
    treat: `First-line therapy per TG/AMH guidelines should be considered. Dose adjustments may be required for renal impairment (check CrCl). PBS restrictions may apply — verify eligibility before dispensing. Monitor for adverse effects and schedule follow-up within the recommended timeframe.`,
    compare: `When comparing treatment options, consider efficacy (NNT), safety profile, patient factors (age, renal function, pregnancy), PBS availability, and cost. First-line agents are preferred unless contraindicated. Document clinical reasoning for any deviation from guidelines.`,
    refer: `Referral criteria include: presence of red flags, failure of first-line therapy, symptoms persisting beyond expected duration, patient outside prescribing scope (age/sex/pregnancy restrictions), or clinical uncertainty. Urgent referral for any signs of systemic involvement.`,
  };
  return answers[action] || `Evidence summary for ${name}: Consult TG and AMH for detailed clinical guidance. PBS Schedule should be checked for prescribing restrictions.`;
}
