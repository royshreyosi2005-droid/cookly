import type { Recipe } from '../types';
import { searchUniversalRecipes, calculatePantryMatch, type UniversalSearchOptions } from './universalRecipeEngine';

/**
 * Saves and retrieves recent search queries for instant discovery
 */
export const RecentSearchStorage = {
  getRecent(): string[] {
    try {
      const raw = localStorage.getItem('cookly_recent_searches');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  add(query: string) {
    try {
      const trimmed = query.trim();
      if (!trimmed || trimmed.length < 2) return;
      const recent = this.getRecent().filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      recent.unshift(trimmed);
      localStorage.setItem('cookly_recent_searches', JSON.stringify(recent.slice(0, 8)));
    } catch {}
  },
  clear() {
    try {
      localStorage.removeItem('cookly_recent_searches');
    } catch {}
  }
};

/**
 * Calculates match score and annotates ingredients based on user pantry items
 */
export function enrichRecipeWithPantry(recipe: Recipe, userPantry: string[]): Recipe {
  return calculatePantryMatch(recipe, userPantry);
}

/**
 * Delegates dynamic recipe searches directly to the authoritative universal recipe engine.
 */
export async function searchDynamicRecipes(
  query: string,
  options: {
    cuisine?: string;
    dietary?: string;
    difficulty?: string;
    userPantry?: string[];
  } = {}
): Promise<Recipe[]> {
  const searchOpts: UniversalSearchOptions = {
    query,
    cuisine: options.cuisine,
    dietary: options.dietary,
    difficulty: options.difficulty,
    userPantry: options.userPantry
  };

  return searchUniversalRecipes(searchOpts);
}
