import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MatchScoreBadgeProps {
  score: number;
  matchedCount?: number;
  totalCount?: number;
  className?: string;
  showDetail?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  matchedCount,
  totalCount,
  className,
  showDetail = false
}) => {
  const isCompleteMatch = score >= 100;
  const isHighMatch = score >= 75 && score < 100;

  let bgClasses = 'bg-color-bg-secondary text-color-text-secondary border-color-border';
  let dotColor = 'bg-color-text-muted';

  if (isCompleteMatch) {
    bgClasses = 'bg-color-secondary-soft text-color-secondary border-color-secondary/25 font-semibold';
    dotColor = 'bg-color-secondary';
  } else if (isHighMatch) {
    bgClasses = 'bg-color-highlight-soft text-color-highlight border-color-highlight/25 font-medium';
    dotColor = 'bg-color-highlight';
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border backdrop-blur-sm shadow-sm transition-all',
        bgClasses,
        className
      )}
    >
      {isCompleteMatch ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-color-secondary shrink-0" />
      ) : isHighMatch ? (
        <Sparkles className="w-3.5 h-3.5 text-color-highlight shrink-0" />
      ) : (
        <span className={cn('w-2 h-2 rounded-full shrink-0', dotColor)} />
      )}

      <span>
        {isCompleteMatch ? '100% Pantry Match' : `${score}% Match`}
      </span>

      {showDetail && matchedCount !== undefined && totalCount !== undefined && (
        <span className="opacity-70 text-[11px] ml-0.5">
          ({matchedCount}/{totalCount})
        </span>
      )}
    </div>
  );
};
