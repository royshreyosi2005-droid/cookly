import type { NormalizedRecipe } from '../models/recipe.model.js';
import { defaultRecipeProvider } from '../providers/recipeProvider.js';
import { RecipeCache } from './recipeCache.js';

export interface SearchFilterOptions {
  query?: string;
  cuisine?: string;
  dietary?: string;
  difficulty?: string;
  mealType?: string;
  sortBy?: 'relevance' | 'time' | 'calories' | 'rating';
  limit?: number;
  offset?: number;
}

export class RecipeSearchService {
  public static async search(options: SearchFilterOptions = {}): Promise<{ recipes: NormalizedRecipe[]; total: number }> {
    const cacheKey = `search_${JSON.stringify(options)}`;
    const cached = RecipeCache.get<{ recipes: NormalizedRecipe[]; total: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const allResults = await defaultRecipeProvider.searchRecipes(options);

    // Apply difficulty filter if specified (when provider doesn't filter it natively)
    let filtered = allResults;
    if (options.difficulty && options.difficulty !== 'All') {
      const targetDiff = options.difficulty.toLowerCase();
      filtered = filtered.filter((r) => r.difficulty?.toLowerCase() === targetDiff);
    }

    const total = filtered.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    const paginated = filtered.slice(offset, offset + limit);

    const responseData = { recipes: paginated, total };
    RecipeCache.set(cacheKey, responseData);
    return responseData;
  }
}
