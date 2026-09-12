import type { NormalizedRecipe } from '../models/recipe.model.js';
import type { RecipeProvider, ProviderSearchOptions } from './recipeProvider.interface.js';
import { SpoonacularProvider } from './spoonacularProvider.js';
import { MealDbProvider } from './mealDbProvider.js';
import { DummyJsonProvider } from './dummyJsonProvider.js';
import { SEED_RECIPES } from '../data/seedRecipes.js';
import { RecipeDeduplicator } from '../services/recipeDeduplicator.js';
import { config } from '../config/env.js';

export class CompositeRecipeProvider implements RecipeProvider {
  public readonly name = 'composite';

  private spoonacular = new SpoonacularProvider();
  private mealDb = new MealDbProvider();
  private dummyJson = new DummyJsonProvider();

  public supportsId(_id: string): boolean {
    return true;
  }

  public async searchRecipes(options: ProviderSearchOptions): Promise<NormalizedRecipe[]> {
    let results: NormalizedRecipe[] = [];

    // 1. If Spoonacular API key is configured, search Spoonacular
    if (config.spoonacularApiKey) {
      try {
        const spoonResults = await this.spoonacular.searchRecipes(options);
        if (spoonResults.length > 0) {
          results.push(...spoonResults);
        }
      } catch (err) {
        console.warn('[CompositeRecipeProvider] Spoonacular search failed, using open providers fallback');
      }
    }

    // 2. Query open providers (MealDB & DummyJSON)
    const [mealDbResults, dummyResults] = await Promise.all([
      this.mealDb.searchRecipes(options).catch(() => []),
      this.dummyJson.searchRecipes(options).catch(() => [])
    ]);

    results.push(...mealDbResults);
    results.push(...dummyResults);

    // 3. Include matching seed recipes
    const q = (options.query || '').toLowerCase().trim();
    let matchingSeeds = [...SEED_RECIPES];
    if (q) {
      matchingSeeds = matchingSeeds.filter((r) => {
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesDesc = r.description?.toLowerCase().includes(q);
        const matchesCuisine = r.cuisine?.toLowerCase().includes(q);
        const matchesIng = r.ingredients.some((i) => i.name.toLowerCase().includes(q));
        return matchesName || matchesDesc || matchesCuisine || matchesIng;
      });
    }

    if (options.cuisine && options.cuisine !== 'All') {
      const targetCuisine = options.cuisine.toLowerCase();
      matchingSeeds = matchingSeeds.filter((r) => r.cuisine?.toLowerCase() === targetCuisine);
    }

    if (options.dietary && options.dietary !== 'All') {
      const targetDiet = options.dietary.toLowerCase();
      matchingSeeds = matchingSeeds.filter((r) => r.dietaryTags?.some((t) => t.toLowerCase() === targetDiet));
    }

    results.push(...matchingSeeds);

    // 4. Deduplicate across providers
    const deduplicated = RecipeDeduplicator.deduplicate(results);

    // 5. Apply sorting
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'time':
          deduplicated.sort((a, b) => (a.cookingTime || 99) - (b.cookingTime || 99));
          break;
        case 'calories':
          deduplicated.sort((a, b) => (a.calories || 9999) - (b.calories || 9999));
          break;
        case 'rating':
          deduplicated.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
      }
    }

    return deduplicated;
  }

  public async getRecipeDetails(id: string): Promise<NormalizedRecipe | null> {
    // 1. Direct ID prefix routing
    if (id.startsWith('spoonacular-')) {
      const res = await this.spoonacular.getRecipeDetails(id);
      if (res) return res;
    }

    if (id.startsWith('themealdb-')) {
      const res = await this.mealDb.getRecipeDetails(id);
      if (res) return res;
    }

    if (id.startsWith('dummyjson-')) {
      const res = await this.dummyJson.getRecipeDetails(id);
      if (res) return res;
    }

    // 2. Check seed dataset
    const seed = SEED_RECIPES.find((r) => r.id === id);
    if (seed) return seed;

    // 3. Fallback sequential lookup for raw IDs
    const [spoonRes, mealDbRes, dummyRes] = await Promise.all([
      this.spoonacular.getRecipeDetails(id).catch(() => null),
      this.mealDb.getRecipeDetails(id).catch(() => null),
      this.dummyJson.getRecipeDetails(id).catch(() => null)
    ]);

    return spoonRes || mealDbRes || dummyRes || null;
  }
}
