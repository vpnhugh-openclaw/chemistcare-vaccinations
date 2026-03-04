import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pill, Search, Loader2, ExternalLink } from 'lucide-react';

interface Suggestion {
  rxcui: string;
  name: string;
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

function buildDrugsComUrl(drugA: Suggestion, drugB: Suggestion) {
  const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `https://www.drugs.com/interactions-check.php?drug_list=${encodeURIComponent(toSlug(drugA.name))},${encodeURIComponent(toSlug(drugB.name))}`;
}

export function DrugInteractionsDialog() {
  const [drugA, setDrugA] = useState<Suggestion | null>(null);
  const [drugB, setDrugB] = useState<Suggestion | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const checkInteractions = () => {
    if (!drugA || !drugB) return;
    const url = buildDrugsComUrl(drugA, drugB);
    setIframeBlocked(false);
    setIframeUrl(url);
  };

  const handleIframeError = () => {
    if (iframeUrl) {
      setIframeBlocked(true);
      window.open(iframeUrl, '_blank', 'noopener');
    }
  };

  const reset = () => { setDrugA(null); setDrugB(null); setIframeUrl(null); setIframeBlocked(false); };

  return (
    <Dialog onOpenChange={open => { if (!open) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Pill className="mr-1.5 h-4 w-4" /> Drug Interactions</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Drug Interaction Checker</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 flex-1 overflow-y-auto pr-1 min-h-0">
          <DrugSearchField label="Medication 1" value={drugA} onSelect={setDrugA} />
          <DrugSearchField label="Medication 2" value={drugB} onSelect={setDrugB} />
          <div className="flex items-center gap-2">
            <Button className="flex-1" disabled={!drugA || !drugB} onClick={checkInteractions}>
              <Search className="mr-2 h-4 w-4" /> Check Interactions
            </Button>
            {iframeUrl && (
              <Button variant="outline" size="icon" onClick={() => window.open(iframeUrl, '_blank', 'noopener')} title="Open in new tab">
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>

          {iframeUrl && !iframeBlocked && (
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              className="w-full rounded-md border"
              style={{ minHeight: '600px' }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title="Drug Interaction Results"
              onError={handleIframeError}
              onLoad={() => {
                // Detect X-Frame-Options block: if iframe body is empty after load, fall back
                try {
                  const doc = iframeRef.current?.contentDocument;
                  if (doc && doc.body && doc.body.innerHTML === '') {
                    handleIframeError();
                  }
                } catch {
                  // Cross-origin — iframe loaded content, which means it wasn't blocked
                }
              }}
            />
          )}

          {iframeBlocked && iframeUrl && (
            <div className="rounded-md border border-dashed p-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                The interaction results could not be displayed inline due to site restrictions.
              </p>
              <Button variant="outline" onClick={() => window.open(iframeUrl, '_blank', 'noopener')}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open Results in New Tab
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
