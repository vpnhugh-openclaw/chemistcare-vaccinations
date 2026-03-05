import { useState, useMemo } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { listAudit, type AuditEntry } from '@/lib/auditStore';
import { Search, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

const Audit = () => {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const entries = useMemo(() => {
    return listAudit({
      search: search || undefined,
      from: fromDate ? new Date(fromDate).toISOString() : undefined,
      to: toDate ? new Date(toDate + 'T23:59:59').toISOString() : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, fromDate, toDate, refreshKey]);

  const severityForAction = (action: string) => {
    if (action.includes('blocker') || action.includes('failed')) return 'destructive';
    if (action.includes('override') || action.includes('warning')) return 'secondary';
    return 'outline';
  };

  return (
    <ClinicalLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Audit Log</h1>
            <p className="text-sm text-muted-foreground mt-1">Full audit trail of clinical decisions and system events</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by action, consult ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-40" placeholder="From" />
              <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-40" placeholder="To" />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{entries.length} event{entries.length !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {entries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No audit entries found. Clinical actions will appear here automatically.</p>
              </div>
            ) : (
              <div className="divide-y">
                {entries.map(entry => (
                  <div key={entry.id} className="px-4 py-3">
                    <button
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      className="w-full flex items-center gap-3 text-left"
                    >
                      {expandedId === entry.id ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                        <Badge variant={severityForAction(entry.action)} className="text-[10px] shrink-0">
                          {entry.action.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">
                          {entry.consultId !== 'n/a' ? `Consult: ${entry.consultId.slice(0, 8)}…` : ''}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {new Date(entry.at).toLocaleString('en-AU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </button>
                    {expandedId === entry.id && entry.details && Object.keys(entry.details).length > 0 && (
                      <div className="mt-2 ml-7">
                        <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClinicalLayout>
  );
};

export default Audit;
