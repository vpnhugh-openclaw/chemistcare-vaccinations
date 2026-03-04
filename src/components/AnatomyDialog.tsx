import { useState } from 'react';
import { Bone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AnatomyDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 border-accent/40 text-accent hover:bg-accent/10 hover:text-accent ml-1">
          <Bone className="h-4 w-4" />
          <span className="hidden sm:inline">Anatomy</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[950px] w-[95vw] max-h-[90vh] h-[750px] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="text-base">Anatomy Reference</DialogTitle>
        </DialogHeader>
        <div className="flex-1 px-4 pb-4 min-h-0">
          <iframe
            src="https://www.humanatomy.app/web.html"
            width="100%"
            height="100%"
            className="w-full h-full rounded-md border"
            allow="accelerometer; camera; fullscreen; gyroscope; web-share"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            title="Anatomy Reference"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
