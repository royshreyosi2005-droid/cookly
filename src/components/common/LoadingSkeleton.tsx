import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-bg-secondary rounded-2xl animate-pulse',
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-surface-card/40 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  );
};

export const RecipeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-card rounded-3xl border border-border-theme overflow-hidden shadow-card">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-2 flex items-center justify-between border-t border-border-theme">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const PantryListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-2xl" />
      ))}
    </div>
  );
};
