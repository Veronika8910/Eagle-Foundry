import * as React from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = inputId ? `${inputId}-error` : undefined;
    const hintId = inputId ? `${inputId}-hint` : undefined;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium uppercase tracking-[0.12em] text-[var(--foreground)]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'w-full rounded-xl border bg-[#DEDEDE]/60 dark:bg-[#030303]/60 px-3.5 py-2.5 text-sm text-[var(--muted)] placeholder:text-zinc-600 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-1 focus:ring-offset-black',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-red-500/50' : 'border-black/40 dark:border-white/40 hover:border-black/20 dark:hover:border-white/20',
            className,
          )}
          {...props}
        />
        {error && <p id={errorId} className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p id={hintId} className="text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
