import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pill, Search, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface Suggestion {
  rxcui: string;
  name: string;
}

interface InteractionResult {
  severity: string;
  description: string;
}

function useDrugAutocomplete() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (query.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=8`);
      const data = await res.json();
      const candidates = data?.approximateGroup?.candidate;
      if (Array.isArray(candidates)) {
        const unique = new Map<string, string>();
        for (const c of candidates) {
          if (c.rxcui && c.name && !unique.has(c.rxcui)) unique.set(c.rxcui, c.name);
        }
        setSuggestions(Array.from(unique, ([rxcui, name]) => ({ rxcui, name })).slice(0, 6));
      } else {
        setSuggestions([]);
      }
    } catch { setSuggestions([]); }
    setLoading(false);
  }, []);

  return { suggestions, loading, search, clear: () => setSuggestions([]) };
}

function DrugSearchField({ label, value, onSelect }: { label: string; value: Suggestion | null; onSelect: (s: Suggestion) => void }) {
  const [text, setText] = useState('');
  const { suggestions, loading, search, clear } = useDrugAutocomplete();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5 relative">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {value ? (
        <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <Pill className="h-4 w-4 text-primary" />
          <span className="flex-1">{value.name}</span>
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => { onSelect(null as any); setText(''); }}>Change</button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder="Type drug name…"
            value={text}
            onChange={e => { setText(e.target.value); search(e.target.value); setOpen(true); }}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
          />
          {loading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
          {open && suggestions.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-auto">
              {suggestions.map(s => (
                <button key={s.rxcui} className="w-full text-left px-3 py-2 text-sm hover:bg-accent truncate" onMouseDown={() => { onSelect(s); setText(s.name); clear(); setOpen(false); }}>
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DrugInteractionsDialog() {
  const [drugA, setDrugA] = useState<Suggestion | null>(null);
  const [drugB, setDrugB] = useState<Suggestion | null>(null);
  const [results, setResults] = useState<InteractionResult[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const checkInteractions = async () => {
    if (!drugA || !drugB) return;
    setChecking(true); setError(''); setResults(null);
    try {
      const res = await fetch(`https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${drugA.rxcui}+${drugB.rxcui}`);
      const data = await res.json();
      const pairs = data?.fullInteractionTypeGroup?.[0]?.fullInteractionType;
      if (Array.isArray(pairs) && pairs.length > 0) {
        const items: InteractionResult[] = [];
        for (const p of pairs) {
          for (const ip of p.interactionPair || []) {
            items.push({ severity: ip.severity || 'Unknown', description: ip.description || 'No details available.' });
          }
        }
        setResults(items.length > 0 ? items : []);
      } else {
        setResults([]);
      }
    } catch {
      setError('Failed to reach NLM API. Please try again.');
    }
    setChecking(false);
  };

  const reset = () => { setDrugA(null); setDrugB(null); setResults(null); setError(''); };

  return (
    <Dialog onOpenChange={open => { if (!open) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Pill className="mr-1.5 h-4 w-4" /> Drug Interactions</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Drug Interaction Checker</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          <DrugSearchField label="Medication 1" value={drugA} onSelect={setDrugA} />
          <DrugSearchField label="Medication 2" value={drugB} onSelect={setDrugB} />
          <Button className="w-full" disabled={!drugA || !drugB || checking} onClick={checkInteractions}>
            {checking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…</> : <><Search className="mr-2 h-4 w-4" /> Check Interactions</>}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {results !== null && (
            <div className="space-y-2 pt-2 border-t">
              {results.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" /> No known interactions found between these medications.
                </div>
              ) : (
                results.map((r, i) => (
                  <div key={i} className="rounded-md border p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${r.severity === 'high' ? 'text-destructive' : 'text-amber-500'}`} />
                      <span className="text-sm font-semibold capitalize">{r.severity} Severity</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
