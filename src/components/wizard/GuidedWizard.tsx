import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';

export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  schema: z.ZodSchema;
  component: React.ReactNode;
  /** If true, show "Skip" instead of disabling Next */
  optional?: boolean;
  /** Override the submit button label on the final step */
  submitLabel?: string;
}

interface GuidedWizardProps {
  steps: WizardStep[];
  onComplete: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  storageKey?: string;
  /** If true, Esc key triggers Back (staff portal). If false, Esc does nothing (public). */
  allowEsc?: boolean;
  /** Merged form data — wizard reads/writes to this */
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
  /** Optional class for the wrapper */
  className?: string;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function GuidedWizard({
  steps,
  onComplete,
  onCancel,
  storageKey,
  allowEsc = false,
  data,
  onDataChange,
  className,
}: GuidedWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  // Validate current step
  const isValid = (() => {
    try {
      step.schema.parse(data);
      return true;
    } catch {
      return false;
    }
  })();

  // Persist to localStorage
  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ step: currentStep, data }));
      } catch { /* quota */ }
    }
  }, [storageKey, currentStep, data]);

  // Restore from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.data) onDataChange(parsed.data);
          if (typeof parsed.step === 'number' && parsed.step < steps.length) setCurrentStep(parsed.step);
        }
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goNext = useCallback(() => {
    if (isLast) {
      if (storageKey) localStorage.removeItem(storageKey);
      onComplete(data);
    } else {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [isLast, data, onComplete, storageKey]);

  const goBack = useCallback(() => {
    if (isFirst) {
      onCancel();
    } else {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirst, onCancel]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const active = document.activeElement;
        if (active?.tagName === 'TEXTAREA') return;
        if (isValid) {
          e.preventDefault();
          goNext();
        }
      }
      if (e.key === 'Escape' && allowEsc) {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isValid, goNext, goBack, allowEsc]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div ref={containerRef} className={cn('flex flex-col h-full', className)}>
      {/* Progress header */}
      <div className="shrink-0 space-y-2 mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  i <= currentStep ? 'bg-primary' : 'bg-muted',
                )}
              />
            ))}
          </div>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{step.title}</h2>
            {step.subtitle && (
              <p className="text-sm text-muted-foreground mb-6">{step.subtitle}</p>
            )}
            {!step.subtitle && <div className="mb-6" />}
            {step.component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation footer */}
      <div className="shrink-0 flex items-center justify-between pt-6 border-t mt-6">
        <Button variant="outline" onClick={goBack} size="sm" className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          {isFirst ? 'Cancel' : 'Back'}
        </Button>
        <Button
          onClick={goNext}
          disabled={!isValid && !step.optional}
          size="sm"
          className="gap-1.5"
        >
          {isLast ? (step.submitLabel || 'Submit') : 'Next'}
          {!isLast && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
