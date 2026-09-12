import type { NormalizedRecipe, PantryMatchResult } from '../models/recipe.model.js';
import { SEED_RECIPES } from '../data/seedRecipes.js';
import { defaultRecipeProvider } from '../providers/recipeProvider.js';

export interface PantryMatchOptions {
  ingredients: string[];
  searchMode?: 'best_match' | 'exact' | 'single' | 'multi';
  sortBy?: 'match' | 'missing_least' | 'time' | 'protein' | 'calories';
}

function normalizeStem(name: string): string {
  return name.toLowerCase().trim().replace(/(?:es|s|ies)$/i, '');
}

function isIngredientMatch(recipeIngName: string, userIngName: string): boolean {
  const r = recipeIngName.toLowerCase().trim();
  const u = userIngName.toLowerCase().trim();

  if (r === u) return true;
  if (r.includes(u) || u.includes(r)) return true;

  const rStem = normalizeStem(r);
  const uStem = normalizeStem(u);
  if (rStem.length >= 3 && uStem.length >= 3 && (rStem.includes(uStem) || uStem.includes(rStem))) {
    return true;
  }

  // Common culinary synonyms & equivalents
  if ((u === 'cheese' || u === 'parmesan' || u === 'cheddar') && (r.includes('cheese') || r.includes('parmesan') || r.includes('cheddar') || r.includes('mozzarella') || r.includes('feta'))) {
    return true;
  }
  if (u === 'rice' && (r.includes('rice') || r.includes('basmati') || r.includes('jasmine'))) {
    return true;
  }
  if (u === 'pasta' && (r.includes('pasta') || r.includes('spaghetti') || r.includes('penne') || r.includes('fettuccine') || r.includes('macaroni') || r.includes('noodles') || r.includes('linguine'))) {
    return true;
  }
  if ((u === 'egg' || u === 'eggs') && (r.includes('egg') || r.includes('eggs') || r.includes('egg yolk') || r.includes('egg white'))) {
    return true;
  }
  if ((u === 'potato' || u === 'potatoes') && (r.includes('potato') || r.includes('potatoes'))) {
    return true;
  }
  if ((u === 'chicken') && (r.includes('chicken') || r.includes('poultry'))) {
    return true;
  }

  return false;
}

export class PantryMatcher {
  public static async match(options: PantryMatchOptions): Promise<{
    recipes: PantryMatchResult[];
    exactCount: number;
    totalMatches: number;
  }> {
    const userIngredients = (options.ingredients || []).map((i) => i.toLowerCase().trim()).filter(Boolean);

    if (userIngredients.length === 0) {
      return {
        recipes: [],
        exactCount: 0,
        totalMatches: 0
      };
    }

    // 1. Collect candidate recipes from both SEED_RECIPES and real providers
    const candidateMap = new Map<string, NormalizedRecipe>();

    // Add seed recipes
    SEED_RECIPES.forEach((r) => {
      candidateMap.set(r.id, r);
    });

    // Query real providers for user ingredients
    try {
      const searchQueries = [
        userIngredients.join(' '),
        userIngredients[0],
        userIngredients.length > 1 ? userIngredients[1] : undefined
      ].filter(Boolean) as string[];

      const providerPromises = searchQueries.map((q) =>
        defaultRecipeProvider.searchRecipes({ query: q, limit: 20 }).catch(() => [])
      );

      const providerResults = await Promise.all(providerPromises);
      for (const list of providerResults) {
        for (const recipe of list) {
          if (!candidateMap.has(recipe.id)) {
            candidateMap.set(recipe.id, recipe);
          }
        }
      }
    } catch (err) {
      // Graceful fallback to seed recipes
    }

    const candidateList = Array.from(candidateMap.values());

    // 2. Calculate accurate pantry matching for each candidate
    const matches: PantryMatchResult[] = candidateList.map((recipe) => {
      const matchedIngredients: string[] = [];
      const missingIngredients: string[] = [];

      for (const ing of recipe.ingredients) {
        const isMatched = userIngredients.some((u) => isIngredientMatch(ing.name, u));

        if (isMatched) {
          matchedIngredients.push(ing.name);
        } else if (!ing.isOptional) {
          missingIngredients.push(ing.name);
        }
      }

      const totalRequired = recipe.ingredients.filter((i) => !i.isOptional).length || recipe.ingredients.length;
      const matchScore = totalRequired > 0 ? Math.round((matchedIngredients.length / totalRequired) * 100) : 0;

      const updatedRecipe: NormalizedRecipe = {
        ...recipe,
        ingredients: recipe.ingredients.map((i) => ({
          ...i,
          inPantry: matchedIngredients.includes(i.name)
        }))
      };

      return {
        recipe: updatedRecipe,
        matchScore: Math.min(100, matchScore),
        matchedCount: matchedIngredients.length,
        totalIngredientsCount: totalRequired,
        matchedIngredients,
        missingIngredients
      };
    });

    // 3. Filter according to searchMode
    let filtered = matches;
    if (options.searchMode === 'exact') {
      filtered = matches.filter((m) => m.matchScore === 100);
    } else if (options.searchMode === 'single') {
      const singleTarget = userIngredients[0];
      filtered = matches.filter((m) =>
        m.matchedIngredients.some((mi) => isIngredientMatch(mi, singleTarget))
      );
    } else if (options.searchMode === 'multi') {
      const minRequired = Math.min(2, userIngredients.length);
      filtered = matches.filter((m) => m.matchedCount >= minRequired);
    } else {
      // best_match: require at least 1 matched ingredient
      filtered = matches.filter((m) => m.matchedCount > 0);
    }

    // 4. Sort matches
    const sortBy = options.sortBy || 'match';
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'missing_least':
          return a.missingIngredients.length - b.missingIngredients.length || b.matchScore - a.matchScore;
        case 'time':
          return (a.recipe.cookingTime || 99) - (b.recipe.cookingTime || 99);
        case 'protein':
          return (b.recipe.protein || 0) - (a.recipe.protein || 0);
        case 'calories':
          return (a.recipe.calories || 9999) - (b.recipe.calories || 9999);
        case 'match':
        default:
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
          }
          return b.matchedCount - a.matchedCount;
      }
    });

    const exactCount = matches.filter((m) => m.matchScore === 100).length;

    return {
      recipes: filtered,
      exactCount,
      totalMatches: filtered.length
    };
  }
}
