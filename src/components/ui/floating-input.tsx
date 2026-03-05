import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: boolean;
  valid?: boolean;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, required, error, valid, type, value, ...props }, ref) => {
    const hasValue = value !== undefined && value !== '';
    const isDateType = type === 'date';

    return (
      <div className="relative group">
        <input
          ref={ref}
          type={type}
          value={value}
          className={cn(
            'peer w-full h-12 px-3 pt-5 pb-1.5 text-sm rounded-lg border bg-card text-foreground transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary',
            'placeholder-transparent',
            error ? 'border-clinical-danger focus:ring-clinical-danger/20 focus:border-clinical-danger' : 'border-input',
            valid && !error ? 'border-clinical-safe/50' : '',
            className,
          )}
          placeholder={label}
          {...props}
        />
        <label
          className={cn(
            'absolute left-3 transition-all duration-150 pointer-events-none',
            'text-muted-foreground',
            // Floated state: when focused, has value, or is date type
            (hasValue || isDateType)
              ? 'top-1.5 text-[0.625rem] font-semibold tracking-wide uppercase'
              : 'top-3.5 text-sm',
            'peer-focus:top-1.5 peer-focus:text-[0.625rem] peer-focus:font-semibold peer-focus:tracking-wide peer-focus:uppercase',
            'peer-focus:text-primary',
            error ? 'text-clinical-danger peer-focus:text-clinical-danger' : '',
          )}
        >
          {label}
          {required && <span className="text-clinical-danger ml-0.5">*</span>}
        </label>
        {valid && !error && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-clinical-safe" />
        )}
      </div>
    );
  }
);
FloatingInput.displayName = 'FloatingInput';

interface FloatingSelectWrapperProps {
  label: string;
  required?: boolean;
  hasValue: boolean;
  valid?: boolean;
  error?: boolean;
  children: React.ReactNode;
}

function FloatingSelectWrapper({ label, required, hasValue, valid, error, children }: FloatingSelectWrapperProps) {
  return (
    <div className="relative">
      <div className={cn(
        'relative rounded-lg border bg-card transition-colors',
        error ? 'border-clinical-danger' : 'border-input',
        valid && !error ? 'border-clinical-safe/50' : '',
      )}>
        <div className="pt-5 pb-1 px-0">
          {children}
        </div>
        <label
          className={cn(
            'absolute left-3 pointer-events-none transition-all duration-150',
            hasValue
              ? 'top-1.5 text-[0.625rem] font-semibold tracking-wide uppercase text-muted-foreground'
              : 'top-1.5 text-[0.625rem] font-semibold tracking-wide uppercase text-muted-foreground',
          )}
        >
          {label}
          {required && <span className="text-clinical-danger ml-0.5">*</span>}
        </label>
      </div>
      {valid && !error && (
        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-clinical-safe" />
      )}
    </div>
  );
}

export { FloatingInput, FloatingSelectWrapper };
