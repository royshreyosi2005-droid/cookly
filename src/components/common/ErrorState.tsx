import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an issue while preparing your recipes. Please check your connection and try again.',
  onRetry,
  className
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-md mx-auto bg-accent-soft border border-accent-primary/20 rounded-3xl ${className || ''}`}>
      <div className="w-14 h-14 rounded-2xl bg-accent-soft text-accent-primary flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="font-serif text-xl font-bold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="spice" size="sm" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Try Again
        </Button>
      )}
    </div>
  );
};
