import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, ShoppingBag, Leaf, Sparkles } from 'lucide-react';
import { usePantry } from '../../context/PantryContext';
import { cn } from '../../utils/cn';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { selectedIngredients } = usePantry();

  const tabs = [
    {
      label: 'Home',
      path: '/',
      icon: Home
    },
    {
      label: 'Discover',
      path: '/discover',
      icon: Compass
    },
    {
      label: 'Pantry',
      path: '/pantry',
      icon: ShoppingBag,
      badge: selectedIngredients.length > 0 ? selectedIngredients.length : undefined
    },
    {
      label: 'Healthy',
      path: '/healthy-picks',
      icon: Leaf,
      activeColor: 'text-herb-700'
    },
    {
      label: 'AI Chef',
      path: '/ai-chef',
      icon: Sparkles,
      isHighlight: true
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border-theme pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
      <nav className="flex items-center justify-around px-1 py-1.5 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.label}
              to={tab.path}
              className={cn(
                'flex flex-col items-center justify-center relative py-1.5 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[48px] touch-manipulation',
                isActive
                  ? tab.label === 'Healthy'
                    ? 'text-color-secondary font-bold'
                    : 'text-color-accent font-bold'
                  : tab.isHighlight
                  ? 'text-color-accent font-semibold hover:text-color-accent-hover'
                  : 'text-color-text-muted hover:text-color-text-primary font-medium'
              )}
            >
              {/* Active subtle pill highlight indicator */}
              {isActive && (
                <span className={cn(
                  'absolute inset-x-1.5 top-0.5 bottom-0.5 rounded-xl -z-10 transition-all duration-200',
                  tab.label === 'Healthy' ? 'bg-color-secondary-soft' : 'bg-color-accent-soft'
                )} />
              )}

              <div className="relative flex items-center justify-center">
                <tab.icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200',
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  )}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-3 bg-accent-primary text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border-2 border-surface-card shadow-xs">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] sm:text-[11px] mt-1 tracking-tight leading-tight',
                isActive ? 'font-bold' : 'font-medium'
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

