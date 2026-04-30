import { useMemo, useState } from 'react';
import { Search, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONDITION_REGISTRY, getConditionBySlug, getPinnedConditions, type ConditionCategory } from '@/lib/conditionRegistry';
import { getRecentConditionSlugs } from '@/hooks/useConsultation';

const categoryOrder: ConditionCategory[] = ['acute', 'chronic', 'preventive', 'resupply', 'travel'];

const categoryClassNames: Record<ConditionCategory, string> = {
  acute: 'clinical-badge-danger',
  chronic: 'clinical-badge-info',
  preventive: 'clinical-badge-safe',
  resupply: 'clinical-badge-warning',
  travel: 'clinical-badge-info',
};

interface ConditionPickerProps {
  error?: string | null;
  onStart: (conditionSlug: string) => void;
  legacyDraftPending?: boolean;
}

export function ConditionPicker({ error, onStart, legacyDraftPending }: ConditionPickerProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ConditionCategory | null>(null);
  const recentConditions = useMemo(() => getRecentConditionSlugs().map((slug) => getConditionBySlug(slug)).filter(Boolean), []);
  const quickStart = useMemo(() => getPinnedConditions(), []);

  const filtered = useMemo(() => CONDITION_REGISTRY.filter((condition) => {
    const matchesSearch = condition.name.toLowerCase().includes(search.toLowerCase()) || condition.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filter || condition.category === filter;
    return condition.enabled && matchesSearch && matchesFilter;
  }), [filter, search]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">New Consultation</h1>
        <p className="text-sm text-muted-foreground mt-1">Pick the consultation type first. The protocol, validation, workflow, and note template all come from that choice.</p>
      </div>

      {(error || legacyDraftPending) && (
        <Card className="border-clinical-warning bg-clinical-warning-bg">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-clinical-warning mt-0.5" />
            <div className="space-y-1 text-sm">
              {error && <p className="font-medium">Select a consultation type</p>}
              {legacyDraftPending && <p className="text-muted-foreground">A legacy draft was found without a consultation type. Choose the condition before continuing.</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {quickStart.map((condition) => (
            <Card key={condition.slug} className="border-accent/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{condition.name}</p>
                    <span className={`clinical-badge ${categoryClassNames[condition.category]}`}>{condition.category}</span>
                  </div>
                  <Badge variant="secondary">Pinned</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{condition.description}</p>
                <Button onClick={() => onStart(condition.slug)} className="w-full gap-2">
                  Start consultation <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conditions..." className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categoryOrder.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(filter === category ? null : category)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  filter === category ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {recentConditions.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recently Used</h2>
            <div className="flex flex-wrap gap-2">
              {recentConditions.map((condition) => condition && (
                <Button key={condition.slug} variant="outline" size="sm" onClick={() => onStart(condition.slug)}>
                  {condition.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All Conditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((condition) => (
              <Card key={condition.slug}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold truncate">{condition.name}</h3>
                      <span className={`clinical-badge ${categoryClassNames[condition.category]}`}>{condition.category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{condition.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1 text-clinical-danger font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        {condition.redFlagCount} red flag{condition.redFlagCount === 1 ? '' : 's'}
                      </span>
                      <span>{condition.treatmentOptionCount} treatment option{condition.treatmentOptionCount === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => onStart(condition.slug)} className="gap-2 shrink-0">
                    Start consultation <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
