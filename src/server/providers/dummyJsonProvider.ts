import type { NormalizedRecipe, NormalizedIngredient } from '../models/recipe.model.js';
import type { RecipeProvider, ProviderSearchOptions } from './recipeProvider.interface.js';

export class DummyJsonProvider implements RecipeProvider {
  public readonly name = 'dummyjson';
  private readonly baseUrl = 'https://dummyjson.com/recipes';

  public supportsId(id: string): boolean {
    return id.startsWith('dummyjson-');
  }

  public async searchRecipes(options: ProviderSearchOptions): Promise<NormalizedRecipe[]> {
    try {
      const q = (options.query || '').trim();
      const limit = options.limit || 30;
      const offset = options.offset || 0;

      const url = q
        ? `${this.baseUrl}/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${offset}`
        : `${this.baseUrl}?limit=${limit}&skip=${offset}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        return [];
      }

      const data: any = await res.json();
      if (!data.recipes || !Array.isArray(data.recipes)) {
        return [];
      }

      let recipes: NormalizedRecipe[] = data.recipes.map((r: any) => this.normalizeRecipe(r));

      if (options.cuisine && options.cuisine !== 'All') {
        const targetCuisine = options.cuisine.toLowerCase();
        recipes = recipes.filter((r: NormalizedRecipe) => r.cuisine?.toLowerCase().includes(targetCuisine));
      }

      if (options.dietary && options.dietary !== 'All') {
        const targetDiet = options.dietary.toLowerCase();
        recipes = recipes.filter((r: NormalizedRecipe) => r.dietaryTags?.some((t: string) => t.toLowerCase() === targetDiet));
      }

      return recipes;
    } catch (err: any) {
      console.warn(`[DummyJsonProvider] Search error:`, err?.message || err);
      return [];
    }
  }

  public async getRecipeDetails(id: string): Promise<NormalizedRecipe | null> {
    const rawId = id.replace(/^dummyjson-/, '');
    if (!rawId || !/^\d+$/.test(rawId)) return null;

    try {
      const url = `${this.baseUrl}/${encodeURIComponent(rawId)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) return null;

      const data: any = await res.json();
      if (!data || !data.name) return null;

      return this.normalizeRecipe(data);
    } catch (err: any) {
      console.warn(`[DummyJsonProvider] Detail error:`, err?.message || err);
      return null;
    }
  }

  private normalizeRecipe(r: any): NormalizedRecipe {
    const rawIngredients: string[] = r.ingredients || [];
    const ingredients: NormalizedIngredient[] = rawIngredients.map((name: string) => ({
      name,
      amount: '1 portion',
      inPantry: false
    }));

    const instructions: string[] = Array.isArray(r.instructions)
      ? r.instructions
      : typeof r.instructions === 'string'
      ? [r.instructions]
      : ['Follow standard cooking procedure.'];

    const tags: string[] = ['Balanced Meals'];
    const rawTags = (r.tags || []).map((t: string) => t.toLowerCase());
    if (rawTags.some((t: string) => t.includes('veg'))) tags.push('Vegetarian');
    if (rawTags.some((t: string) => t.includes('protein') || t.includes('chicken'))) tags.push('High-Protein');

    const prep = r.prepTimeMinutes || 15;
    const cook = r.cookTimeMinutes || 20;
    const cookingTime = prep + cook;
    const image = r.image || `https://cdn.dummyjson.com/recipe-images/${r.id}.webp`;
    const calories = r.caloriesPerServing || 360;

    // Macro estimation based on ingredients & calories
    const ingLower = rawIngredients.map((i) => i.toLowerCase());
    let protein = 12;
    let fiber = 3;
    const fat = Math.max(4, Math.round((calories * 0.28) / 9));
    const carbs = Math.max(15, Math.round((calories - protein * 4 - fat * 9) / 4));

    if (ingLower.some((i) => i.includes('chicken') || i.includes('salmon') || i.includes('beef') || i.includes('tuna') || i.includes('turkey'))) {
      protein = Math.max(24, Math.min(42, Math.round((calories * 0.3) / 4)));
    } else if (ingLower.some((i) => i.includes('paneer') || i.includes('tofu') || i.includes('egg') || i.includes('lentil') || i.includes('chickpea'))) {
      protein = Math.max(16, Math.min(26, Math.round((calories * 0.22) / 4)));
    }

    if (ingLower.some((i) => i.includes('quinoa') || i.includes('oat') || i.includes('spinach') || i.includes('broccoli') || i.includes('chickpea'))) {
      fiber = 6;
    }

    const title = r.name || 'Untitled Recipe';

    return {
      id: `dummyjson-${r.id}`,
      name: title,
      title: title,
      image: image,
      imageUrl: image,
      description: `${title} crafted with ${r.cuisine || 'international'} flair.`,
      ingredients: ingredients.length > 0 ? ingredients : [{ name: 'Assorted ingredients', amount: '1 portion' }],
      instructions,
      cookingTime,
      prepTimeMinutes: prep,
      cookTimeMinutes: cook,
      servings: r.servings || 4,
      difficulty: (r.difficulty as any) || 'Easy',
      calories,
      protein,
      carbs,
      fat,
      fiber,
      cuisine: r.cuisine || 'International',
      mealType: r.mealType?.[0] || 'Dinner',
      dietaryTags: tags,
      tags: tags,
      source: 'dummyjson',
      sourceUrl: `https://dummyjson.com/recipes/${r.id}`,
      rating: r.rating || 4.7,
      reviewCount: r.reviewCount || 60
    };
  }
}
