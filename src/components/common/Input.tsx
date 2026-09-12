import React from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', leftIcon, rightIcon, onClear, error, label, value, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 pointer-events-none text-text-muted flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            value={value}
            className={cn(
              'w-full bg-surface-card text-text-primary placeholder:text-text-muted text-sm font-medium rounded-2xl border border-border-theme px-4 py-3 transition-all duration-200 focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 shadow-card',
              leftIcon ? 'pl-11' : '',
              rightIcon || (onClear && value) ? 'pr-11' : '',
              error ? 'border-status-error focus:border-status-error focus:ring-status-error/10' : '',
              className
            )}
            {...props}
          />

          {onClear && value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3.5 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {!onClear && rightIcon && (
            <div className="absolute right-4 pointer-events-none text-text-muted flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
