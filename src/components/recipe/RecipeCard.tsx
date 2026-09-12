import React, { useState } from 'react';
import type { Recipe } from '../../types';
import { Card } from '../common/Card';
import { MatchScoreBadge } from './MatchScoreBadge';
import { Badge } from '../common/Badge';
import { Clock, Star, Bookmark, UtensilsCrossed, Sparkles } from 'lucide-react';
import { usePantry } from '../../context/PantryContext';

export interface RecipeCardProps {
  recipe: Recipe;
  onSelect?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect
}) => {
  const { isRecipeSaved, toggleSaveRecipe, setSelectedRecipe } = usePantry();
  const isSaved = isRecipeSaved(recipe.id);
  const [imageFailed, setImageFailed] = useState(false);

  const totalTime = recipe.cookingTime || (recipe.prepTimeMinutes + recipe.cookTimeMinutes) || 25;
  const displayImage = recipe.image || recipe.imageUrl;
  const missingCount = (recipe.totalIngredientsCount || recipe.ingredients.length) - (recipe.matchedCount || 0);
  const isAiGenerated = recipe.source === 'ai_generated';

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(recipe);
    } else {
      setSelectedRecipe(recipe);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveRecipe(recipe.id, recipe);
  };

  return (
    <Card
      variant="interactive"
      onClick={handleCardClick}
      className="group flex flex-col h-full bg-surface-card transition-all duration-200 border border-border-theme hover:border-border-strong rounded-3xl overflow-hidden shadow-card hover:shadow-elevated active:scale-[0.985] touch-manipulation"
    >
      {/* Recipe Thumbnail Container */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-bg-secondary flex items-center justify-center">
        {displayImage && !imageFailed ? (
          <img
            src={displayImage}
            alt={recipe.name || recipe.title}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : isAiGenerated ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-spice-500/10 via-amber-500/10 to-herb-500/10 p-5 text-center">
            <div className="w-11 h-11 rounded-2xl bg-accent-soft text-accent-primary flex items-center justify-center mb-1.5 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-accent-primary tracking-wide uppercase">AI Chef Recipe</span>
            <span className="text-xs text-text-muted mt-0.5 line-clamp-1">{recipe.cuisine}</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-bg-secondary p-5 text-center text-text-muted">
            <UtensilsCrossed className="w-8 h-8 mb-1.5 opacity-40 text-text-muted" />
            <span className="text-xs font-medium text-text-muted">Image unavailable</span>
          </div>
        )}

        {/* Overlay gradient only when image is rendered (subtle, beautiful) */}
        {displayImage && !imageFailed && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
        )}

        {/* Top Left: Match Badge or AI Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {isAiGenerated ? (
            <span className="bg-accent-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              AI Generated
            </span>
          ) : recipe.matchScore !== undefined && recipe.matchScore > 0 ? (
            <MatchScoreBadge score={recipe.matchScore} />
          ) : null}
        </div>

        {/* Top Right: Bookmark Button (Comfortable min 44x44px touch target) */}
        <button
          type="button"
          onClick={handleBookmarkClick}
          aria-label={isSaved ? 'Remove bookmark' : 'Save recipe'}
          className="absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] rounded-full bg-surface-card/90 backdrop-blur-md flex items-center justify-center text-text-primary hover:text-accent-primary transition-all shadow-card active:scale-90 z-10 touch-manipulation border border-border-theme/40"
        >
          <Bookmark
            className={`w-4 h-4 transition-colors ${
              isSaved ? 'fill-accent-primary text-accent-primary' : 'text-text-secondary'
            }`}
          />
        </button>

        {/* Bottom image overlay stats */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-medium drop-shadow-sm z-10">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-white" />
            <span>{totalTime} mins</span>
          </div>

          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{recipe.rating || 4.7}</span>
          </div>
        </div>
      </div>

      {/* Recipe Body Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-3">
        <div>
          {/* Cuisine & Difficulty */}
          <div className="flex items-center justify-between text-[11px] text-text-muted font-bold uppercase tracking-wider mb-1">
            <span>{recipe.cuisine}</span>
            <span className="text-border-strong">•</span>
            <span className="text-accent-primary">{recipe.difficulty || 'Easy'}</span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-text-primary line-clamp-1 group-hover:text-accent-primary transition-colors leading-snug">
            {recipe.name || recipe.title}
          </h3>

          {/* Subtitle / Description */}
          <p className="text-text-secondary text-xs sm:text-sm line-clamp-2 mt-1 leading-relaxed">
            {recipe.subtitle || recipe.description}
          </p>
        </div>

        {/* Tags & Missing Ingredients Bar */}
        <div className="pt-2 border-t border-border-theme flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {(recipe.dietaryTags || recipe.tags || []).slice(0, 2).map((tag) => (
              <Badge key={tag} variant="subtle" size="sm" className="truncate text-[10px] py-0.5">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="shrink-0 text-right">
            {recipe.matchScore !== undefined ? (
              missingCount <= 0 ? (
                <span className="text-[11px] font-bold text-color-secondary bg-color-secondary-soft px-2 py-0.5 rounded-full border border-color-secondary/20">
                  Ready to cook
                </span>
              ) : (
                <span className="text-[11px] font-medium text-color-text-secondary bg-color-bg-secondary px-2 py-0.5 rounded-full border border-color-border">
                  Missing {missingCount}
                </span>
              )
            ) : recipe.calories ? (
              <span className="text-[11px] font-semibold text-text-muted">
                {recipe.calories} kcal
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
};

