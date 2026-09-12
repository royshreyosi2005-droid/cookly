import type { NormalizedRecipe } from '../models/recipe.model.js';
import { SEED_RECIPES } from '../data/seedRecipes.js';

export interface HealthyFilterOptions {
  category?: string;
  minProtein?: number;
  minFiber?: number;
  maxCalories?: number;
  maxCookTime?: number;
  query?: string;
}

export class HealthyRecipeService {
  public static async search(options: HealthyFilterOptions = {}): Promise<{
    recipes: NormalizedRecipe[];
    count: number;
  }> {
    let results = SEED_RECIPES.filter((r) => {
      if (r.mealType === 'Dessert') return false;
      const lower = r.name.toLowerCase();
      if (lower.includes('cake') || lower.includes('fudge') || lower.includes('butter masala')) return false;
      return true;
    });

    // Filter by category
    if (options.category && options.category !== 'All Healthy') {
      const cat = options.category.toLowerCase();
      if (cat.includes('protein')) {
        results = results.filter((r) => (r.protein || 0) >= 20);
      } else if (cat.includes('calorie') || cat.includes('weight')) {
        results = results.filter((r) => (r.calories || 999) <= 400);
      } else if (cat.includes('keto') || cat.includes('low-carb')) {
        results = results.filter((r) => (r.carbs || 999) <= 20 || r.dietaryTags?.includes('Keto'));
      } else if (cat.includes('fiber') || cat.includes('gut')) {
        results = results.filter((r) => (r.fiber || 0) >= 5);
      } else if (cat.includes('quick')) {
        results = results.filter((r) => (r.cookingTime || 99) <= 20);
      }
    }

    // Direct threshold filters
    if (typeof options.minProtein === 'number') {
      results = results.filter((r) => (r.protein || 0) >= options.minProtein!);
    }
    if (typeof options.minFiber === 'number') {
      results = results.filter((r) => (r.fiber || 0) >= options.minFiber!);
    }
    if (typeof options.maxCalories === 'number') {
      results = results.filter((r) => (r.calories || 999) <= options.maxCalories!);
    }
    if (typeof options.maxCookTime === 'number') {
      results = results.filter((r) => (r.cookingTime || 99) <= options.maxCookTime!);
    }

    // Query filter
    if (options.query && options.query.trim()) {
      const tokens = options.query.toLowerCase().trim().split(/\s+/).filter((t) => t.length > 2);
      if (tokens.length > 0) {
        results = results.filter((r) => {
          const target = `${r.name} ${r.description || ''} ${r.cuisine || ''} ${r.ingredients.map((i) => i.name).join(' ')}`.toLowerCase();
          return tokens.some((token) => target.includes(token));
        });
      }
    }

    return {
      recipes: results,
      count: results.length
    };
  }
}
