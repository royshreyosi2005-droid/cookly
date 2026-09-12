import type { NormalizedRecipe } from '../models/recipe.model.js';
import { defaultRecipeProvider } from '../providers/recipeProvider.js';
import { NotFoundError } from '../models/api.model.js';
import { RecipeCache } from './recipeCache.js';

export class RecipeDetailsService {
  public static async getById(id: string): Promise<NormalizedRecipe> {
    const cacheKey = `recipe_detail_${id}`;
    const cached = RecipeCache.get<NormalizedRecipe>(cacheKey);
    if (cached) {
      return cached;
    }

    const recipe = await defaultRecipeProvider.getRecipeDetails(id);
    if (!recipe) {
      throw new NotFoundError(`Recipe with id '${id}' was not found.`);
    }

    RecipeCache.set(cacheKey, recipe);
    return recipe;
  }
}
