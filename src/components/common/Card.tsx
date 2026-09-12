import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'flat' | 'interactive' | 'glass';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-surface-card border border-border-theme shadow-card rounded-3xl overflow-hidden transition-colors',
    flat: 'bg-bg-secondary border border-border-theme rounded-3xl overflow-hidden transition-colors',
    interactive: 'bg-surface-card border border-border-theme hover:border-border-strong shadow-card hover:shadow-elevated transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-1',
    glass: 'glass-card border border-border-theme shadow-card rounded-3xl overflow-hidden'
  };

  return (
    <motion.div
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
