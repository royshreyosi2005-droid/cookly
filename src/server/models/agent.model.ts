import type { NormalizedRecipe, PantryMatchResult, AIChefMealSuggestion } from './recipe.model.js';

export type AgentIntent =
  | 'GENERAL_SEARCH'
  | 'HEALTHY_SEARCH'
  | 'PANTRY_MATCH'
  | 'AI_CHEF'
  | 'RECIPE_DETAILS'
  | 'INGREDIENT_SEARCH'
  | 'CUISINE_SEARCH'
  | 'MEAL_TYPE_SEARCH';

export interface ParsedConstraints {
  rawQuery: string;
  cleanedQuery: string;
  intent: AgentIntent;
  budget?: number;
  budgetMode?: 'total' | 'per_person';
  servings?: number;
  maxCookingTime?: number;
  includedIngredients: string[];
  excludedIngredients: string[];
  cuisine?: string;
  mealType?: string;
  dietaryTags: string[];
  isHealthy: boolean;
  minProtein?: number;
  maxCalories?: number;
  minFiber?: number;
  sortBy?: 'relevance' | 'time' | 'calories' | 'rating' | 'match';
}

export interface AppliedFilters {
  cuisine?: string;
  mealType?: string;
  dietary?: string[];
  maxTime?: number;
  maxCalories?: number;
  minProtein?: number;
  excludedIngredients?: string[];
  includedIngredients?: string[];
  budgetApplied?: boolean;
}

export interface AIChefAgentSummary {
  budget?: number;
  budgetMode?: 'total' | 'per_person';
  servings?: number;
  availableIngredients?: string[];
  missingIngredients?: string[];
  dietaryPreference?: string;
  maxCookingTime?: number;
  estimatedCostNote: string;
}

export interface AgentResponse {
  intent: AgentIntent;
  interpretedRequest: {
    originalPrompt: string;
    summary: string;
    constraints: ParsedConstraints;
  };
  recipes: NormalizedRecipe[];
  pantryMatches?: PantryMatchResult[];
  aiChefSuggestions?: AIChefMealSuggestion[];
  aiChefSummary?: AIChefAgentSummary;
  explanation: string;
  filtersApplied: AppliedFilters;
  meta: {
    total: number;
    processingTimeMs: number;
    timestamp: string;
  };
}
