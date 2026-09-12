import type { NormalizedRecipe, NormalizedIngredient } from '../models/recipe.model.js';

export class RecipeNormalizer {
  public static normalize(raw: Partial<NormalizedRecipe> & Record<string, any>): NormalizedRecipe {
    const id = String(raw.id || `rec_${Math.random().toString(36).substring(2, 9)}`);
    const name = String(raw.name || raw.title || 'Untitled Recipe').trim();
    const image = typeof raw.image === 'string' ? raw.image : (typeof raw.imageUrl === 'string' ? raw.imageUrl : null);

    // Normalize ingredients
    const rawIngredients = Array.isArray(raw.ingredients) ? raw.ingredients : [];
    const ingredients: NormalizedIngredient[] = rawIngredients.map((ing: any) => {
      if (typeof ing === 'string') {
        return {
          name: ing.trim(),
          amount: '1',
          unit: 'pcs',
          inPantry: false
        };
      }
      return {
        name: String(ing.name || 'Ingredient').trim(),
        amount: String(ing.amount || '1'),
        unit: ing.unit ? String(ing.unit) : undefined,
        inPantry: Boolean(ing.inPantry),
        isOptional: Boolean(ing.isOptional),
        category: ing.category ? String(ing.category) : undefined
      };
    });

    // Normalize instructions
    let instructions: string[] = [];
    if (Array.isArray(raw.instructions)) {
      instructions = raw.instructions.map((step: any) => {
        if (typeof step === 'string') return step.trim();
        if (step && typeof step.instruction === 'string') return step.instruction.trim();
        return String(step);
      });
    }

    return {
      id,
      name,
      image,
      description: raw.description ? String(raw.description).trim() : undefined,
      ingredients,
      instructions,
      calories: typeof raw.calories === 'number' ? raw.calories : undefined,
      protein: typeof raw.protein === 'number' ? raw.protein : (typeof raw.proteinGrams === 'number' ? raw.proteinGrams : undefined),
      carbs: typeof raw.carbs === 'number' ? raw.carbs : (typeof raw.carbsGrams === 'number' ? raw.carbsGrams : undefined),
      fat: typeof raw.fat === 'number' ? raw.fat : (typeof raw.fatGrams === 'number' ? raw.fatGrams : undefined),
      fiber: typeof raw.fiber === 'number' ? raw.fiber : (typeof raw.fiberGrams === 'number' ? raw.fiberGrams : undefined),
      cookingTime: typeof raw.cookingTime === 'number' ? raw.cookingTime : (typeof raw.prepTimeMinutes === 'number' && typeof raw.cookTimeMinutes === 'number' ? raw.prepTimeMinutes + raw.cookTimeMinutes : 25),
      servings: typeof raw.servings === 'number' ? raw.servings : 2,
      cuisine: raw.cuisine ? String(raw.cuisine).trim() : 'International',
      mealType: raw.mealType ? String(raw.mealType).trim() : undefined,
      dietaryTags: Array.isArray(raw.dietaryTags) ? raw.dietaryTags : (Array.isArray(raw.tags) ? raw.tags : []),
      source: raw.source ? String(raw.source).trim() : 'Cookly Kitchen',
      sourceUrl: raw.sourceUrl ? String(raw.sourceUrl).trim() : undefined,
      chefTip: raw.chefTip ? String(raw.chefTip).trim() : undefined,
      rating: typeof raw.rating === 'number' ? raw.rating : 4.8,
      reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : 50,
      difficulty: raw.difficulty === 'Hard' ? 'Hard' : (raw.difficulty === 'Medium' ? 'Medium' : 'Easy')
    };
  }

  public static normalizeBatch(rawList: any[]): NormalizedRecipe[] {
    return rawList.map((r) => this.normalize(r));
  }
}
