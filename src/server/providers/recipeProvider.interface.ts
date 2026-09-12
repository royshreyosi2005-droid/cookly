import type { NormalizedRecipe } from '../models/recipe.model.js';

export interface ProviderSearchOptions {
  query?: string;
  cuisine?: string;
  dietary?: string;
  difficulty?: string;
  mealType?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'time' | 'calories' | 'rating';
}

export interface RecipeProvider {
  readonly name: string;
  searchRecipes(options: ProviderSearchOptions): Promise<NormalizedRecipe[]>;
  getRecipeDetails(id: string): Promise<NormalizedRecipe | null>;
  supportsId(id: string): boolean;
}
