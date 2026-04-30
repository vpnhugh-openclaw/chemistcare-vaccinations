import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, ChevronRight } from 'lucide-react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CONDITION_REGISTRY, type ConditionCategory } from '@/lib/conditionRegistry';

const classificationColors: Record<ConditionCategory, string> = {
  acute: 'clinical-badge-danger',
  chronic: 'clinical-badge-info',
  preventive: 'clinical-badge-safe',
  resupply: 'clinical-badge-warning',
  travel: 'clinical-badge-info',
};

const categories: ConditionCategory[] = ['acute', 'chronic', 'preventive', 'resupply', 'travel'];

const ConditionsLibrary = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ConditionCategory | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => CONDITION_REGISTRY.filter((condition) => {
    const matchesSearch = condition.name.toLowerCase().includes(search.toLowerCase()) || condition.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filter || condition.category === filter;
    return matchesSearch && matchesFilter;
  }), [filter, search]);

  return (
    <ClinicalLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Conditions Library</h1>
          <p className="text-sm text-muted-foreground mt-1">22 supported conditions with protocol-driven templates and consultation routing.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conditions..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(filter === category ? null : category)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${filter === category ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((condition) => (
            <Card key={condition.slug} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/conditions/${condition.slug}`)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold truncate">{condition.name}</h3>
                      <span className={`clinical-badge ${classificationColors[condition.category]}`}>{condition.category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{condition.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-clinical-danger font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        {condition.redFlagCount} red flag{condition.redFlagCount === 1 ? '' : 's'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{condition.treatmentOptionCount} treatment option{condition.treatmentOptionCount === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ClinicalLayout>
  );
};

export default ConditionsLibrary;
