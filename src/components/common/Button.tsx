import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'spice' | 'herb';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  const variants = {
    primary: 'bg-color-accent hover:bg-color-accent-hover text-white shadow-card hover:shadow-elevated',
    spice: 'bg-color-accent hover:bg-color-accent-hover text-white shadow-card hover:shadow-elevated',
    herb: 'bg-color-secondary hover:opacity-90 text-white shadow-card',
    secondary: 'bg-color-secondary-soft hover:opacity-90 text-color-secondary border border-color-secondary/20 shadow-sm font-medium',
    outline: 'border border-color-border hover:border-color-border-strong bg-transparent text-color-text-primary hover:bg-color-surface-hover',
    ghost: 'bg-transparent hover:bg-color-surface-hover text-color-text-secondary hover:text-color-text-primary'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    icon: 'p-2.5 rounded-full'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
      ) : null}
      {children}
    </motion.button>
  );
};
