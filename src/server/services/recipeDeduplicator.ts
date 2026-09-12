import type { NormalizedRecipe } from '../models/recipe.model.js';

export class RecipeDeduplicator {
  public static deduplicate(recipes: NormalizedRecipe[]): NormalizedRecipe[] {
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const result: NormalizedRecipe[] = [];

    for (const r of recipes) {
      const normalizedName = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenIds.has(r.id) && !seenNames.has(normalizedName)) {
        seenIds.add(r.id);
        seenNames.add(normalizedName);
        result.push(r);
      }
    }

    return result;
  }
}
