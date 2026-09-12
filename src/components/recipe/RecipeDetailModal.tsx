import React, { useState } from 'react';
import type { Recipe } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchScoreBadge } from './MatchScoreBadge';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Clock, Users, Flame, Bookmark, Check, X, ChefHat, Sparkles, Dumbbell, Wheat, ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { usePantry } from '../../context/PantryContext';
import { useShoppingList } from '../../context/ShoppingListContext';
import { useProfile } from '../../context/ProfileContext';

export interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose
}) => {
  const { isRecipeSaved, toggleSaveRecipe } = usePantry();
  const { addMissingFromRecipe, addItem } = useShoppingList();
  const { addCookingHistory } = useProfile();
  const [imageFailed, setImageFailed] = useState(false);
  const [addedToShoppingList, setAddedToShoppingList] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');

  React.useEffect(() => {
    if (recipe) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [recipe]);

  const isSaved = recipe ? isRecipeSaved(recipe.id) : false;
  const totalTime = recipe ? (recipe.cookingTime || (recipe.prepTimeMinutes + recipe.cookTimeMinutes) || 25) : 25;
  const displayImage = recipe ? (recipe.image || recipe.imageUrl) : undefined;
  const displayName = recipe ? (recipe.name || recipe.title) : '';
  const isAiGenerated = recipe?.source === 'ai_generated';

  return (
    <AnimatePresence>
      {recipe && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

        {/* Modal / Sheet Container */}
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-surface-card rounded-t-3xl sm:rounded-3xl shadow-elevated border-t sm:border border-border-theme overflow-hidden z-10 h-[92dvh] sm:h-auto sm:max-h-[88vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Sheet Drag Indicator Bar */}
          <div className="sm:hidden w-12 h-1.5 bg-border-strong rounded-full mx-auto my-2 shrink-0" />

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto flex-grow pb-24 scroll-smooth">
            {/* Header Media */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-bg-secondary flex items-center justify-center">
              {displayImage && !imageFailed ? (
                <img
                  src={displayImage}
                  alt={displayName}
                  onError={() => setImageFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : isAiGenerated ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-spice-500/20 via-amber-500/20 to-herb-500/20 p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent-primary flex items-center justify-center mb-2 shadow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-accent-primary tracking-wide uppercase">AI Chef Custom Recipe</span>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-bg-secondary p-6 text-center text-text-muted">
                  <ChefHat className="w-10 h-10 mb-2 opacity-40 text-text-muted" />
                  <span className="text-xs font-medium text-text-muted">Image unavailable</span>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30" />

              {/* Floating Top Action Bar on Image */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="min-w-[44px] min-h-[44px] rounded-full bg-surface-card/90 backdrop-blur-md flex items-center justify-center text-text-primary hover:text-accent-primary transition-all shadow-card active:scale-95 touch-manipulation border border-border-theme/40"
                >
                  <ArrowLeft className="w-5 h-5 sm:hidden" />
                  <X className="w-5 h-5 hidden sm:block" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSaveRecipe(recipe.id, recipe)}
                    aria-label={isSaved ? 'Remove from saved' : 'Save recipe'}
                    className="min-w-[44px] min-h-[44px] rounded-full bg-surface-card/90 backdrop-blur-md flex items-center justify-center text-text-primary hover:text-accent-primary transition-all shadow-card active:scale-95 touch-manipulation border border-border-theme/40"
                  >
                    <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-accent-primary text-accent-primary' : 'text-text-secondary'}`} />
                  </button>
                </div>
              </div>

              {/* Bottom Title inside Hero Image */}
              <div className="absolute bottom-4 inset-x-4 sm:inset-x-6 text-white z-10">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[11px] uppercase tracking-wider font-bold bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white">
                    {recipe.cuisine} • {recipe.difficulty || 'Easy'}
                  </span>
                  {recipe.matchScore !== undefined && recipe.matchScore > 0 && (
                    <MatchScoreBadge score={recipe.matchScore} />
                  )}
                </div>
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-sm">
                  {displayName}
                </h2>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              {/* Recipe Meta stats bar */}
              <div className="grid grid-cols-4 gap-1.5 p-2.5 border border-border-theme text-center bg-bg-secondary/60 rounded-2xl">
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="flex items-center text-text-muted text-[10px] sm:text-xs mb-0.5">
                    <Clock className="w-3 h-3 mr-1 text-text-muted" />
                    <span>Time</span>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-text-primary">{totalTime}m</span>
                </div>

                <div className="flex flex-col items-center justify-center p-1 border-l border-border-theme">
                  <div className="flex items-center text-text-muted text-[10px] sm:text-xs mb-0.5">
                    <Flame className="w-3 h-3 mr-1 text-color-warning" />
                    <span>Cals</span>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-text-primary">{recipe.calories || 350}</span>
                </div>

                <div className="flex flex-col items-center justify-center p-1 border-l border-border-theme">
                  <div className="flex items-center text-text-muted text-[10px] sm:text-xs mb-0.5">
                    <Dumbbell className="w-3 h-3 mr-1 text-color-secondary" />
                    <span>Protein</span>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-color-secondary">{recipe.proteinGrams || 18}g</span>
                </div>

                <div className="flex flex-col items-center justify-center p-1 border-l border-border-theme">
                  <div className="flex items-center text-text-muted text-[10px] sm:text-xs mb-0.5">
                    {recipe.fiberGrams ? (
                      <>
                        <Wheat className="w-3 h-3 mr-1 text-color-secondary" />
                        <span>Fiber</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-3 h-3 mr-1 text-text-muted" />
                        <span>Servings</span>
                      </>
                    )}
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-text-primary">
                    {recipe.fiberGrams ? `${recipe.fiberGrams}g` : `${recipe.servings || 2}`}
                  </span>
                </div>
              </div>

              {/* Nutritional Benefits highlight pills if available */}
              {recipe.nutritionalBenefits && recipe.nutritionalBenefits.length > 0 && (
                <div className="p-3 rounded-2xl bg-color-secondary-soft border border-color-secondary/25 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-color-secondary block">
                    Health Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.nutritionalBenefits.map((benefit, i) => (
                      <span key={i} className="text-xs font-semibold bg-color-surface text-color-secondary border border-color-secondary/25 px-2.5 py-0.5 rounded-full shadow-2xs">
                        ✓ {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                  {recipe.description}
                </p>
              </div>

              {/* Dietary tags */}
              <div className="flex flex-wrap gap-1.5">
                {(recipe.tags || []).map((tag) => (
                  <Badge key={tag} variant="subtle" size="sm" className="text-[11px]">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Chef Tip Callout */}
              {recipe.chefTip && (
                <div className="p-3.5 rounded-2xl bg-color-highlight-soft border border-color-highlight/25 flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-xl bg-color-highlight/20 text-color-highlight flex items-center justify-center shrink-0 mt-0.5">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-color-highlight mb-0.5">
                      Chef's Secret
                    </h4>
                    <p className="text-xs sm:text-sm text-text-primary leading-normal italic font-serif">
                      "{recipe.chefTip}"
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile Tab Toggle between Ingredients & Steps */}
              <div className="flex p-1 bg-bg-secondary rounded-2xl border border-border-theme">
                <button
                  type="button"
                  onClick={() => setActiveTab('ingredients')}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'ingredients'
                      ? 'bg-surface-card text-text-primary shadow-card'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Ingredients ({recipe.ingredients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('instructions')}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'instructions'
                      ? 'bg-surface-card text-text-primary shadow-card'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Steps ({recipe.instructions.length})
                </button>
              </div>

              {/* Ingredients View */}
              {activeTab === 'ingredients' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-text-muted font-medium px-1">
                    <span>Pantry Availability:</span>
                    <span>
                      {recipe.matchedCount || 0} of {recipe.totalIngredientsCount || recipe.ingredients.length} in pantry
                    </span>
                  </div>

                  {/* Add Missing Ingredients Banner */}
                  {recipe.ingredients.some(ing => !ing.inPantry) && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-accent-soft border border-accent-primary/20 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center shrink-0">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-accent-primary">
                          {recipe.ingredients.filter(i => !i.inPantry).length} missing from pantry
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addMissingFromRecipe(recipe);
                          setAddedToShoppingList(true);
                          setTimeout(() => setAddedToShoppingList(false), 2500);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all active:scale-95 shadow-2xs flex items-center gap-1"
                      >
                        {addedToShoppingList ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to List</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2">
                    {recipe.ingredients.map((ingredient, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-2xl border text-xs sm:text-sm transition-colors ${
                          ingredient.inPantry
                            ? 'bg-color-secondary-soft border-color-secondary/25 text-color-text-primary'
                            : 'bg-color-surface border-color-border text-color-text-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              ingredient.inPantry
                                ? 'bg-color-secondary text-white'
                                : 'bg-color-bg-secondary text-color-text-muted'
                            }`}
                          >
                            {ingredient.inPantry ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <X className="w-3 h-3 stroke-[2.5]" />
                            )}
                          </div>
                          <span className={`font-medium truncate ${ingredient.inPantry ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>
                            {ingredient.name}
                            {ingredient.isOptional && (
                              <span className="text-[11px] text-text-muted ml-1 font-normal">(optional)</span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-xs text-text-muted font-bold">
                            {ingredient.amount}
                          </span>
                          {!ingredient.inPantry && (
                            <button
                              type="button"
                              onClick={() => addItem(ingredient.name, ingredient.amount, ingredient.unit || 'pcs', 'Recipe Ingredients', recipe.name || recipe.title)}
                              title={`Add ${ingredient.name} to Shopping List`}
                              className="w-6 h-6 rounded-lg bg-bg-secondary hover:bg-accent-soft text-text-muted hover:text-accent-primary flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions View */}
              {activeTab === 'instructions' && (
                <div className="space-y-3">
                  {recipe.instructions.map((step) => (
                    <div
                      key={step.step}
                      className="flex gap-3 p-3.5 rounded-2xl bg-surface-card border border-border-theme shadow-2xs"
                    >
                      <div className="w-7 h-7 rounded-full bg-accent-soft text-accent-primary font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {step.step}
                      </div>
                      <div className="space-y-0.5">
                        {step.title && (
                          <h4 className="text-xs sm:text-sm font-bold text-text-primary">
                            {step.title}
                          </h4>
                        )}
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                          {step.instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Action Bar with Safe Area */}
          <div className="absolute bottom-0 inset-x-0 bg-surface-card/95 backdrop-blur-xl border-t border-border-theme p-3 sm:p-4 pb-safe flex items-center justify-between gap-3 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] z-30">
            <button
              type="button"
              onClick={() => toggleSaveRecipe(recipe.id, recipe)}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm border flex items-center justify-center gap-2 transition-colors min-h-[46px] touch-manipulation ${
                isSaved
                  ? 'bg-accent-soft text-accent-primary border-accent-primary/30'
                  : 'bg-bg-secondary text-text-primary border-border-theme hover:bg-surface-hover'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved in Cookbook' : 'Save Recipe'}</span>
            </button>

            <Button
              variant="spice"
              size="lg"
              onClick={() => {
                addCookingHistory(recipe);
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm min-h-[46px] shadow-lift touch-manipulation justify-center"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Start Cooking</span>
            </Button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

