import type {
  AgentResponse,
  ParsedConstraints,
  AppliedFilters,
  AIChefAgentSummary
} from '../models/agent.model.js';
import type { NormalizedRecipe, PantryMatchResult, AIChefMealSuggestion } from '../models/recipe.model.js';
import { NLUEngine } from './nluEngine.js';
import { RecipeSearchService } from '../services/recipeSearchService.js';
import { HealthyRecipeService } from '../services/healthyRecipeService.js';
import { PantryMatcher } from '../services/pantryMatcher.js';
import { AIChefService } from '../services/aiChefService.js';

export interface AgentProcessOptions {
  pantry?: string[];
  filters?: Partial<AppliedFilters>;
}

export class CooklyAgent {
  public static async process(prompt: string, options: AgentProcessOptions = {}): Promise<AgentResponse> {
    const startTime = Date.now();
    const constraints: ParsedConstraints = NLUEngine.parse(prompt, options.pantry || []);

    let recipes: NormalizedRecipe[] = [];
    let pantryMatches: PantryMatchResult[] | undefined;
    let aiChefSuggestions: AIChefMealSuggestion[] | undefined;
    let aiChefSummary: AIChefAgentSummary | undefined;
    let explanation = '';

    const filtersApplied: AppliedFilters = {
      cuisine: constraints.cuisine,
      mealType: constraints.mealType,
      dietary: constraints.dietaryTags.length > 0 ? constraints.dietaryTags : undefined,
      maxTime: constraints.maxCookingTime,
      maxCalories: constraints.maxCalories,
      minProtein: constraints.minProtein,
      excludedIngredients: constraints.excludedIngredients.length > 0 ? constraints.excludedIngredients : undefined,
      includedIngredients: constraints.includedIngredients.length > 0 ? constraints.includedIngredients : undefined,
      budgetApplied: constraints.budget !== undefined
    };

    switch (constraints.intent) {
      case 'AI_CHEF': {
        const budget = constraints.budget || 200;
        const peopleCount = constraints.servings || 2;
        const preference = constraints.dietaryTags.includes('Vegetarian')
          ? 'Vegetarian'
          : constraints.isHealthy
          ? 'Healthy'
          : 'Any';

        const aiChefResult = await AIChefService.generate({
          prompt,
          budget,
          peopleCount,
          maxCookTimeMinutes: constraints.maxCookingTime || 30,
          foodPreference: preference,
          ingredients: constraints.includedIngredients,
          cuisine: constraints.cuisine
        });

        aiChefSuggestions = aiChefResult.suggestions;

        // Populate recipes from suggestions
        recipes = aiChefSuggestions.map((s) => ({
          id: s.id.replace(/^ai_/, ''),
          name: s.title,
          title: s.title,
          description: s.description,
          image: s.imageUrl || null,
          imageUrl: s.imageUrl || '',
          cookingTime: s.cookingTimeMinutes,
          servings: s.servings,
          difficulty: s.difficulty as any,
          cuisine: s.cuisine,
          calories: s.calories,
          protein: s.proteinGrams,
          carbs: s.carbsGrams,
          fat: s.fatGrams,
          fiber: s.fiberGrams,
          source: 'Cookly AI Chef',
          dietaryTags: ['Quick & Easy'],
          tags: ['Quick & Easy'],
          ingredients: s.allIngredients.map((i) => ({
            name: i.name,
            amount: i.amount,
            inPantry: i.inPantry
          })),
          instructions: s.instructions.map((inst) => inst.instruction),
          chefTip: s.chefTip
        }));

        const costPerPerson = Math.round(budget / peopleCount);
        aiChefSummary = {
          budget,
          budgetMode: constraints.budgetMode || 'total',
          servings: peopleCount,
          availableIngredients: constraints.includedIngredients,
          missingIngredients: aiChefResult.suggestions[0]?.missingIngredientsToBuy || [],
          dietaryPreference: preference,
          maxCookingTime: constraints.maxCookingTime || 30,
          estimatedCostNote: `Estimated budget fit: approx ₹${costPerPerson}/person based on standard pantry staples and ingredient portions. Actual local market prices may vary.`
        };

        explanation = `Crafted meal plan for ${peopleCount} people under ₹${budget} (approx ₹${costPerPerson}/person), prioritizing ready cook times and ingredient affordability.`;
        break;
      }

      case 'HEALTHY_SEARCH': {
        const healthyResult = await HealthyRecipeService.search({
          query: constraints.cleanedQuery,
          maxCalories: constraints.maxCalories,
          minProtein: constraints.minProtein,
          minFiber: constraints.minFiber,
          maxCookTime: constraints.maxCookingTime
        });

        recipes = this.filterRecipes(healthyResult.recipes, constraints);

        const highlights: string[] = [];
        if (constraints.minProtein) highlights.push(`≥${constraints.minProtein}g protein`);
        if (constraints.maxCalories) highlights.push(`≤${constraints.maxCalories} kcal`);
        if (constraints.maxCookingTime) highlights.push(`≤${constraints.maxCookingTime} mins`);

        explanation = `Found ${recipes.length} verified healthy recipes${highlights.length > 0 ? ` matching ${highlights.join(', ')}` : ''}.`;
        break;
      }

      case 'PANTRY_MATCH': {
        const ingredients = constraints.includedIngredients.length > 0
          ? constraints.includedIngredients
          : (options.pantry || []);

        const matchResult = await PantryMatcher.match({
          ingredients,
          searchMode: 'best_match'
        });

        pantryMatches = matchResult.recipes;

        // If specific exclusions exist, filter pantry matches
        if (constraints.excludedIngredients.length > 0) {
          pantryMatches = pantryMatches.filter((pm) => {
            const hasEx = pm.recipe.ingredients.some((ing) =>
              constraints.excludedIngredients.some((ex) => ing.name.toLowerCase().includes(ex.toLowerCase()))
            );
            return !hasEx;
          });
        }

        recipes = pantryMatches.map((pm) => {
          const rec = { ...pm.recipe };
          rec.matchScore = pm.matchScore;
          rec.matchedCount = pm.matchedCount;
          rec.totalIngredientsCount = pm.totalIngredientsCount;
          rec.matchedIngredients = pm.matchedIngredients;
          rec.missingIngredients = pm.missingIngredients;
          return rec;
        });

        recipes = this.filterRecipes(recipes, constraints);

        const topScore = recipes[0]?.matchScore || 0;
        explanation = `Matched ${recipes.length} recipes against your ingredients (${ingredients.join(', ')}). Top match: ${topScore}%.`;
        break;
      }

      case 'INGREDIENT_SEARCH':
      case 'CUISINE_SEARCH':
      case 'MEAL_TYPE_SEARCH':
      case 'GENERAL_SEARCH':
      case 'RECIPE_DETAILS':
      default: {
        const searchRes = await RecipeSearchService.search({
          query: constraints.cleanedQuery || undefined,
          cuisine: constraints.cuisine,
          dietary: constraints.dietaryTags[0],
          mealType: constraints.mealType,
          limit: 30
        });

        recipes = this.filterRecipes(searchRes.recipes, constraints);

        const appliedDetails: string[] = [];
        if (constraints.cuisine) appliedDetails.push(`${constraints.cuisine} cuisine`);
        if (constraints.excludedIngredients.length > 0) appliedDetails.push(`without ${constraints.excludedIngredients.join(', ')}`);
        if (constraints.dietaryTags.length > 0) appliedDetails.push(constraints.dietaryTags.join(', '));
        if (constraints.maxCookingTime) appliedDetails.push(`under ${constraints.maxCookingTime} mins`);

        explanation = `Discovered ${recipes.length} recipes${appliedDetails.length > 0 ? ` with ${appliedDetails.join(' & ')}` : ''}.`;
        break;
      }
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      intent: constraints.intent,
      interpretedRequest: {
        originalPrompt: prompt,
        summary: this.buildSummary(constraints),
        constraints
      },
      recipes,
      pantryMatches,
      aiChefSuggestions,
      aiChefSummary,
      explanation,
      filtersApplied,
      meta: {
        total: recipes.length,
        processingTimeMs,
        timestamp: new Date().toISOString()
      }
    };
  }

  private static filterRecipes(list: NormalizedRecipe[], constraints: ParsedConstraints): NormalizedRecipe[] {
    return list.filter((recipe) => {
      // 1. Exclusion filter (e.g. without dairy, without meat, etc.)
      if (constraints.excludedIngredients.length > 0) {
        const hasNonOptionalExcluded = recipe.ingredients.some((ing) => {
          if (ing.isOptional) return false;
          const name = ing.name.toLowerCase();
          return constraints.excludedIngredients.some((ex) => name.includes(ex.toLowerCase()));
        });
        if (hasNonOptionalExcluded) return false;
      }

      // 2. Cooking time limit filter
      if (constraints.maxCookingTime) {
        const time = recipe.cookingTime || 30;
        if (time > constraints.maxCookingTime) return false;
      }

      // 3. Dietary tag matching
      if (constraints.dietaryTags.includes('Vegetarian')) {
        const isVeg = recipe.dietaryTags?.some((t) => t.toLowerCase().includes('veg')) ||
                      !recipe.ingredients.some((i) => {
                        const n = i.name.toLowerCase();
                        return n.includes('chicken') || n.includes('beef') || n.includes('meat') || n.includes('fish') || n.includes('pork') || n.includes('mutton') || n.includes('lamb');
                      });
        if (!isVeg) return false;
      }

      // 4. Calorie filter
      if (constraints.maxCalories && recipe.calories) {
        if (recipe.calories > constraints.maxCalories) return false;
      }

      // 5. Protein filter
      if (constraints.minProtein && recipe.protein) {
        const p = typeof recipe.protein === 'number' ? recipe.protein : parseInt(String(recipe.protein), 10);
        if (!isNaN(p) && p < constraints.minProtein) return false;
      }

      return true;
    });
  }

  private static buildSummary(c: ParsedConstraints): string {
    const parts: string[] = [];
    if (c.intent === 'AI_CHEF') parts.push(`AI Chef meal plan`);
    else if (c.intent === 'HEALTHY_SEARCH') parts.push(`Healthy recipe search`);
    else if (c.intent === 'PANTRY_MATCH') parts.push(`Pantry match search`);
    else parts.push(`Recipe discovery`);

    if (c.cuisine) parts.push(`for ${c.cuisine} cuisine`);
    if (c.dietaryTags.length > 0) parts.push(`(${c.dietaryTags.join(', ')})`);
    if (c.budget) parts.push(`budget ₹${c.budget}`);
    if (c.servings) parts.push(`for ${c.servings} people`);
    if (c.maxCookingTime) parts.push(`under ${c.maxCookingTime} mins`);
    if (c.excludedIngredients.length > 0) parts.push(`excluding ${c.excludedIngredients.join(', ')}`);

    return parts.join(' ');
  }
}
