import type { NormalizedRecipe, NormalizedIngredient } from '../models/recipe.model.js';
import type { RecipeProvider, ProviderSearchOptions } from './recipeProvider.interface.js';
import { config } from '../config/env.js';

export class SpoonacularProvider implements RecipeProvider {
  public readonly name = 'spoonacular';
  private readonly baseUrl = 'https://api.spoonacular.com/recipes';

  private get apiKey(): string | undefined {
    return config.spoonacularApiKey;
  }

  public supportsId(id: string): boolean {
    return id.startsWith('spoonacular-');
  }

  public async searchRecipes(options: ProviderSearchOptions): Promise<NormalizedRecipe[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const url = new URL(`${this.baseUrl}/complexSearch`);
      url.searchParams.set('apiKey', this.apiKey);
      url.searchParams.set('addRecipeInformation', 'true');
      url.searchParams.set('fillIngredients', 'true');
      url.searchParams.set('addRecipeNutrition', 'true');
      url.searchParams.set('number', String(options.limit || 20));
      url.searchParams.set('offset', String(options.offset || 0));

      if (options.query && options.query.trim()) {
        url.searchParams.set('query', options.query.trim());
      }
      if (options.cuisine && options.cuisine !== 'All') {
        url.searchParams.set('cuisine', options.cuisine);
      }
      if (options.dietary && options.dietary !== 'All') {
        url.searchParams.set('diet', options.dietary.toLowerCase());
      }
      if (options.mealType && options.mealType !== 'All') {
        url.searchParams.set('type', options.mealType.toLowerCase());
      }
      if (options.sortBy) {
        if (options.sortBy === 'time') url.searchParams.set('sort', 'time');
        else if (options.sortBy === 'calories') url.searchParams.set('sort', 'calories');
        else if (options.sortBy === 'rating') url.searchParams.set('sort', 'popularity');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(`[SpoonacularProvider] HTTP Error ${res.status}: ${res.statusText}`);
        return [];
      }

      const data: any = await res.json();
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((item: any) => this.normalizeItem(item));
    } catch (err: any) {
      console.warn(`[SpoonacularProvider] Search error:`, err?.message || err);
      return [];
    }
  }

  public async getRecipeDetails(id: string): Promise<NormalizedRecipe | null> {
    if (!this.apiKey) {
      return null;
    }

    const rawId = id.replace(/^spoonacular-/, '');
    if (!/^\d+$/.test(rawId)) {
      return null;
    }

    try {
      const url = `${this.baseUrl}/${rawId}/information?includeNutrition=true&apiKey=${this.apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        return null;
      }

      const data: any = await res.json();
      return this.normalizeItem(data);
    } catch (err: any) {
      console.warn(`[SpoonacularProvider] Detail error:`, err?.message || err);
      return null;
    }
  }

  private normalizeItem(item: any): NormalizedRecipe {
    const rawIngredients = item.extendedIngredients || item.missedIngredients || [];
    const ingredients: NormalizedIngredient[] = rawIngredients.map((ing: any) => ({
      name: ing.nameClean || ing.name || 'Ingredient',
      amount: ing.amount ? `${Number(ing.amount.toFixed(1))} ${ing.unit || ''}`.trim() : '1 portion',
      unit: ing.unit || undefined,
      inPantry: false
    }));

    let instructions: string[] = [];
    if (item.analyzedInstructions && item.analyzedInstructions.length > 0 && item.analyzedInstructions[0].steps) {
      instructions = item.analyzedInstructions[0].steps.map((s: any) => s.step);
    } else if (typeof item.instructions === 'string' && item.instructions.trim()) {
      instructions = item.instructions
        .replace(/<[^>]*>/g, '')
        .split(/\r?\n+/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 5);
    }

    const nutrients = item.nutrition?.nutrients || [];
    const findNutrient = (name: string) => {
      const found = nutrients.find((n: any) => n.name?.toLowerCase() === name.toLowerCase());
      return found ? Math.round(found.amount) : undefined;
    };

    const calories = findNutrient('Calories') || (item.calories ? Math.round(item.calories) : undefined);
    const protein = findNutrient('Protein');
    const carbs = findNutrient('Carbohydrates');
    const fat = findNutrient('Fat');
    const fiber = findNutrient('Fiber');

    const cookingTime = item.readyInMinutes || 30;
    const prepTimeMinutes = item.preparationMinutes || Math.round(cookingTime * 0.4);
    const cookTimeMinutes = item.cookingMinutes || Math.round(cookingTime * 0.6);

    const tags: string[] = [];
    if (item.vegetarian) tags.push('Vegetarian');
    if (item.vegan) tags.push('Vegan');
    if (item.glutenFree) tags.push('Gluten-Free');
    if (item.dairyFree) tags.push('Dairy-Free');
    if (item.veryHealthy) tags.push('Balanced Meals');
    if (protein && protein >= 20) tags.push('High-Protein');
    if (fiber && fiber >= 5) tags.push('High-Fiber');
    if (cookingTime <= 25) tags.push('Quick & Easy');

    const cleanSummary = item.summary ? item.summary.replace(/<[^>]*>/g, '').slice(0, 180) + '...' : undefined;
    const title = item.title || 'Untitled Recipe';
    const image = item.image || null;

    let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
    if (cookingTime <= 25) difficulty = 'Easy';
    else if (cookingTime > 50) difficulty = 'Hard';

    return {
      id: `spoonacular-${item.id}`,
      name: title,
      title: title,
      image: image,
      imageUrl: image || '',
      description: cleanSummary || `Delicious ${title} prepared with fresh ingredients.`,
      ingredients: ingredients.length > 0 ? ingredients : [{ name: 'Assorted Ingredients', amount: '1 portion' }],
      instructions: instructions.length > 0 ? instructions : ['Follow standard preparation instructions.'],
      calories,
      protein,
      carbs,
      fat,
      fiber,
      cookingTime,
      prepTimeMinutes,
      cookTimeMinutes,
      servings: item.servings || 4,
      cuisine: item.cuisines?.[0] || 'International',
      mealType: item.dishTypes?.[0] || 'Main Course',
      dietaryTags: tags,
      tags: tags,
      source: 'spoonacular',
      sourceUrl: item.sourceUrl || item.spoonacularSourceUrl,
      rating: 4.8,
      reviewCount: item.aggregateLikes || 65,
      difficulty,
      isHealthy: item.veryHealthy || (protein && protein >= 20 && calories && calories <= 500)
    };
  }
}
