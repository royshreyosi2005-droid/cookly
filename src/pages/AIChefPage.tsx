import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { RecipeDetailModal } from '../components/recipe/RecipeDetailModal';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import {
  parseNaturalLanguageAIChefQuery,
  generateAIChefRecommendations
} from '../services/universalRecipeEngine';
import { EXAMPLE_PROMPTS } from '../utils/aiChefEngine';
import type { AIChefPromptParams, AIChefSuggestion, FoodPreference, Recipe } from '../types';
import {
  Sparkles,
  Bot,
  IndianRupee,
  Users,
  Clock,
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ChefHat,
  ArrowRight,
  Bookmark,
  Check
} from 'lucide-react';
import { usePantry } from '../context/PantryContext';

export const AIChefPage: React.FC = () => {
  const { selectedIngredients, isRecipeSaved, toggleSaveRecipe } = usePantry();

  // Natural query state
  const [query, setQuery] = useState(
    'I have ₹150, there are 3 people, I have eggs and potatoes, and I want something healthy in 25 mins.'
  );

  // Extracted parameters
  const [params, setParams] = useState<AIChefPromptParams>(() =>
    parseNaturalLanguageAIChefQuery(
      'I have ₹150, there are 3 people, I have eggs and potatoes, and I want something healthy in 25 mins.',
      selectedIngredients
    )
  );

  const [showTuning, setShowTuning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [suggestions, setSuggestions] = useState<AIChefSuggestion[]>([]);
  const [selectedModalRecipe, setSelectedModalRecipe] = useState<Recipe | null>(null);

  const generationSteps = [
    'Searching recipe database for candidates...',
    'Matching against pantry inventory...',
    'Calculating budget efficiency per person (₹)...',
    'Personalizing chef recommendations...'
  ];

  const handleGenerate = useCallback(async (currentParams: AIChefPromptParams = params) => {
    setIsGenerating(true);
    setGenerationStep(0);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < generationSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 250);

    try {
      const results = await generateAIChefRecommendations(currentParams);
      clearInterval(stepInterval);
      setSuggestions(results);
    } catch (err) {
      console.error('Failed to generate AI Chef suggestions:', err);
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  }, [params]);

  // Initial load: generate suggestions
  useEffect(() => {
    handleGenerate(params);
  }, []);

  // When user types in query, extract parameters live
  const handleQueryChange = (text: string) => {
    setQuery(text);
    const parsed = parseNaturalLanguageAIChefQuery(text, selectedIngredients);
    setParams({ ...parsed, userQuery: text });
  };

  const handleApplyExample = (exampleText: string) => {
    setQuery(exampleText);
    const parsed = parseNaturalLanguageAIChefQuery(exampleText, selectedIngredients);
    const updated = { ...parsed, userQuery: exampleText };
    setParams(updated);
    handleGenerate(updated);
  };

  // Convert AIChefSuggestion to standard Recipe format for the modal
  const openDetailModal = (item: AIChefSuggestion) => {
    const modalRecipe: Recipe = {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      imageUrl: item.imageUrl,
      prepTimeMinutes: 5,
      cookTimeMinutes: item.cookingTimeMinutes - 5,
      servings: item.servings,
      difficulty: item.difficulty,
      cuisine: item.cuisine,
      calories: item.calories,
      proteinGrams: item.proteinGrams,
      carbsGrams: item.carbsGrams,
      fatGrams: item.fatGrams,
      rating: 4.9,
      reviewCount: 88,
      tags: ['Quick & Easy', 'High-Protein', 'Healthy Dinner'],
      ingredients: item.allIngredients,
      instructions: item.instructions,
      chefTip: item.chefTip
    };
    setSelectedModalRecipe(modalRecipe);
  };

  const foodPrefOptions: FoodPreference[] = [
    'Any',
    'Vegetarian',
    'Non-vegetarian',
    'High-protein',
    'Healthy',
    'Low-calorie'
  ];

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-5 sm:space-y-7">
        {/* Page Header */}
        <div className="space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft border border-accent-primary/20 text-accent-primary text-[11px] font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-accent-primary animate-pulse" />
            <span>AI Budget & Meal Assistant</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
            Meet Your <span className="italic font-normal text-accent-primary">Personal AI Chef.</span>
          </h1>

          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed max-w-xl">
            Tell the AI Chef your budget in ₹, number of people, ingredients on hand, or time limit. Get customized meals instantly.
          </p>
        </div>

        {/* Interactive Conversational Input Box */}
        <div className="bg-surface-card rounded-3xl border border-border-theme shadow-card p-4 sm:p-6 space-y-3.5">
          {/* Prompt Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
              <Bot className="w-3.5 h-3.5 text-accent-primary" />
              <span>Describe Your Situation:</span>
            </div>

            <button
              type="button"
              onClick={() => setShowTuning(!showTuning)}
              className="inline-flex items-center gap-1 text-xs font-bold text-accent-primary hover:text-accent-hover transition-colors cursor-pointer touch-manipulation min-h-[32px]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showTuning ? 'Hide Controls' : 'Tune Values'}</span>
              {showTuning ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Natural Language Textarea */}
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              rows={3}
              placeholder="e.g. I have ₹100, 2 people, eggs and rice, dinner in 20 minutes..."
              className="w-full bg-bg-secondary text-text-primary placeholder:text-text-muted text-xs sm:text-sm font-medium rounded-2xl border border-border-theme p-3 sm:p-4 transition-all duration-200 focus:outline-none focus:border-accent-primary focus:bg-surface-card resize-none leading-relaxed"
            />
          </div>

          {/* Extracted Parameter Badges preview (Scrollable on Mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs -mx-1 px-1 border-t border-border-theme pt-2.5">
            <span className="text-text-muted font-bold shrink-0 text-[10px] uppercase">Detected:</span>

            <span className="inline-flex items-center gap-1 bg-accent-soft text-accent-primary border border-accent-primary/20 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap text-[11px]">
              <IndianRupee className="w-3 h-3" />
              <span>₹{params.budget}</span>
            </span>

            <span className="inline-flex items-center gap-1 bg-bg-secondary text-text-primary border border-border-theme px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap text-[11px]">
              <Users className="w-3 h-3 text-text-muted" />
              <span>{params.peopleCount} {params.peopleCount === 1 ? 'Person' : 'People'}</span>
            </span>

            <span className="inline-flex items-center gap-1 bg-bg-secondary text-text-primary border border-border-theme px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap text-[11px]">
              <Clock className="w-3 h-3 text-text-muted" />
              <span>≤{params.maxCookTimeMinutes}m</span>
            </span>

            {params.foodPreference !== 'Any' && (
              <span className="inline-flex items-center gap-1 bg-color-secondary-soft text-color-secondary border border-color-secondary/20 px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap text-[11px]">
                <span>{params.foodPreference}</span>
              </span>
            )}
          </div>

          {/* Collapsible Tuning Controls (Mobile Segmented Chips) */}
          {showTuning && (
            <div className="p-3.5 sm:p-4 bg-bg-secondary rounded-2xl border border-border-theme space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Budget selector */}
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px] block">
                    Budget (₹)
                  </label>
                  <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
                    {[50, 100, 150, 200, 500].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setParams({ ...params, budget: b })}
                        className={`flex-1 min-w-[40px] py-1.5 rounded-xl font-bold border transition-all text-xs touch-manipulation ${
                          params.budget === b
                            ? 'bg-accent-primary text-white border-accent-primary shadow-xs'
                            : 'bg-surface-card text-text-primary border-border-theme'
                        }`}
                      >
                        ₹{b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Number of people */}
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px] block">
                    People Count
                  </label>
                  <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
                    {[1, 2, 3, 4, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setParams({ ...params, peopleCount: num })}
                        className={`flex-1 min-w-[36px] py-1.5 rounded-xl font-bold border transition-all text-xs touch-manipulation ${
                          params.peopleCount === num
                            ? 'bg-accent-primary text-white border-accent-primary shadow-xs'
                            : 'bg-surface-card text-text-primary border-border-theme hover:bg-surface-hover'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Max Cook Time */}
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px] block">
                    Max Cook Time
                  </label>
                  <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
                    {[15, 25, 35, 60].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setParams({ ...params, maxCookTimeMinutes: m })}
                        className={`flex-1 min-w-[40px] py-1.5 rounded-xl font-semibold border transition-all text-xs touch-manipulation ${
                          params.maxCookTimeMinutes === m
                            ? 'bg-accent-primary text-white border-accent-primary shadow-xs font-bold'
                            : 'bg-surface-card text-text-primary border-border-theme hover:bg-surface-hover'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Food Preference */}
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px] block">
                    Food Preference
                  </label>
                  <select
                    value={params.foodPreference}
                    onChange={(e) => setParams({ ...params, foodPreference: e.target.value as FoodPreference })}
                    className="w-full bg-surface-card text-text-primary font-semibold rounded-xl border border-border-theme px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent-primary min-h-[34px]"
                  >
                    {foodPrefOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Quick Example Prompt Chips (Scrollable on Mobile) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              Quick Prompt Ideas:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {EXAMPLE_PROMPTS.slice(0, 4).map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyExample(ex)}
                  className="text-xs text-text-secondary bg-bg-secondary hover:bg-surface-hover border border-border-theme px-3 py-1.5 rounded-full text-left whitespace-nowrap transition-all touch-manipulation shrink-0 font-medium"
                >
                  "{ex.length > 35 ? ex.substring(0, 35) + '...' : ex}"
                </button>
              ))}
            </div>
          </div>

          {/* Ask AI Chef Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-border-theme">
            <div className="text-[11px] text-text-muted font-medium flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5 text-accent-primary" />
              <span>Calculates budget per person & timing.</span>
            </div>

            <Button
              variant="spice"
              size="lg"
              onClick={() => handleGenerate(params)}
              disabled={isGenerating}
              className="w-full sm:w-auto px-7 rounded-2xl shadow-card font-bold text-xs sm:text-sm tracking-wide min-h-[44px] justify-center"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Ask AI Chef</span>
            </Button>
          </div>
        </div>

        {/* AI Processing / Generation State */}
        {isGenerating && (
          <div className="p-6 sm:p-10 bg-surface-card/80 backdrop-blur-md rounded-3xl border border-accent-primary/30 text-center space-y-3 shadow-card animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent-primary flex items-center justify-center mx-auto shadow-inner">
              <Bot className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
              Crafting Custom Meals
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-accent-primary max-w-sm mx-auto">
              {generationSteps[generationStep]}
            </p>
          </div>
        )}

        {/* AI Recommendations Output */}
        {!isGenerating && suggestions.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-border-theme pb-2 px-0.5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
                  AI Chef Recommendations
                </h2>
                <p className="text-xs text-text-muted">
                  ₹{params.budget} budget • {params.peopleCount} {params.peopleCount === 1 ? 'person' : 'people'} • &le;{params.maxCookTimeMinutes} mins
                </p>
              </div>

              <span className="text-xs font-bold text-color-secondary bg-color-secondary-soft px-2.5 py-0.5 rounded-full border border-color-secondary/20">
                {suggestions.length} Meals
              </span>
            </div>

            {/* Suggestions List (Mobile Optimized) */}
            <div className="space-y-4">
              {suggestions.map((suggestion) => {
                const isSaved = isRecipeSaved(suggestion.id);
                return (
                  <Card
                    key={suggestion.id}
                    variant={suggestion.isBestMatch ? 'default' : 'flat'}
                    className={`overflow-hidden transition-all duration-200 border rounded-3xl ${
                      suggestion.isBestMatch
                        ? 'border-accent-primary/40 bg-surface-card ring-2 ring-accent-primary/15 shadow-lift'
                        : 'border-border-theme bg-surface-card shadow-card'
                    }`}
                  >
                    {/* Best Match Banner */}
                    {suggestion.isBestMatch && (
                      <div className="bg-accent-primary text-white text-[11px] font-bold px-4 py-1.5 flex items-center justify-between tracking-wide uppercase shadow-2xs">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                          <span>AI Best Match</span>
                        </div>
                        <span className="text-[10px] bg-white/20 px-2 py-0.2 rounded-full font-normal lowercase">
                          recommended
                        </span>
                      </div>
                    )}

                    <div className="p-4 sm:p-5 flex flex-col gap-4">
                      {/* Top Food Image Container */}
                      <div className="relative rounded-2xl overflow-hidden h-44 sm:h-52 w-full bg-bg-secondary">
                        <img
                          src={suggestion.imageUrl}
                          alt={suggestion.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50" />

                        {/* Cost Floating Pill */}
                        <div className="absolute top-2.5 right-2.5 bg-surface-card/95 backdrop-blur-md px-3 py-1 rounded-2xl shadow-sm border border-border-theme text-right">
                          <div className="text-sm font-extrabold text-text-primary flex items-center justify-end">
                            <IndianRupee className="w-3.5 h-3.5 text-accent-primary" />
                            <span>{suggestion.totalCost}</span>
                          </div>
                          <div className="text-[10px] font-semibold text-accent-primary">
                            ₹{suggestion.costPerPerson} / person
                          </div>
                        </div>

                        {/* Bottom Tag Overlays */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs font-medium">
                          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-semibold">
                            {suggestion.cuisine} • {suggestion.difficulty}
                          </span>
                          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-semibold">
                            {suggestion.cookingTimeMinutes}m • {suggestion.calories} kcal
                          </span>
                        </div>
                      </div>

                      {/* Recipe Details & Reason Checklist */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
                            {suggestion.title}
                          </h3>
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                            {suggestion.subtitle || suggestion.description}
                          </p>
                        </div>

                        {/* Why AI Chef Recommends Checklist */}
                        <div className="p-2.5 rounded-2xl bg-bg-secondary border border-border-theme space-y-1 text-xs">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
                            Why this fits:
                          </div>
                          {suggestion.whyItMatches.slice(0, 3).map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-color-secondary">
                              <Check className="w-3.5 h-3.5 text-color-secondary shrink-0 stroke-[2.5]" />
                              <span className="text-xs text-text-secondary">{reason.replace(/^✓\s*/, '')}</span>
                            </div>
                          ))}
                        </div>

                        {/* Missing Ingredients alert if any */}
                        {suggestion.missingIngredients.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-color-highlight-soft border border-color-highlight/25 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-color-highlight">
                              <AlertCircle className="w-3.5 h-3.5 text-color-highlight shrink-0" />
                              <span className="text-[11px] line-clamp-1">
                                <strong>Buy:</strong> {suggestion.missingIngredients.join(', ')}
                              </span>
                            </div>
                            <span className="text-[10px] text-color-highlight font-semibold shrink-0 ml-1">
                              (in budget)
                            </span>
                          </div>
                        )}

                        {/* Card Actions */}
                        <div className="pt-2 flex items-center justify-between gap-2.5 border-t border-border-theme">
                          <button
                            type="button"
                            onClick={() => toggleSaveRecipe(suggestion.id)}
                            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors touch-manipulation min-h-[42px] ${
                              isSaved
                                ? 'bg-accent-soft text-accent-primary border-accent-primary/30'
                                : 'bg-bg-secondary text-text-secondary border-border-theme hover:bg-surface-hover'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                          </button>

                          <Button
                            variant="spice"
                            size="sm"
                            onClick={() => openDetailModal(suggestion)}
                            className="flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold min-h-[42px] justify-center gap-1"
                          >
                            <span>View Recipe</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedModalRecipe}
        onClose={() => setSelectedModalRecipe(null)}
      />
    </PageContainer>
  );
};

