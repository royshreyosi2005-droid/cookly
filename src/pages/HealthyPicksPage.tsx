import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { RecipeDetailModal } from '../components/recipe/RecipeDetailModal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { RecipeCardSkeleton } from '../components/common/LoadingSkeleton';
import { usePantry } from '../context/PantryContext';
import { searchHealthyRecipes } from '../services/universalRecipeEngine';
import type { Recipe } from '../types';
import {
  Leaf,
  Sparkles,
  Dumbbell,
  Wheat,
  Scale,
  Sun,
  UtensilsCrossed,
  Moon,
  Apple,
  Clock,
  Search,
  Flame,
  Bookmark
} from 'lucide-react';

type HealthyTab =
  | 'All Healthy'
  | 'High-Protein'
  | 'Balanced Meals'
  | 'High-Fiber'
  | 'Low-Calorie'
  | 'Low Added Sugar'
  | 'Nutrient Dense'
  | 'Healthy Breakfast'
  | 'Healthy Lunch'
  | 'Healthy Dinner'
  | 'Healthy Snacks'
  | 'Vegetarian'
  | 'Vegan';

const HEALTHY_CATEGORIES: { label: HealthyTab; icon: React.ReactNode; description: string }[] = [
  { label: 'All Healthy', icon: <Sparkles className="w-3.5 h-3.5" />, description: 'All wholesome everyday meals' },
  { label: 'High-Protein', icon: <Dumbbell className="w-3.5 h-3.5" />, description: '18g+ protein for muscle support & satiety' },
  { label: 'Balanced Meals', icon: <Scale className="w-3.5 h-3.5" />, description: 'Optimal balance of macros & micronutrients' },
  { label: 'High-Fiber', icon: <Wheat className="w-3.5 h-3.5" />, description: 'Gut-nourishing whole grains & legumes' },
  { label: 'Low-Calorie', icon: <Flame className="w-3.5 h-3.5" />, description: 'Calorie-conscious whole-food meals under 380 kcal' },
  { label: 'Low Added Sugar', icon: <Apple className="w-3.5 h-3.5" />, description: 'Minimal to zero refined added sugars' },
  { label: 'Nutrient Dense', icon: <Leaf className="w-3.5 h-3.5" />, description: 'Vitamins, minerals & phytonutrients' },
  { label: 'Healthy Breakfast', icon: <Sun className="w-3.5 h-3.5" />, description: 'Energizing morning starts without sugar crashes' },
  { label: 'Healthy Lunch', icon: <UtensilsCrossed className="w-3.5 h-3.5" />, description: 'Clean midday fuel for sustained afternoon focus' },
  { label: 'Healthy Dinner', icon: <Moon className="w-3.5 h-3.5" />, description: 'Restorative, easy-to-digest evening plates' },
  { label: 'Healthy Snacks', icon: <Apple className="w-3.5 h-3.5" />, description: 'Mindful bites between meals' },
  { label: 'Vegetarian', icon: <Leaf className="w-3.5 h-3.5" />, description: 'Wholesome 100% plant-forward recipes' },
  { label: 'Vegan', icon: <Leaf className="w-3.5 h-3.5" />, description: '100% plant-based, dairy-free wholesome foods' }
];

const HEALTHY_SEARCH_SUGGESTIONS = [
  'High protein chicken',
  'Healthy paneer',
  'Low calorie breakfast',
  'High fiber dinner',
  'Greek Yogurt Bowl',
  'Quinoa Bowl',
  'Moong Dal Chilla',
  'Salmon Salad'
];

const PAGE_SIZE = 8;

export const HealthyPicksPage: React.FC = () => {
  const { selectedIngredients, isRecipeSaved, toggleSaveRecipe } = usePantry();
  const [activeTab, setActiveTab] = useState<HealthyTab>('All Healthy');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Macro quick-filters
  const [highProteinOnly, setHighProteinOnly] = useState(false);
  const [highFiberOnly, setHighFiberOnly] = useState(false);
  const [lowCalorieOnly, setLowCalorieOnly] = useState(false);
  const [quickOnly, setQuickOnly] = useState(false);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchTerm]);

  const executeSearch = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const minProteinParam = highProteinOnly ? 20 : undefined;
      const minFiberParam = highFiberOnly ? 5 : undefined;
      const maxCaloriesParam = lowCalorieOnly ? 400 : undefined;
      const maxCookTimeParam = quickOnly ? 20 : undefined;

      const results = await searchHealthyRecipes({
        query: debouncedSearch,
        healthyCategory: activeTab,
        minProtein: minProteinParam,
        minFiber: minFiberParam,
        maxCalories: maxCaloriesParam,
        maxCookTime: maxCookTimeParam,
        userPantry: selectedIngredients,
        signal: controller.signal
      });

      // Additional quick macro filter constraints if toggled
      const healthyFiltered = results.filter(r => {
        if (highProteinOnly && (r.proteinGrams || 0) < 20) return false;
        if (highFiberOnly && (r.fiberGrams || 0) < 5) return false;
        if (lowCalorieOnly && (r.calories || 999) > 400) return false;
        if (quickOnly && (r.cookingTime || (r.prepTimeMinutes + r.cookTimeMinutes)) > 20) return false;
        return true;
      });

      setRecipes(healthyFiltered);
      setVisibleCount(PAGE_SIZE);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Failed to load healthy picks:', err);
      setError(err?.message || 'Failed to load healthy recipes.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeTab, highProteinOnly, highFiberOnly, lowCalorieOnly, quickOnly, selectedIngredients]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  const activeCategoryObj = HEALTHY_CATEGORIES.find(c => c.label === activeTab);
  const visibleRecipes = recipes.slice(0, visibleCount);
  const hasMore = visibleCount < recipes.length;

  const handleResetFilters = () => {
    setActiveTab('All Healthy');
    setSearchTerm('');
    setHighProteinOnly(false);
    setHighFiberOnly(false);
    setLowCalorieOnly(false);
    setQuickOnly(false);
  };

  return (
    <PageContainer>
      <div className="space-y-5 sm:space-y-7">
        {/* Mobile Header & Search */}
        <section className="pt-1 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-color-secondary-soft border border-color-secondary/25 text-color-secondary text-[11px] font-bold uppercase tracking-wider shadow-2xs">
            <Leaf className="w-3.5 h-3.5 text-color-secondary" />
            <span>Dedicated Nutrition & Everyday Wellness</span>
          </div>

          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold text-color-text-primary tracking-tight leading-tight">
              Eat Better. <span className="italic font-normal text-color-secondary">Feel Better.</span>
            </h1>
            <p className="text-color-text-secondary text-xs sm:text-sm leading-relaxed max-w-xl">
              Strictly wholesome meals: balanced macros, high protein, gut-friendly fiber, and whole ingredients.
            </p>
          </div>

          {/* Search bar */}
          <div className="pt-1">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search healthy dishes (e.g. Greek Yogurt, Quinoa Bowl, Chicken Salad)..."
              leftIcon={<Search className="w-4 h-4 text-color-text-muted" />}
              onClear={() => setSearchTerm('')}
              className="py-3 sm:py-3.5 bg-color-surface text-xs sm:text-sm rounded-2xl shadow-card border-color-border focus:border-color-secondary"
            />
          </div>

          {/* Preset Healthy Search Chips (Horizontally Scrollable on Mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            {HEALTHY_SEARCH_SUGGESTIONS.map((dish) => (
              <button
                key={dish}
                onClick={() => setSearchTerm(dish)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                  searchTerm.toLowerCase() === dish.toLowerCase()
                    ? 'bg-color-secondary text-white shadow-card font-bold'
                    : 'bg-color-bg-secondary text-color-text-primary hover:bg-color-surface-hover border border-color-border'
                }`}
              >
                {dish}
              </button>
            ))}
          </div>
        </section>

        {/* Nutritional Goal Filter Pills (Horizontal Scrollable) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-color-text-muted px-0.5">
            <span>Healthy Categories:</span>
            {activeCategoryObj && (
              <span className="text-color-secondary font-semibold normal-case italic text-xs hidden sm:inline">
                {activeCategoryObj.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            {HEALTHY_CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveTab(cat.label)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shadow-2xs touch-manipulation min-h-[40px] ${
                    isActive
                      ? 'bg-color-secondary text-white shadow-card font-bold scale-102 ring-2 ring-color-secondary/20'
                      : 'bg-color-surface text-color-text-primary border border-color-border hover:border-color-secondary/50'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-color-secondary'}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Macro Toggles & Filter Bar (Mobile Scrollable) */}
        <div className="p-3.5 bg-surface-card rounded-2xl border border-border-theme shadow-card space-y-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted mr-1 shrink-0">
              Focus:
            </span>

            {/* High-Protein toggle */}
            <button
              onClick={() => setHighProteinOnly(!highProteinOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap touch-manipulation ${
                highProteinOnly
                  ? 'bg-color-secondary text-white border-color-secondary shadow-xs font-bold'
                  : 'bg-color-bg-secondary text-color-text-primary border-color-border hover:bg-color-surface-hover'
              }`}
            >
              <Dumbbell className={`w-3.5 h-3.5 ${highProteinOnly ? 'text-white' : 'text-color-secondary'}`} />
              <span>Protein (20g+)</span>
            </button>

            {/* High-Fiber toggle */}
            <button
              onClick={() => setHighFiberOnly(!highFiberOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap touch-manipulation ${
                highFiberOnly
                  ? 'bg-color-secondary text-white border-color-secondary shadow-xs font-bold'
                  : 'bg-color-bg-secondary text-color-text-primary border-color-border hover:bg-color-surface-hover'
              }`}
            >
              <Wheat className={`w-3.5 h-3.5 ${highFiberOnly ? 'text-white' : 'text-color-highlight'}`} />
              <span>Fiber (5g+)</span>
            </button>

            {/* Low-Calorie toggle */}
            <button
              onClick={() => setLowCalorieOnly(!lowCalorieOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap touch-manipulation ${
                lowCalorieOnly
                  ? 'bg-color-secondary text-white border-color-secondary shadow-xs font-bold'
                  : 'bg-color-bg-secondary text-color-text-primary border-color-border hover:bg-color-surface-hover'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${lowCalorieOnly ? 'text-white' : 'text-color-accent'}`} />
              <span>≤400 kcal</span>
            </button>

            {/* Quick Cooking toggle */}
            <button
              onClick={() => setQuickOnly(!quickOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap touch-manipulation ${
                quickOnly
                  ? 'bg-color-secondary text-white border-color-secondary shadow-xs font-bold'
                  : 'bg-color-bg-secondary text-color-text-primary border-color-border hover:bg-color-surface-hover'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${quickOnly ? 'text-white' : 'text-color-text-muted'}`} />
              <span>≤ 20 Mins</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-color-text-muted font-medium px-0.5 pt-1 border-t border-color-border">
            <span>
              {loading ? 'Finding healthy dishes...' : `Showing ${visibleRecipes.length} of ${recipes.length} healthy meals`}
            </span>
            {(highProteinOnly || highFiberOnly || lowCalorieOnly || quickOnly || activeTab !== 'All Healthy' || searchTerm) && (
              <button
                onClick={handleResetFilters}
                className="text-color-accent hover:text-color-accent-hover underline font-medium cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Healthy Recipe Grid with Macro Badges */}
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <RecipeCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState title="Failed to Load Healthy Picks" message={error} onRetry={executeSearch} />
          ) : recipes.length === 0 ? (
            <EmptyState
              type="search"
              title={`No healthy recipes match "${searchTerm || activeTab}"`}
              description="Try adjusting your search terms or unselecting some macro filters to explore more wholesome meals."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {visibleRecipes.map((recipe) => {
                  const isSaved = isRecipeSaved(recipe.id);
                  const displayImg = recipe.image || recipe.imageUrl;
                  const displayName = recipe.name || recipe.title;

                  return (
                    <div
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className="group bg-color-surface rounded-3xl border border-color-border overflow-hidden shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.985] touch-manipulation"
                    >
                      {/* Media container */}
                      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-color-bg-secondary">
                        <img
                          src={displayImg}
                          alt={displayName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                        {/* Top Left: Health Score / Pantry Match */}
                        <div className="absolute top-3 left-3">
                          {recipe.matchScore && recipe.matchScore > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-color-surface/95 backdrop-blur-md text-color-secondary border border-color-secondary/30 shadow-2xs">
                              <Sparkles className="w-3 h-3 text-color-secondary" />
                              <span>{recipe.matchScore}% Match</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-color-surface/95 backdrop-blur-md text-color-secondary border border-color-secondary/30 shadow-2xs">
                              <Leaf className="w-3 h-3 text-color-secondary" />
                              <span>{recipe.healthScore || 90} Score</span>
                            </span>
                          )}
                        </div>

                        {/* Top Right: Bookmark */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveRecipe(recipe.id, recipe);
                          }}
                          aria-label={isSaved ? 'Remove bookmark' : 'Save recipe'}
                          className="absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] rounded-full bg-color-surface/90 backdrop-blur-md flex items-center justify-center text-color-text-primary hover:text-color-accent transition-all shadow-card active:scale-90 touch-manipulation border border-color-border/40"
                        >
                          <Bookmark
                            className={`w-4 h-4 ${isSaved ? 'fill-color-accent text-color-accent' : 'text-color-text-secondary'}`}
                          />
                        </button>

                        {/* Bottom Image Macro Overlay */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px]">
                            <span>{recipe.calories || 350} kcal</span>
                            <span className="opacity-60">•</span>
                            <span>{recipe.proteinGrams || 18}g pro</span>
                            {recipe.fiberGrams && (
                              <>
                                <span className="opacity-60">•</span>
                                <span>{recipe.fiberGrams}g fiber</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px]">
                            <Clock className="w-3 h-3 text-white" />
                            <span>{recipe.cookingTime}m</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-2.5">
                        <div className="space-y-1">
                          {/* Cuisine and health highlight pill */}
                          <div className="flex items-center justify-between text-[11px] font-bold text-color-secondary uppercase tracking-wider">
                            <span>{recipe.cuisine}</span>
                            <span className="bg-color-secondary-soft text-color-secondary px-2 py-0.5 rounded-full border border-color-secondary/20 text-[10px]">
                              {recipe.healthReasons?.[0] || recipe.healthHighlights?.[0] || recipe.dietaryTags?.[0] || 'Wholesome'}
                            </span>
                          </div>

                          <h3 className="font-serif text-base sm:text-lg font-bold text-color-text-primary group-hover:text-color-secondary transition-colors line-clamp-1">
                            {displayName}
                          </h3>

                          <p className="text-color-text-secondary text-xs line-clamp-2 leading-relaxed">
                            {recipe.description}
                          </p>
                        </div>

                        {/* Nutritional Highlights */}
                        <div className="pt-2 border-t border-color-border flex items-center justify-between text-xs">
                          <span className="text-color-text-muted font-medium truncate max-w-[180px]">
                            {recipe.healthReasons?.[1] || `${recipe.ingredients.length} whole ingredients`}
                          </span>
                          <span className="text-color-secondary font-bold group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-0.5">
                            Recipe →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-6 pb-2 text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="w-full sm:w-auto px-8 rounded-2xl shadow-2xs font-bold text-xs sm:text-sm justify-center min-h-[44px]"
                  >
                    <span>Load More Healthy Recipes ({recipes.length - visibleCount} remaining)</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </PageContainer>
  );
};

