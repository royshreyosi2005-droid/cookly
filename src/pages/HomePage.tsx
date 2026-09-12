import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { RecipeDetailModal } from '../components/recipe/RecipeDetailModal';
import { IngredientTag } from '../components/recipe/IngredientTag';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { usePantry } from '../context/PantryContext';
import { POPULAR_PANTRY_INGREDIENTS } from '../data/mockData';
import { Sparkles, Search, ArrowRight, CheckCircle2, Flame, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const {
    selectedIngredients,
    toggleIngredient,
    addIngredient,
    parseAndAddFromText,
    recipes,
    selectedRecipe,
    setSelectedRecipe,
    clearAllIngredients
  } = usePantry();

  const [ingredientInput, setIngredientInput] = useState('');
  const [activeFilterTag, setActiveFilterTag] = useState<string>('All');

  // Filter recipes based on tag filter
  const filteredRecipes = recipes.filter(r => {
    if (activeFilterTag === 'All') return true;
    if (activeFilterTag === '100% Match') return (r.matchScore || 0) === 100;
    return r.tags.includes(activeFilterTag as any);
  });

  const quickRecipes = recipes.filter(r => (r.cookingTime || (r.prepTimeMinutes + r.cookTimeMinutes)) <= 25);
  const highMatchCount = recipes.filter(r => (r.matchScore || 0) >= 80).length;

  const handleAddCustomIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredientInput.trim()) {
      const trimmed = ingredientInput.trim();
      if (trimmed.includes(' ') || trimmed.includes(',') || trimmed.toLowerCase().includes('have')) {
        parseAndAddFromText(trimmed);
      } else {
        addIngredient(trimmed);
      }
      setIngredientInput('');
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6 sm:space-y-8">
        {/* Mobile-First Header & Hero Section */}
        <section className="pt-2 sm:pt-6 space-y-4">
          {/* Subtle Category Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft border border-accent-primary/20 text-accent-primary text-[11px] font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
            <span>Pantry Matching Engine</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.2]">
              What can you cook <span className="italic font-normal text-accent-primary">right now?</span>
            </h1>
            <p className="text-text-secondary text-xs sm:text-base leading-relaxed max-w-xl">
              Add what's in your fridge & pantry. Cookly instantly matches authentic dishes you can cook with zero food waste.
            </p>
          </div>

          {/* Prominent Mobile-First Search / Quick-Add Bar */}
          <form onSubmit={handleAddCustomIngredient} className="flex gap-2 pt-1">
            <div className="relative flex-grow">
              <Input
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                placeholder="Add ingredients (e.g. Eggs, Garlic, Rice)..."
                leftIcon={<Search className="w-4 h-4 text-text-muted" />}
                onClear={() => setIngredientInput('')}
                className="py-3 sm:py-3.5 bg-surface-card text-sm sm:text-base shadow-card rounded-2xl border-border-theme focus:border-accent-primary"
              />
            </div>
            <Button
              type="submit"
              variant="spice"
              size="md"
              className="shrink-0 px-4 sm:px-6 rounded-2xl font-bold text-xs sm:text-sm min-h-[44px] shadow-card"
            >
              Add
            </Button>
          </form>

          {/* Quick-Tap Popular Staples Chips (Horizontal Scroll on Mobile) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-text-muted font-bold uppercase tracking-wider px-0.5">
              <span>Quick Tap Staples:</span>
              {selectedIngredients.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllIngredients}
                  className="text-accent-primary hover:text-accent-hover font-semibold lowercase underline cursor-pointer"
                >
                  clear all ({selectedIngredients.length})
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0 sm:flex-wrap">
              {POPULAR_PANTRY_INGREDIENTS.slice(0, 12).map((ing) => {
                const isSelected = selectedIngredients.includes(ing);
                return (
                  <div key={ing} className="shrink-0">
                    <IngredientTag
                      name={ing}
                      isSelected={isSelected}
                      onClick={() => toggleIngredient(ing)}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Compact Mobile Value Props Strip */}
        <section className="p-3 sm:p-4 rounded-2xl bg-bg-secondary border border-border-theme grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center justify-center p-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-color-secondary-soft text-color-secondary flex items-center justify-center mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-text-primary leading-tight">{highMatchCount} Ready</span>
            <span className="text-[10px] text-text-muted hidden sm:inline">From pantry</span>
          </div>

          <div className="flex flex-col items-center justify-center p-1.5 border-x border-border-theme">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-accent-soft text-accent-primary flex items-center justify-center mb-1">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-text-primary leading-tight">Zero Waste</span>
            <span className="text-[10px] text-text-muted hidden sm:inline">Use everything</span>
          </div>

          <div className="flex flex-col items-center justify-center p-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-color-highlight-soft text-color-highlight flex items-center justify-center mb-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-text-primary leading-tight">15-30 Mins</span>
            <span className="text-[10px] text-text-muted hidden sm:inline">Fast weeknights</span>
          </div>
        </section>

        {/* Quick & Easy Horizontal Carousel Section */}
        {quickRecipes.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-color-highlight fill-color-highlight" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
                  Quick & Easy Under 25 Mins
                </h2>
              </div>
              <Link
                to="/discover"
                className="text-xs text-accent-primary hover:text-accent-hover font-bold flex items-center gap-0.5"
              >
                <span>See All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
              {quickRecipes.slice(0, 5).map((recipe) => (
                <div key={recipe.id} className="w-[260px] sm:w-[280px] shrink-0">
                  <RecipeCard
                    recipe={recipe}
                    onSelect={(selected) => setSelectedRecipe(selected)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Recipe Section */}
        <section className="space-y-4 pt-2">
          {/* Header & Filter Pills */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
                  Top Pantry Matches
                </h2>
                <p className="text-xs text-text-muted">
                  Ranked in real-time by your selected ingredients.
                </p>
              </div>
            </div>

            {/* Horizontally Scrollable Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
              {['All', '100% Match', 'Quick & Easy', 'Vegetarian', 'High-Protein'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilterTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all touch-manipulation border ${
                    activeFilterTag === tag
                      ? 'bg-color-accent text-white border-color-accent shadow-card font-bold'
                      : 'bg-surface-card border-border-theme text-text-primary hover:bg-surface-hover shadow-2xs'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Recipe Display */}
          {filteredRecipes.length === 0 ? (
            <EmptyState
              type="search"
              title="No recipes match these exact filters"
              description="Try selecting additional staples like Olive Oil, Eggs, or Garlic to unlock more meal options."
              actionText="Reset All Filters"
              onAction={() => setActiveFilterTag('All')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={(selected) => setSelectedRecipe(selected)}
                />
              ))}
            </div>
          )}

          {/* Bottom Discover More banner */}
          <div className="pt-6 pb-2 text-center">
            <Link to="/discover" className="block w-full sm:inline-block sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto group justify-center rounded-2xl">
                <span>Explore All Recipes in Catalog</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </div>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </PageContainer>
  );
};

