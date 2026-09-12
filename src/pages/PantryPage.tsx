import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { RecipeDetailModal } from '../components/recipe/RecipeDetailModal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { MatchScoreBadge } from '../components/recipe/MatchScoreBadge';
import { usePantry } from '../context/PantryContext';
import { useShoppingList } from '../context/ShoppingListContext';
import type { PantrySearchMode } from '../types';
import {
  ShoppingBag,
  ShoppingCart,
  Plus,
  Trash2,
  Check,
  Clock,
  Bookmark,
  SlidersHorizontal,
  Wand2
} from 'lucide-react';

const COMMON_PANTRY_PRESETS = [
  'Potato',
  'Eggs',
  'Tomato',
  'Chicken',
  'Salmon',
  'Paneer',
  'Tofu',
  'Mushrooms',
  'Spinach',
  'Broccoli',
  'Rice',
  'Pasta',
  'Cheese',
  'Oats',
  'Chickpeas',
  'Lentils',
  'Avocado',
  'Prawns',
  'Garlic',
  'Onion'
];

export const PantryPage: React.FC = () => {
  const {
    selectedIngredients,
    toggleIngredient,
    addIngredient,
    clearAllIngredients,
    parseAndAddFromText,
    pantryMode,
    setPantryMode,
    pantrySortBy,
    setPantrySortBy,
    pantryRecipes,
    isPantryLoading,
    isRecipeSaved,
    toggleSaveRecipe,
    selectedRecipe,
    setSelectedRecipe,
    refreshPantryMatches
  } = usePantry();

  const { totalCount: shoppingCount } = useShoppingList();

  const [customInput, setCustomInput] = useState('');
  const [nlInput, setNlInput] = useState('');
  const [nlMessage, setNlMessage] = useState<string | null>(null);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      addIngredient(customInput.trim());
      setCustomInput('');
    }
  };

  const handleNlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nlInput.trim()) {
      const { included, excluded } = parseAndAddFromText(nlInput);
      if (included.length > 0) {
        setNlMessage(`✓ Added: ${included.join(', ')}${excluded.length > 0 ? ` (Excluded: ${excluded.join(', ')})` : ''}`);
        setTimeout(() => setNlMessage(null), 4000);
      }
      setNlInput('');
    }
  };

  const exactMatches = pantryRecipes.filter(r => (r.matchScore || 0) === 100);
  const highMatches = pantryRecipes.filter(r => (r.matchScore || 0) >= 70 && (r.matchScore || 0) < 100);

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-theme pb-4 pt-1">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-color-secondary bg-color-secondary-soft px-3 py-1 rounded-full mb-1.5 border border-color-secondary/25">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Pantry Matching Engine</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              My Pantry & Fridge
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm mt-0.5 max-w-xl">
              Add what you have at home. Real dishes ranked dynamically by pantry match.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/shopping-list"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-secondary hover:bg-surface-hover text-text-primary border border-border-theme text-xs font-bold transition-colors min-h-[38px]"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-accent-primary" />
              <span>Shopping List</span>
              {shoppingCount > 0 && (
                <span className="bg-accent-primary text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5">
                  {shoppingCount}
                </span>
              )}
            </Link>

            {selectedIngredients.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllIngredients}
                className="text-status-error hover:text-status-error border-status-error/30 hover:bg-status-error/10 rounded-xl text-xs py-1.5 min-h-[38px]"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear ({selectedIngredients.length})
              </Button>
            )}
          </div>
        </div>

        {/* Natural Language Sentence Extraction Bar (One-Hand Friendly) */}
        <div className="p-4 sm:p-5 bg-surface-card rounded-3xl border border-border-theme shadow-card space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent-primary">
            <Wand2 className="w-3.5 h-3.5 text-accent-primary" />
            <span>Type Naturally:</span>
          </div>

          <form onSubmit={handleNlSubmit} className="flex gap-2">
            <Input
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              placeholder="e.g. 'I have eggs, potato and onion'..."
              onClear={() => setNlInput('')}
              className="py-3 bg-surface-card text-xs sm:text-sm shadow-card rounded-2xl border-border-theme"
            />
            <Button type="submit" variant="spice" size="md" className="shrink-0 px-4 rounded-2xl text-xs font-bold min-h-[44px]">
              <span>Extract</span>
            </Button>
          </form>

          {nlMessage && (
            <div className="text-xs text-color-secondary font-semibold bg-color-secondary-soft px-3 py-1.5 rounded-xl border border-color-secondary/25 inline-block">
              {nlMessage}
            </div>
          )}

          {/* Quick Example Prompts (Scrollable on Mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs -mx-1 px-1">
            <span className="text-text-muted font-bold shrink-0 text-[11px] uppercase">Try:</span>
            {[
              'I have eggs, potato and onion',
              'Chicken, rice and tomato',
              'Pasta, garlic and cheese'
            ].map((example) => (
              <button
                key={example}
                onClick={() => {
                  parseAndAddFromText(example);
                  setNlMessage(`✓ Added: "${example}"`);
                  setTimeout(() => setNlMessage(null), 3000);
                }}
                className="px-2.5 py-1 rounded-xl bg-bg-secondary text-text-primary border border-border-theme hover:border-accent-primary/50 transition-all font-medium whitespace-nowrap shadow-2xs touch-manipulation text-xs"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>

        {/* Quick Add Custom Single Ingredient Bar */}
        <div className="bg-surface-card p-4 sm:p-5 rounded-3xl border border-border-theme shadow-card">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
            Add Custom Ingredient:
          </h3>
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <Input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. Potato, Paneer, Salmon, Avocado..."
              onClear={() => setCustomInput('')}
              className="py-3 bg-surface-card text-xs sm:text-sm rounded-2xl border-border-theme"
            />
            <Button type="submit" variant="primary" size="md" className="shrink-0 px-4 rounded-2xl text-xs font-bold min-h-[44px]">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </form>
        </div>

        {/* Selected Summary Pill Cloud (Wrapping Naturally) */}
        {selectedIngredients.length > 0 ? (
          <div className="bg-color-secondary-soft border border-color-secondary/25 p-4 sm:p-5 rounded-3xl space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-color-secondary">
              <span>In-Stock Ingredients ({selectedIngredients.length})</span>
              <span className="text-color-secondary font-normal lowercase">tap to remove</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedIngredients.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleIngredient(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-color-surface text-color-secondary border border-color-secondary/25 hover:bg-status-error/10 hover:text-status-error hover:border-status-error/30 transition-all shadow-card cursor-pointer group min-h-[36px] touch-manipulation"
                >
                  <Check className="w-3.5 h-3.5 text-color-secondary group-hover:hidden" />
                  <span className="w-3.5 h-3.5 text-status-error hidden group-hover:inline font-bold">×</span>
                  <span>{item}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-color-secondary/20">
              <span className="text-[11px] text-color-secondary font-medium">
                {selectedIngredients.length} {selectedIngredients.length === 1 ? 'ingredient' : 'ingredients'} selected
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => refreshPantryMatches()}
                disabled={isPantryLoading}
                className="rounded-2xl text-xs font-bold min-h-[38px] px-4 shadow-card flex items-center justify-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isPantryLoading ? 'Matching Recipes...' : 'Find Recipes with Selected'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-bg-secondary border border-border-theme rounded-3xl text-center space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-text-primary">Your pantry is currently empty</p>
            <p className="text-[11px] text-text-muted">Tap below to add common kitchen staples or type any ingredient above.</p>
          </div>
        )}

        {/* Quick-Tap Popular Staples */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-0.5">
            Quick Tap Staples:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_PANTRY_PRESETS.map((ing) => {
              const isSelected = selectedIngredients.some((i) => i.toLowerCase() === ing.toLowerCase());
              return (
                <button
                  key={ing}
                  onClick={() => toggleIngredient(ing)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer min-h-[36px] touch-manipulation ${
                    isSelected
                      ? 'bg-color-secondary text-white shadow-card font-bold'
                      : 'bg-surface-card text-text-primary border border-border-theme hover:border-border-strong hover:bg-surface-hover'
                  }`}
                >
                  {isSelected ? `✓ ${ing}` : `+ ${ing}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Modes & Sorting Bar (Mobile Horizontally Scrollable) */}
        <div className="p-3.5 bg-surface-card rounded-3xl border border-border-theme shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs -mx-1 px-1 w-full sm:w-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted shrink-0 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Mode:</span>
            </span>

            {[
              { id: 'best_match', label: 'Best Match' },
              { id: 'exact', label: '100% Exact' },
              { id: 'single', label: 'Single Focus' },
              { id: 'multi', label: 'Combinations' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setPantryMode(mode.id as PantrySearchMode)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all touch-manipulation border ${
                  pantryMode === mode.id
                    ? 'bg-accent-primary text-white border-accent-primary shadow-card font-bold'
                    : 'bg-bg-secondary text-text-primary hover:bg-surface-hover border-border-theme'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs shrink-0 self-end sm:self-auto">
            <span className="font-bold text-text-muted">Sort:</span>
            <select
              value={pantrySortBy}
              onChange={(e) => setPantrySortBy(e.target.value)}
              className="bg-bg-secondary border border-border-theme text-text-primary text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="match">Match %</option>
              <option value="missing_least">Fewest Missing</option>
              <option value="time">Quickest</option>
              <option value="protein">High Protein</option>
              <option value="calories">Lowest Cal</option>
            </select>
          </div>
        </div>

        {/* Real-time Dynamic Universal Pantry Matches */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
              Pantry Recipe Matches
            </h2>
            <span className="text-xs font-bold text-color-secondary bg-color-secondary-soft px-2.5 py-0.5 rounded-full border border-color-secondary/20">
              {exactMatches.length > 0 ? `${exactMatches.length} Ready` : `${highMatches.length} High Matches`}
            </span>
          </div>

          {isPantryLoading ? (
            <div className="p-8 text-center text-text-muted text-xs sm:text-sm font-medium">
              Searching universal recipes for pantry matches...
            </div>
          ) : pantryRecipes.length === 0 ? (
            <div className="p-6 bg-surface-card border border-border-theme rounded-3xl text-center space-y-1.5">
              <p className="font-serif text-base sm:text-lg font-bold text-text-primary">No exact matches found</p>
              <p className="text-xs text-text-secondary">Try switching to "Best Match" mode or adding versatile staples like Eggs, Potatoes, Rice, or Garlic.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {pantryRecipes.map((recipe) => {
                const isSaved = isRecipeSaved(recipe.id);
                const displayImg = recipe.image || recipe.imageUrl;
                const displayName = recipe.name || recipe.title;

                return (
                  <div
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    className="group bg-surface-card rounded-3xl border border-border-theme overflow-hidden shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.985] touch-manipulation"
                  >
                    {/* Media container */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-bg-secondary">
                      <img
                        src={displayImg}
                        alt={displayName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      {/* Top Left: Match Badge */}
                      <div className="absolute top-3 left-3">
                        <MatchScoreBadge score={recipe.matchScore || 0} />
                      </div>

                      {/* Top Right: Bookmark */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveRecipe(recipe.id, recipe);
                        }}
                        aria-label={isSaved ? 'Remove bookmark' : 'Save recipe'}
                        className="absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] rounded-full bg-surface-card/90 backdrop-blur-md flex items-center justify-center text-text-primary hover:text-accent-primary transition-all shadow-card active:scale-90 touch-manipulation border border-border-theme/40"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isSaved ? 'fill-accent-primary text-accent-primary' : 'text-text-secondary'}`}
                        />
                      </button>

                      {/* Bottom Info Bar */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-white" />
                          <span>{recipe.cookingTime} mins</span>
                        </div>

                        {recipe.calories && (
                          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full">
                            <span>{recipe.calories} kcal</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-2.5">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                          <span>{recipe.cuisine}</span>
                          <span className="text-accent-primary">{recipe.difficulty || 'Easy'}</span>
                        </div>

                        <h3 className="font-serif text-base sm:text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-1">
                          {displayName}
                        </h3>

                        <p className="text-text-secondary text-xs line-clamp-2 mt-0.5 leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>

                      {/* Transparent Ingredient Breakdown: You Have vs You Need */}
                      <div className="pt-2 border-t border-border-theme space-y-1 text-xs">
                        {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
                          <div className="flex items-start gap-1.5 text-color-secondary">
                            <Check className="w-3.5 h-3.5 text-color-secondary shrink-0 mt-0.5" />
                            <span className="line-clamp-1">
                              <strong>You have:</strong> {recipe.matchedIngredients.slice(0, 3).join(', ')}
                            </span>
                          </div>
                        )}

                        {recipe.missingIngredients && recipe.missingIngredients.length > 0 ? (
                          <div className="flex items-start gap-1.5 text-text-muted">
                            <span className="text-color-highlight font-bold shrink-0">＋</span>
                            <span className="line-clamp-1">
                              <strong>Need:</strong> {recipe.missingIngredients.slice(0, 3).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <div className="text-color-secondary font-bold text-[11px]">
                            ✓ 100% in pantry — ready to cook!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </PageContainer>
  );
};

