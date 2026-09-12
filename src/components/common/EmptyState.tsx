import React from 'react';
import { ChefHat, Search, Bookmark, ShoppingBag } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  type?: 'search' | 'pantry' | 'saved' | 'general';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'general',
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) => {
  const defaults = {
    search: {
      icon: Search,
      title: 'No matching recipes found',
      description: 'Try adjusting your search terms or unselecting some pantry filters to see more results.',
      actionText: 'Reset Filters'
    },
    pantry: {
      icon: ShoppingBag,
      title: 'Your kitchen pantry is empty',
      description: 'Select ingredients you have at home to uncover culinary ideas tailored specifically to your kitchen.',
      actionText: 'Add Popular Staples'
    },
    saved: {
      icon: Bookmark,
      title: 'No saved recipes yet',
      description: 'Tap the bookmark icon on any recipe to save it to your personal cookbook collection for later.',
      actionText: 'Explore Recipes'
    },
    general: {
      icon: ChefHat,
      title: 'Nothing cooking here yet',
      description: 'We couldn’t find what you were looking for. Let’s try something fresh.',
      actionText: 'Go to Home'
    }
  };

  const current = defaults[type];
  const IconComponent = current.icon;
  const displayTitle = title || current.title;
  const displayDesc = description || current.description;
  const displayAction = actionText || current.actionText;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-md mx-auto bg-surface-card/80 border border-border-theme rounded-3xl backdrop-blur-sm shadow-card">
      <div className="w-16 h-16 rounded-2xl bg-accent-soft text-accent-primary flex items-center justify-center mb-5 shadow-inner">
        <IconComponent className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="font-serif text-2xl font-bold text-text-primary mb-2">
        {displayTitle}
      </h3>
      <p className="text-text-muted text-sm leading-relaxed mb-6">
        {displayDesc}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onAction && displayAction && (
          <Button variant="spice" size="md" onClick={onAction}>
            {displayAction}
          </Button>
        )}
        {onSecondaryAction && secondaryActionText && (
          <Button variant="outline" size="md" onClick={onSecondaryAction}>
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};
