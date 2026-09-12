import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = '7xl'
}) => {
  const maxWMap = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('mx-auto px-3.5 sm:px-6 lg:px-8 pt-2 pb-24 md:pb-12 flex-grow w-full overflow-x-hidden', maxWMap[maxWidth], className)}
    >
      {children}
    </motion.main>
  );
};

