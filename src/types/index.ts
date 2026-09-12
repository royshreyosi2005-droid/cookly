export type DifficultyLevel = 'Easy' | 'Medium' | 'Advanced';

export type DietaryTag =
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Dairy-Free'
  | 'Quick & Easy'
  | 'High-Protein'
  | 'Low-Carb'
  | 'Comfort Food'
  | 'Low-Calorie'
  | 'High-Fiber'
  | 'Balanced Meals'
  | 'Low Added Sugar'
  | 'Nutrient Dense'
  | 'Healthy Breakfast'
  | 'Healthy Lunch'
  | 'Healthy Dinner'
  | 'Healthy Snacks'
  | 'Quick & Healthy';

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit?: string;
  inPantry?: boolean;
  isOptional?: boolean;
}

export interface InstructionStep {
  step: number;
  title?: string;
  instruction: string;
  durationMinutes?: number;
}

export type RecipeSource =
  | 'curated'
  | 'themealdb'
  | 'dummyjson'
  | 'forkify'
  | 'spoonacular'
  | 'open_culinary_db'
  | 'ai_generated'
  | 'user';

export type PantrySearchMode = 'exact' | 'best_match' | 'single' | 'multi';

export interface NormalizedRecipe {
  id: string;
  name?: string;
  title: string; // backwards compatibility alias
  subtitle?: string;
  image?: string;
  imageUrl: string; // backwards compatibility alias
  description: string;
  ingredients: RecipeIngredient[];
  instructions: InstructionStep[];
  cookingTime?: number; // total in minutes
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty?: DifficultyLevel;
  calories?: number;
  protein?: string | number;
  proteinGrams?: number;
  carbs?: string | number;
  carbsGrams?: number;
  fat?: string | number;
  fatGrams?: number;
  fiber?: string | number;
  fiberGrams?: number;
  cuisine: string;
  mealType?: string;
  dietaryTags?: string[];
  tags: DietaryTag[]; // backwards compatibility alias
  source?: RecipeSource | string;
  sourceUrl?: string;
  chefTip?: string;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  matchScore?: number; // 0 - 100%
  matchedCount?: number;
  totalIngredientsCount?: number;
  matchedIngredients?: string[];
  missingIngredients?: string[];
  nutritionalBenefits?: string[];
  healthScore?: number; // 0 - 100
  healthyScore?: number; // alias for healthScore
  isHealthy?: boolean;
  healthyEligible?: boolean;
  healthHighlights?: string[];
  healthReasons?: string[];
  nutritionVerified?: boolean;
}

export type Recipe = NormalizedRecipe;

export interface IngredientCategory {
  id: string;
  name: string;
  iconName: string;
  items: string[];
}

export interface UserPantryState {
  selectedIngredients: string[];
  savedRecipeIds: string[];
  searchQuery: string;
  activeCategory: string;
  activeFilter: string;
}

export type FoodPreference =
  | 'Any'
  | 'Vegetarian'
  | 'Non-vegetarian'
  | 'High-protein'
  | 'Healthy'
  | 'Low-calorie';

export interface AIChefPromptParams {
  budget: number; // in INR (₹)
  budgetMode: 'total' | 'per_person';
  peopleCount: number;
  availableIngredients: string[];
  maxCookTimeMinutes: number;
  foodPreference: FoodPreference;
  userQuery: string;
}

export interface AIChefSuggestion {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  isBestMatch?: boolean;
  totalCost: number; // in INR (₹)
  costPerPerson: number; // in INR (₹)
  servings: number;
  cookingTimeMinutes: number;
  difficulty: DifficultyLevel;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  availableIngredients: string[];
  missingIngredients: string[];
  whyItMatches: string[];
  instructions: InstructionStep[];
  allIngredients: RecipeIngredient[];
  chefTip?: string;
  cuisine: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string;
  quantity?: number;
  unit?: string;
  category?: string;
  checked: boolean;
  recipeSource?: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Pro Home Cook';
  memberSince: string;
  foodPreferences: string[];
  dietaryPreferences: string[];
  nutritionGoals: string[];
  allergies: string[];
  defaultServings: number;
  maxCookTimeMinutes: number;
}

export interface CookingHistoryItem {
  id: string;
  recipeId: string;
  recipeName: string;
  recipeImage: string;
  cookedAt: string;
  servings: number;
  rating?: number;
}
