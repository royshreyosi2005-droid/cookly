import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface IngredientTagProps {
  name: string;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const IngredientTag: React.FC<IngredientTagProps> = ({
  name,
  isSelected = false,
  onClick,
  size = 'md'
}) => {
  const sizes = {
    sm: 'text-xs px-2.5 py-1 gap-1',
    md: 'text-sm px-3.5 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-all duration-200 select-none cursor-pointer',
        sizes[size],
        isSelected
          ? 'bg-color-secondary-soft border-color-secondary text-color-secondary shadow-card ring-1 ring-color-secondary/20'
          : 'bg-color-surface border-color-border text-color-text-primary hover:border-color-border-strong hover:bg-color-surface-hover'
      )}
    >
      {isSelected ? (
        <Check className="w-3.5 h-3.5 text-color-secondary stroke-[2.5]" />
      ) : (
        <Plus className="w-3.5 h-3.5 text-color-text-muted" />
      )}
      <span>{name}</span>
    </motion.button>
  );
};
