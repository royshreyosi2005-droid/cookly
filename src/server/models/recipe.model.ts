export interface NormalizedIngredient {
  name: string;
  amount: string;
  unit?: string;
  inPantry?: boolean;
  isOptional?: boolean;
  category?: string;
}

export interface NormalizedRecipe {
  id: string;
  name: string;
  title?: string;
  image: string | null;
  imageUrl?: string;
  description?: string;
  ingredients: NormalizedIngredient[];
  instructions?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  cookingTime?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  cuisine?: string;
  mealType?: string;
  dietaryTags?: string[];
  tags?: string[];
  source: string;
  sourceUrl?: string;
  chefTip?: string;
  rating?: number;
  reviewCount?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  isHealthy?: boolean;
  healthyScore?: number;
  matchScore?: number;
  matchedCount?: number;
  totalIngredientsCount?: number;
  matchedIngredients?: string[];
  missingIngredients?: string[];
}

export interface PantryMatchResult {
  recipe: NormalizedRecipe;
  matchScore: number;
  matchedCount: number;
  totalIngredientsCount: number;
  matchedIngredients: string[];
  missingIngredients: string[];
}

export interface AIChefMealSuggestion {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  cookingTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  estimatedCostInRupees: number;
  costPerPerson: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  pantryUsed: string[];
  missingIngredientsToBuy: string[];
  whyThisMatches: string;
  instructions: { step: number; title: string; instruction: string }[];
  allIngredients: { name: string; amount: string; inPantry: boolean }[];
  chefTip?: string;
}
