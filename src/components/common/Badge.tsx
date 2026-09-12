import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  variant?: 'default' | 'spice' | 'herb' | 'amber' | 'outline' | 'subtle';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  icon
}) => {
  const variants = {
    default: 'bg-color-bg-secondary text-color-text-secondary border-color-border',
    spice: 'bg-color-accent-soft text-color-accent border-color-accent/20',
    herb: 'bg-color-secondary-soft text-color-secondary border-color-secondary/25',
    amber: 'bg-color-highlight-soft text-color-highlight border-color-highlight/25',
    outline: 'bg-transparent border-color-border text-color-text-secondary',
    subtle: 'bg-color-surface text-color-text-primary shadow-card border-color-border'
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 font-medium rounded-full',
    md: 'text-xs px-3 py-1 font-semibold rounded-full'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
