import { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, PencilBrush, CircleBrush } from 'fabric';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pen, Highlighter, Eraser, Palette, Undo2, Trash2, X, Download, Save,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast as sonnerToast } from 'sonner';

interface SketchPadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (dataUrl: string) => void;
}

const COLORS = [
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Blue', value: '#1D6FA4' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Green', value: '#16A34A' },
];

type Tool = 'pen' | 'highlighter' | 'eraser';

export function SketchPad({ open, onOpenChange, onSave }: SketchPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [activeColor, setActiveColor] = useState('#1a1a1a');
  const [strokeWidth, setStrokeWidth] = useState([3]);
  const [hasContent, setHasContent] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const penDetected = useRef(false);

  // Initialize canvas
  useEffect(() => {
    if (!open || !canvasRef.current) return;

    const timer = setTimeout(() => {
      if (!canvasRef.current) return;

      const canvas = new Canvas(canvasRef.current, {
        isDrawingMode: true,
        width: 700,
        height: 460,
        backgroundColor: 'transparent',
      });

      const brush = new PencilBrush(canvas);
      brush.color = activeColor;
      brush.width = strokeWidth[0];
      canvas.freeDrawingBrush = brush;

      canvas.on('path:created', () => {
        setHasContent(true);
      });

      // Palm rejection: disable touch drawing when pen is detected
      const el = canvas.getSelectionElement();
      if (el) {
        el.addEventListener('pointerdown', (e: PointerEvent) => {
          if (e.pointerType === 'pen') {
            penDetected.current = true;
          }
          if (penDetected.current && e.pointerType === 'touch') {
            e.preventDefault();
            e.stopPropagation();
            canvas.isDrawingMode = false;
          } else {
            canvas.isDrawingMode = true;
          }
        }, { passive: false });

        el.addEventListener('pointerup', () => {
          canvas.isDrawingMode = true;
        });
      }

      fabricRef.current = canvas;

      return () => {
        canvas.dispose();
        fabricRef.current = null;
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [open]);

  // Update brush on tool/color/width change
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (activeTool === 'eraser') {
      const brush = new PencilBrush(canvas);
      brush.color = '#FFF176';
      brush.width = Math.max(strokeWidth[0] * 3, 20);
      canvas.freeDrawingBrush = brush;
    } else if (activeTool === 'highlighter') {
      const brush = new PencilBrush(canvas);
      brush.color = 'rgba(255,235,59,0.35)';
      brush.width = Math.max(strokeWidth[0] * 4, 24);
      canvas.freeDrawingBrush = brush;
    } else {
      const brush = new PencilBrush(canvas);
      brush.color = activeColor;
      brush.width = strokeWidth[0];
      canvas.freeDrawingBrush = brush;
    }
  }, [activeTool, activeColor, strokeWidth]);

  const handleUndo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
      if (canvas.getObjects().length === 0) setHasContent(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = 'transparent';
    canvas.renderAll();
    setHasContent(false);
  }, []);

  const getDataUrl = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return '';
    return canvas.toDataURL({ format: 'png', multiplier: 2 });
  }, []);

  const handleSave = useCallback(() => {
    const dataUrl = getDataUrl();
    if (dataUrl && onSave) {
      onSave(dataUrl);
      sonnerToast.success('Sketch saved to patient profile ✓', { duration: 3000, position: 'bottom-right' });
    }
    setHasContent(false);
    onOpenChange(false);
  }, [getDataUrl, onSave, onOpenChange]);

  const handleDownload = useCallback(() => {
    const dataUrl = getDataUrl();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `sketch-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
    sonnerToast.success('Sketch downloaded', { duration: 2000, position: 'bottom-right' });
  }, [getDataUrl]);

  const handleClose = useCallback(() => {
    if (hasContent) {
      setShowConfirm(true);
    } else {
      onOpenChange(false);
    }
  }, [hasContent, onOpenChange]);

  // Drag handlers
  const onDragStart = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, [isDragging]);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Generate ruled lines for the notepad
  const ruledLines = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="absolute left-0 right-0 border-b"
      style={{
        top: `${(i + 1) * 24}px`,
        borderColor: 'rgba(180, 160, 100, 0.18)',
      }}
    />
  ));

  if (!open) return null;

  return (
    <>
      {/* Custom positioned modal overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={handleClose}>
        <div
          className="relative"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Sticky note container */}
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background: '#FFF176',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
              minWidth: '760px',
            }}
          >
            {/* Drag handle / header */}
            <div
              className="flex items-center justify-between px-4 py-2.5 cursor-grab active:cursor-grabbing select-none"
              style={{ background: 'rgba(0,0,0,0.06)' }}
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
            >
              <span className="text-sm font-bold" style={{ color: '#5D4E0B' }}>✏️ Sketch Pad</span>

              {/* Toolbar */}
              <div className="flex items-center gap-1.5">
                {/* Tools */}
                <ToolButton
                  active={activeTool === 'pen'}
                  onClick={() => setActiveTool('pen')}
                  title="Pen"
                >
                  <Pen className="h-3.5 w-3.5" />
                </ToolButton>
                <ToolButton
                  active={activeTool === 'highlighter'}
                  onClick={() => setActiveTool('highlighter')}
                  title="Highlighter"
                >
                  <Highlighter className="h-3.5 w-3.5" />
                </ToolButton>
                <ToolButton
                  active={activeTool === 'eraser'}
                  onClick={() => setActiveTool('eraser')}
                  title="Eraser"
                >
                  <Eraser className="h-3.5 w-3.5" />
                </ToolButton>

                <div className="w-px h-5 mx-1" style={{ background: 'rgba(0,0,0,0.15)' }} />

                {/* Color palette */}
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${activeColor === c.value ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => { setActiveColor(c.value); setActiveTool('pen'); }}
                    title={c.name}
                  />
                ))}

                <div className="w-px h-5 mx-1" style={{ background: 'rgba(0,0,0,0.15)' }} />

                {/* Stroke width */}
                <div className="w-20">
                  <Slider
                    value={strokeWidth}
                    onValueChange={setStrokeWidth}
                    min={1}
                    max={12}
                    step={1}
                    className="[&>span>span]:bg-amber-800 [&>span]:bg-amber-800/30"
                  />
                </div>

                <div className="w-px h-5 mx-1" style={{ background: 'rgba(0,0,0,0.15)' }} />

                <ToolButton onClick={handleUndo} title="Undo">
                  <Undo2 className="h-3.5 w-3.5" />
                </ToolButton>
                <ToolButton onClick={handleClear} title="Clear">
                  <Trash2 className="h-3.5 w-3.5" />
                </ToolButton>

                <div className="w-px h-5 mx-1" style={{ background: 'rgba(0,0,0,0.15)' }} />

                {/* Close */}
                <button
                  className="p-1 rounded-full hover:bg-black/10 transition-colors"
                  onClick={handleClose}
                  title="Close"
                >
                  <X className="h-4 w-4" style={{ color: '#5D4E0B' }} />
                </button>
              </div>
            </div>

            {/* Canvas area with ruled lines */}
            <div className="relative" style={{ background: '#FFF9C4' }}>
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {ruledLines}
              </div>
              <canvas ref={canvasRef} className="relative z-10" style={{ touchAction: 'none' }} />
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ background: 'rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-xs h-7"
                  style={{ color: '#5D4E0B' }}
                  onClick={handleDownload}
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </div>
              <Button
                size="sm"
                className="gap-1.5 text-xs h-7 bg-amber-900 hover:bg-amber-950 text-white"
                onClick={handleSave}
              >
                <Save className="h-3.5 w-3.5" /> Save to Patient Profile
              </Button>
            </div>

            {/* Folded corner effect */}
            <div
              className="absolute bottom-0 right-0 w-0 h-0"
              style={{
                borderStyle: 'solid',
                borderWidth: '0 0 24px 24px',
                borderColor: 'transparent transparent hsl(var(--background)) transparent',
                filter: 'drop-shadow(-1px -1px 1px rgba(0,0,0,0.08))',
              }}
            />
          </div>
        </div>
      </div>

      {/* Unsaved confirmation */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved sketch</AlertDialogTitle>
            <AlertDialogDescription>
              You have an unsaved sketch — save before closing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirm(false);
              setHasContent(false);
              onOpenChange(false);
            }}>
              Discard
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowConfirm(false);
              handleSave();
            }}>
              Save & Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ToolButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? 'bg-amber-900/20 shadow-inner'
          : 'hover:bg-black/10'
      }`}
      style={{ color: '#5D4E0B' }}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
