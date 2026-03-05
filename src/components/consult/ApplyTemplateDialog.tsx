import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search } from 'lucide-react';
import { CONSULT_TEMPLATES } from '@/data/templates';
import type { ConsultTemplate } from '@/types/templates';

interface ApplyTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (template: ConsultTemplate) => void;
}

export function ApplyTemplateDialog({ open, onOpenChange, onApply }: ApplyTemplateDialogProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return CONSULT_TEMPLATES;
    const q = search.toLowerCase();
    return CONSULT_TEMPLATES.filter(t =>
      t.name.toLowerCase().includes(q) || t.condition.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Apply Consultation Template
          </DialogTitle>
          <DialogDescription>
            Select a template to pre-fill consultation fields and note headings.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-auto space-y-2 min-h-0">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No templates match your search.</p>
          )}
          {filtered.map(t => (
            <div key={t.id} className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.condition}</p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {t.prefill.treatmentOptions && <Badge variant="secondary" className="text-[10px]">{t.prefill.treatmentOptions.length} treatments</Badge>}
                  {t.prefill.noteHeadings && <Badge variant="outline" className="text-[10px]">{t.prefill.noteHeadings.length} headings</Badge>}
                  {t.jurisdiction && <Badge variant="outline" className="text-[10px]">{t.jurisdiction}</Badge>}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => { onApply(t); onOpenChange(false); }}>
                Apply
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
