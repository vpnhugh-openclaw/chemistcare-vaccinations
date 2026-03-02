import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calculator, RotateCcw, FileDown, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ── Helpers ──
export const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
export const cmToInches = (cm: number) => cm / 2.54;

export const calcCrCl = (age: number, weight: number, scr: number, isFemale: boolean) => {
  const base = ((140 - age) * weight) / (0.813 * scr);
  return isFemale ? base * 0.85 : base;
};

export const calcBSA = (h: number, w: number) => Math.sqrt((h * w) / 3600);

export const calcIBW = (h: number, isFemale: boolean) => {
  const inches = cmToInches(h);
  return isFemale ? 45.5 + 2.3 * (inches - 60) : 50 + 2.3 * (inches - 60);
};

export const calcLBW = (w: number, h: number, isFemale: boolean) =>
  isFemale ? 0.252 * w + 0.473 * h - 48.3 : 0.407 * w + 0.267 * h - 19.2;

// ── Reusable numeric input ──
export interface NumFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  tooltip?: string;
  min?: number;
  max?: number;
}

export function NumField({ label, value, onChange, unit, tooltip, min = 0, max }: NumFieldProps) {
  const numVal = Number(value);
  const invalid = value !== '' && (isNaN(numVal) || numVal <= (min ?? 0) || (max !== undefined && numVal > max));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-sm font-medium">{label}</Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground cursor-help text-xs">ⓘ</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`pr-16 ${invalid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          min={min}
          max={max}
          step="any"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>
      </div>
      {invalid && <p className="text-xs text-destructive">Enter a valid positive number{max ? ` (max ${max})` : ''}</p>}
    </div>
  );
}

// ── Sex picker ──
export function SexPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">Sex</Label>
      <RadioGroup value={value} onValueChange={onChange} className="flex gap-4">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="male" id={`sex-m-${Math.random().toString(36).slice(2, 6)}`} />
          <Label className="text-sm cursor-pointer">Male</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="female" id={`sex-f-${Math.random().toString(36).slice(2, 6)}`} />
          <Label className="text-sm cursor-pointer">Female</Label>
        </div>
      </RadioGroup>
    </div>
  );
}

// ── Result display ──
export function ResultBox({ label, value, unit, formula, children }: {
  label: string;
  value: number | string | null;
  unit: string;
  formula?: string;
  children?: React.ReactNode;
}) {
  if (value === null) return null;
  return (
    <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-2 animate-fade-in">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-sm font-semibold text-foreground">{label}:</span>
        <span className="text-2xl font-bold text-accent">{typeof value === 'number' ? round(value) : value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {formula && <p className="text-xs text-muted-foreground italic">Formula: {formula}</p>}
      {children}
    </div>
  );
}

// ── Multi-line result ──
export function DetailResult({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-3 animate-fade-in">
      {children}
    </div>
  );
}

export function ResultRow({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className="text-sm font-semibold text-foreground">{label}:</span>
      <span className="text-lg font-bold text-accent">{value}</span>
      {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
    </div>
  );
}

export function ResultNote({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground italic">{children}</p>;
}

export function ResultAdvice({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-foreground bg-accent/10 rounded p-2 mt-1">{children}</div>;
}

// ── Section wrapper ──
export function CalcSection({ title, disclaimer, children, onClear, onCalc, result }: {
  title: string;
  disclaimer: string;
  children: React.ReactNode;
  onClear: () => void;
  onCalc: () => void;
  result: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-accent" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5 text-xs text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> Clear all
          </Button>
        </div>
        <p className="text-xs text-muted-foreground italic leading-relaxed mt-1">{disclaimer}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children}
        </div>
        <div className="mt-5">
          <Button onClick={onCalc} className="gap-2">
            <Calculator className="h-4 w-4" /> Calculate
          </Button>
        </div>
        {result}
      </CardContent>
    </Card>
  );
}

// ── Radio Yes/No ──
export function YesNoPicker({ label, value, onChange, id }: { label: string; value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <RadioGroup value={value} onValueChange={onChange} className="flex gap-4">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="no" id={`${id}-no`} />
          <Label htmlFor={`${id}-no`} className="text-sm cursor-pointer">No</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="yes" id={`${id}-yes`} />
          <Label htmlFor={`${id}-yes`} className="text-sm cursor-pointer">Yes</Label>
        </div>
      </RadioGroup>
    </div>
  );
}

// ── Slider-like score picker (1-5) ──
export function ScorePicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5 sm:col-span-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <Button
            key={n}
            type="button"
            variant={value === n ? 'default' : 'outline'}
            size="sm"
            className="w-10 h-10"
            onClick={() => onChange(n)}
          >
            {n}
          </Button>
        ))}
      </div>
    </div>
  );
}

export const ETG_LINK = 'https://www.tg.org.au';
