import type { NormalizedRecipe, NormalizedIngredient } from '../models/recipe.model.js';
import type { RecipeProvider, ProviderSearchOptions } from './recipeProvider.interface.js';

export class MealDbProvider implements RecipeProvider {
  public readonly name = 'themealdb';
  private readonly baseUrl = 'https://www.themealdb.com/api/json/v1/1';

  public supportsId(id: string): boolean {
    return id.startsWith('themealdb-');
  }

  public async searchRecipes(options: ProviderSearchOptions): Promise<NormalizedRecipe[]> {
    try {
      const q = (options.query || '').trim().toLowerCase();
      let meals: any[] = [];

      // Query synonyms mapping for common culinary dishes
      let searchTerms = [q];
      if (q === 'momo' || q === 'momos') {
        searchTerms = ['momo', 'dumpling', 'wonton'];
      } else if (q === 'paneer tikka' || q === 'paneer') {
        searchTerms = ['paneer', 'curry'];
      } else if (q.includes(' ')) {
        // Multi-word fallback (e.g. 'chicken soup' -> 'soup', 'chicken')
        searchTerms = [q, ...q.split(/\s+/).filter(w => w.length > 2)];
      }

      for (const term of searchTerms) {
        if (!term) continue;
        const url = `${this.baseUrl}/search.php?s=${encodeURIComponent(term)}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        try {
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);
          if (res.ok) {
            const data: any = await res.json();
            if (data.meals && Array.isArray(data.meals)) {
              meals.push(...data.meals);
              if (meals.length >= 5) break;
            }
          }
        } catch {
          clearTimeout(timeout);
        }
      }

      if (meals.length === 0 && !q) {
        let defaultTerm = 'chicken';
        if (options.cuisine && options.cuisine !== 'All') {
          defaultTerm = options.cuisine;
        } else if (options.dietary?.toLowerCase().includes('veg')) {
          defaultTerm = 'paneer';
        }

        const defaultUrl = `${this.baseUrl}/search.php?s=${encodeURIComponent(defaultTerm)}`;
        try {
          const res = await fetch(defaultUrl);
          if (res.ok) {
            const data: any = await res.json();
            if (data.meals) meals = data.meals;
          }
        } catch {}
      }

      // Deduplicate raw meals by idMeal
      const uniqueMeals = Array.from(new Map(meals.map((m: any) => [m.idMeal, m])).values());
      let recipes: NormalizedRecipe[] = uniqueMeals.map((meal: any) => this.normalizeMeal(meal));

      // If query was provided, rank recipes containing query tokens higher
      if (q) {
        const tokens = q.split(/\s+/);
        recipes = recipes.filter((r: NormalizedRecipe) => {
          const target = `${r.name} ${r.description || ''} ${r.ingredients.map((i: NormalizedIngredient) => i.name).join(' ')}`.toLowerCase();
          return tokens.some((tok: string) => target.includes(tok));
        });
      }

      // Apply in-memory filters if specified
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
      console.warn(`[MealDbProvider] Search error:`, err?.message || err);
      return [];
    }
  }

  public async getRecipeDetails(id: string): Promise<NormalizedRecipe | null> {
    const rawId = id.replace(/^themealdb-/, '');
    if (!rawId) return null;

    try {
      const url = `${this.baseUrl}/lookup.php?i=${encodeURIComponent(rawId)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) return null;

      const data: any = await res.json();
      if (!data.meals || !Array.isArray(data.meals) || data.meals.length === 0) {
        return null;
      }

      return this.normalizeMeal(data.meals[0]);
    } catch (err: any) {
      console.warn(`[MealDbProvider] Detail error:`, err?.message || err);
      return null;
    }
  }

  private normalizeMeal(meal: any): NormalizedRecipe {
    const ingredients: NormalizedIngredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const name = meal[`strIngredient${i}`]?.trim();
      const amount = meal[`strMeasure${i}`]?.trim() || '';
      if (name) {
        ingredients.push({
          name,
          amount: amount || '1 portion',
          inPantry: false
        });
      }
    }

    const rawInstructions: string = meal.strInstructions || '';
    const splitSteps = rawInstructions
      .split(/\r?\n+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 8 && !s.match(/^(STEP\s*\d+|INSTRUCTIONS?)$/i));

    const instructions = splitSteps.length > 0 ? splitSteps : [rawInstructions || 'Cook thoroughly according to taste.'];

    const category = (meal.strCategory || '').toLowerCase();
    const tags: string[] = ['Comfort Food'];
    if (category.includes('veg') || (meal.strTags || '').toLowerCase().includes('veg')) tags.push('Vegetarian');
    if (category.includes('chicken') || category.includes('beef') || category.includes('seafood') || category.includes('lamb')) {
      tags.push('High-Protein');
    }
    if (category.includes('breakfast')) tags.push('Healthy Breakfast');

    const image = meal.strMealThumb || null;
    const title = meal.strMeal || 'Untitled Dish';

    return {
      id: `themealdb-${meal.idMeal}`,
      name: title,
      title: title,
      image: image,
      imageUrl: image || '',
      description: `Authentic ${title} prepared with ${ingredients.slice(0, 3).map((i) => i.name).join(', ')}.`,
      ingredients: ingredients.length > 0 ? ingredients : [{ name: 'Assorted ingredients', amount: '1 portion' }],
      instructions,
      cookingTime: 30,
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 4,
      difficulty: 'Medium',
      calories: 450,
      protein: 22,
      carbs: 48,
      fat: 16,
      fiber: 3,
      cuisine: meal.strArea || 'International',
      mealType: meal.strCategory || 'Main Dish',
      dietaryTags: tags,
      tags: tags,
      source: 'themealdb',
      sourceUrl: meal.strSource || meal.strYoutube || undefined,
      rating: 4.8,
      reviewCount: 88
    };
  }
}
