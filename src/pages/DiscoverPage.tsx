import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { RecipeDetailModal } from '../components/recipe/RecipeDetailModal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { RecipeCardSkeleton } from '../components/common/LoadingSkeleton';
import { usePantry } from '../context/PantryContext';
import { searchUniversalRecipes } from '../services/universalRecipeEngine';
import { RecentSearchStorage } from '../services/recipeDiscoveryService';
import type { Recipe } from '../types';
import { Search, Utensils, Sparkles, ArrowUpDown, RotateCcw } from 'lucide-react';

const POPULAR_SEARCH_SUGGESTIONS = [
  'Biryani',
  'Momo',
  'Pasta',
  'Paneer Tikka',
  'Chicken Curry',
  'Fish Curry',
  'Aloo Paratha',
  'Ramen',
  'Sushi',
  'Pizza',
  'Burger',
  'Brownies',
  'Cheesecake',
  'Tacos',
  'Dal',
  'Khichuri',
  'Chicken Soup',
  'Pancakes',
  'Fried Rice'
];

const CUISINES = [
  'All',
  'Indian',
  'Italian',
  'Asian',
  'American',
  'Mexican',
  'Mediterranean',
  'Japanese',
  'French'
];

const DIETARY_FILTERS = [
  'All',
  'High-Protein',
  'Vegetarian',
  'Quick & Easy',
  'Low-Calorie',
  'Balanced Meals',
  'High-Fiber'
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Advanced'];

type SortOption = 'relevance' | 'match' | 'time' | 'rating' | 'calories';

const PAGE_SIZE = 8;

export const DiscoverPage: React.FC = () => {
  const { selectedIngredients, selectedRecipe, setSelectedRecipe } = usePantry();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Debounce search input by 300ms
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(searchTerm);
      if (searchTerm.trim().length >= 2) {
        RecentSearchStorage.add(searchTerm);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchTerm]);

  // Fetch dynamic recipes using the Universal Recipe Engine
  const executeSearch = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const results = await searchUniversalRecipes({
        query: debouncedQuery,
        cuisine: cuisineFilter,
        dietary: dietaryFilter,
        difficulty: difficultyFilter,
        sortBy: sortBy as any,
        userPantry: selectedIngredients,
        signal: controller.signal
      });

      setRecipes(results);
      setVisibleCount(PAGE_SIZE);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Failed to search recipes:', err);
      setError(err?.message || 'Unable to load recipes. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, cuisineFilter, dietaryFilter, difficultyFilter, sortBy, selectedIngredients]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  // Apply sorting
  const sortedRecipes = React.useMemo(() => {
    const list = [...recipes];
    switch (sortBy) {
      case 'match':
        return list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      case 'time':
        return list.sort((a, b) => {
          const timeA = a.cookingTime || (a.prepTimeMinutes + a.cookTimeMinutes);
          const timeB = b.cookingTime || (b.prepTimeMinutes + b.cookTimeMinutes);
          return timeA - timeB;
        });
      case 'rating':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'calories':
        return list.sort((a, b) => (a.calories || 9999) - (b.calories || 9999));
      case 'relevance':
      default:
        return list;
    }
  }, [recipes, sortBy]);

  const visibleRecipes = sortedRecipes.slice(0, visibleCount);
  const hasMore = visibleCount < sortedRecipes.length;

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedQuery('');
    setCuisineFilter('All');
    setDietaryFilter('All');
    setDifficultyFilter('All');
    setSortBy('relevance');
  };

  return (
    <PageContainer>
      <div className="space-y-5 sm:space-y-7">
        {/* Page Header */}
        <div className="space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent-primary bg-accent-soft border border-accent-primary/20 px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
            <span>Recipe Discovery</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
            Discover Recipes
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed max-w-2xl">
            Search hundreds of international dishes, desserts, and comfort foods matched dynamically to your pantry.
          </p>
        </div>

        {/* Mobile Search Bar & Quick Filters */}
        <div className="p-3.5 sm:p-5 bg-surface-card rounded-3xl border border-border-theme shadow-card space-y-3.5">
          {/* Full-width Search Input */}
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dishes (e.g. Biryani, Momo, Pasta, Paneer)..."
              leftIcon={<Search className="w-4 h-4 text-text-muted" />}
              onClear={() => setSearchTerm('')}
              className="py-3 sm:py-3.5 bg-surface-card text-sm sm:text-base rounded-2xl border-border-theme focus:border-accent-primary"
            />
          </div>

          {/* Quick-Pick Popular Search Chips (Scrollable on Mobile) */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-[11px] text-text-muted font-bold uppercase tracking-wider px-0.5">
              <span className="flex items-center gap-1">
                <Utensils className="w-3 h-3 text-accent-primary" />
                <span>Popular:</span>
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-accent-primary hover:text-accent-hover font-semibold lowercase underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
              {POPULAR_SEARCH_SUGGESTIONS.map((dish) => {
                const isCurrent = searchTerm.toLowerCase() === dish.toLowerCase();
                return (
                  <button
                    key={dish}
                    onClick={() => setSearchTerm(dish)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                      isCurrent
                        ? 'bg-accent-primary text-white shadow-card font-bold'
                        : 'bg-bg-secondary text-text-primary hover:bg-surface-hover border border-border-theme'
                    }`}
                  >
                    {dish}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Tier Filter & Sort Ribbon */}
          <div className="pt-2 border-t border-border-theme space-y-2.5">
            {/* Cuisine Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
              <span className="font-bold text-text-muted shrink-0 mr-1 text-[11px] uppercase tracking-wider">Cuisine:</span>
              {CUISINES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCuisineFilter(c)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                    cuisineFilter === c
                      ? 'bg-color-accent text-white border-color-accent shadow-card font-bold'
                      : 'bg-bg-secondary text-text-primary hover:bg-surface-hover border border-border-theme'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Dietary & Difficulty & Sort row */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              {/* Dietary Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
                <span className="font-bold text-text-muted shrink-0 mr-1 text-[11px] uppercase tracking-wider">Diet:</span>
                {DIETARY_FILTERS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDietaryFilter(d)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                      dietaryFilter === d
                        ? 'bg-color-secondary text-white border-color-secondary shadow-card font-bold'
                        : 'bg-color-secondary-soft text-color-secondary hover:opacity-90 border border-color-secondary/20'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Difficulty Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
                <span className="font-bold text-text-muted shrink-0 mr-1 text-[11px] uppercase tracking-wider">Level:</span>
                {DIFFICULTIES.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficultyFilter(lvl)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                      difficultyFilter === lvl
                        ? 'bg-accent-primary text-white border-accent-primary shadow-card font-bold'
                        : 'bg-bg-secondary text-text-primary hover:bg-surface-hover border border-border-theme'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs shrink-0">
                <span className="font-bold text-text-muted flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
                  <span>Sort:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-bg-secondary border border-border-theme text-text-primary text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="relevance">Relevance</option>
                  <option value="match">Pantry Match %</option>
                  <option value="time">Quickest</option>
                  <option value="rating">Top Rated</option>
                  <option value="calories">Lowest Cal</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header & Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-text-secondary px-0.5">
            <span>
              {loading ? (
                'Searching global recipes...'
              ) : (
                `Showing ${visibleRecipes.length} of ${sortedRecipes.length} recipes`
              )}
            </span>
            {(searchTerm || cuisineFilter !== 'All' || dietaryFilter !== 'All' || difficultyFilter !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="text-accent-primary hover:text-accent-hover underline font-medium cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <RecipeCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Failed to Load Recipes"
              message={error}
              onRetry={executeSearch}
            />
          ) : sortedRecipes.length === 0 ? (
            <EmptyState
              type="search"
              title={`No recipes found for "${searchTerm || 'these filters'}"`}
              description="Try searching with a broader dish name like 'biryani', 'pasta', 'soup', or reset your dietary and cuisine filters."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {visibleRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={(selected) => setSelectedRecipe(selected)}
                  />
                ))}
              </div>

              {/* Pagination / Load More Button */}
              {hasMore && (
                <div className="pt-6 pb-2 text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="w-full sm:w-auto px-8 rounded-2xl shadow-2xs font-bold text-xs sm:text-sm justify-center min-h-[44px]"
                  >
                    <span>Load More Recipes ({sortedRecipes.length - visibleCount} remaining)</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Full Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </PageContainer>
  );
};

