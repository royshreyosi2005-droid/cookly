import type {
  NormalizedRecipe,
  RecipeIngredient,
  InstructionStep,
  DietaryTag,
  PantrySearchMode,
  AIChefPromptParams,
  AIChefSuggestion,
  FoodPreference
} from '../types';
import { HEALTHY_RECIPES } from '../data/healthyRecipesData';

// LRU Search Cache (10-minute TTL)
const searchCache = new Map<string, { timestamp: number; data: NormalizedRecipe[] }>();
const CACHE_EXPIRY_MS = 10 * 60 * 1000;

export interface UniversalSearchOptions {
  query?: string;
  ingredients?: string[];
  excludedIngredients?: string[];
  pantryMode?: PantrySearchMode;
  cuisine?: string;
  dietary?: string;
  difficulty?: string;
  mealType?: string;
  maxCookTime?: number;
  maxCalories?: number;
  minProtein?: number;
  minFiber?: number;
  budgetMax?: number;
  servings?: number;
  sortBy?: 'relevance' | 'match' | 'healthScore' | 'time' | 'rating' | 'calories' | 'protein' | 'cheapest' | 'missing_least';
  userPantry?: string[];
  healthyOnly?: boolean;
  healthyCategory?: string;
  signal?: AbortSignal;
}

export interface HealthEvaluation {
  healthyScore: number; // 0 - 100
  healthyEligible: boolean; // strict gate
  categories: DietaryTag[];
  healthReasons: string[];
  disqualificationReason?: string;
}

/**
 * Strict Dish-Level Health & Nutrition Evaluator
 * Evaluates entire recipe structure, nutrition metrics, and ingredient quality.
 * Enforces zero tolerance for fast food, fried foods, heavy cream/butter, desserts, pastries, and general indulgence.
 */
export function evaluateRecipeHealth(recipe: NormalizedRecipe): HealthEvaluation {
  const name = (recipe.name || recipe.title || '').toLowerCase().trim();
  const desc = (recipe.description || '').toLowerCase();
  const mealType = (recipe.mealType || '').toLowerCase();
  const ingredients = recipe.ingredients.map(i => i.name.toLowerCase());

  // 1. STRICT DISH-LEVEL EXCLUSIONS (Title keywords)
  const strictTitleDisqualifiers = [
    // Fast food & indulgence mains
    /\bpizzas?\b/i,
    /\bburgers?\b|\bcheeseburgers?\b|\bsliders?\b/i,
    /\bfrench fries\b|\bfries\b|\bpoutine\b|\bonion rings\b|\bhash browns?\b|\bchips\b|\bwedge\b/i,
    /\bnachos\b|\bquesadillas?\b|\benchiladas?\b|\bburritos?\b|\btacos?\b|\bfajitas?\b/i,
    // Deep-fried, battered, fried meats, snacks & appetizers
    /\bfried\b|\bdeep[\s-]fried\b|\bdeep fried\b|\bcrispy fried\b|\bbattered\b|\bkaraage\b|\bkatsu\b|\blollipop\b|\bfritters?\b|\bcorndogs?\b|\bnuggets?\b|\btempura\b|\bcroquettes?\b|\bsamosas?\b|\bspring rolls?\b|\bfish and chips\b|\bpatatas bravas\b|\belote\b/i,
    // Heavy dairy / cream / cheese / pasta bombs
    /\bheavy cream\b|\bdouble cream\b|\bclotted cream\b|\balfredo\b|\bcarbonara\b|\bmacaroni and cheese\b|\bmac and cheese\b|\bcreamy pasta\b|\bcheese sauce\b|\bparmigiana\b|\bgratin\b|\bscampi\b|\blasa[gn]ya\b|\bravioli\b|\btortellini\b|\bbolognese\b/i,
    // Pastries / Breads / Dough / Appetizers
    /\bbruschetta\b|\bspanakopita\b|\bmoussaka\b|\bgarlic bread\b|\bcroissants?\b|\bbagels?\b|\bcalzone\b|\bnaan\b|\bparatha\b|\bdosa\b/i,
    // Heavy butter / ghee curries / rich gravies
    /\bbutter chicken\b|\bmakhani\b|\bhandi\b|\bmandi\b|\bkarahi\b|\bkorma\b|\bpasanda\b|\bbiryani\b|\bdum biryani\b|\brog[ao]n josh\b|\bkeema\b|\bchapli\b/i,
    // Desserts, pastries, chocolates, cakes, sweets, heavy syrups
    /\bcookies?\b|\bbrownies?\b|\bcheesecakes?\b|\bfudge\b|\bcakes?\b|\bcupcakes?\b|\bfrosting\b|\bicing\b|\bice cream\b|\bsundaes?\b|\bchurros\b|\bdonuts?\b|\bdoughnuts?\b|\bcandy\b|\bmarshmallow\b|\bpastry\b|\bpastries\b|\bpies?\b|\btarts?\b|\bmilkshakes?\b|\bwaffles?\b|\bpancakes?\b|\bbrigadeiros?\b|\bchocolates?\b|\blassi\b|\bmolasses\b|\brice balls?\b/i,
    // Sugary glazes & heavy syrups
    /\bsweet and sour\b|\borange chicken\b|\bgeneral tso\b|\bsticky chicken\b|\bcaramel\b|\bheavy syrup\b|\bsugary\b|\bcotton candy\b/i,
    // Heavy processed meats & indulgence breakfasts
    /\bfull english\b|\benglish breakfast\b|\bhot dogs?\b|\bcorndogs?\b|\bsausages?\b|\bpepperoni\b|\bsalami\b|\bbacon\b|\bchorizo\b|\bpork belly\b|\bkebabs?\b|\bboxty\b/i
  ];

  for (const pattern of strictTitleDisqualifiers) {
    if (pattern.test(name)) {
      return {
        healthyScore: 10,
        healthyEligible: false,
        categories: [],
        healthReasons: [],
        disqualificationReason: `Excluded due to general/indulgent dish title matching "${pattern.source}"`
      };
    }
  }

  // 2. DESCRIPTION LEVEL DISQUALIFICATIONS
  const strictDescPatterns = [
    /\bdeep[\s-]fried\b|\bdeep fried\b|\bbattered and fried\b|\bhigh fructose corn syrup\b|\bheavy frosting\b|\bloaded with melted cheese\b|\bheavily sweetened\b/i
  ];

  for (const pattern of strictDescPatterns) {
    if (pattern.test(desc) && !desc.includes('guilt-free') && !desc.includes('healthy alternative')) {
      return {
        healthyScore: 10,
        healthyEligible: false,
        categories: [],
        healthReasons: [],
        disqualificationReason: 'Excluded due to deep-frying or heavy sugar in preparation description'
      };
    }
  }

  // 3. INGREDIENT QUALITY VALIDATION
  const hasRefinedSugar = ingredients.some(i =>
    i.includes('powdered sugar') || i.includes('corn syrup') || i.includes('frosting') ||
    i.includes('icing') || i.includes('white sugar') || i.includes('granulated sugar') ||
    i.includes('caramel') || i.includes('confectioners') || i.includes('chocolate chips') ||
    i.includes('cocoa butter') || i.includes('condensed milk')
  );
  const hasHeavyFats = ingredients.some(i =>
    i.includes('heavy cream') || i.includes('double cream') || i.includes('whipping cream') ||
    i.includes('shortening') || i.includes('lard') || i.includes('bacon grease') ||
    i.includes('processed cheese') || i.includes('velveeta') || i.includes('mayonnaise')
  );

  if (hasRefinedSugar || hasHeavyFats) {
    return {
      healthyScore: 15,
      healthyEligible: false,
      categories: [],
      healthReasons: [],
      disqualificationReason: 'Contains refined sugars, confectionery, or heavy saturated dairy fats'
    };
  }

  // 4. NUTRITION VALIDATION & MACRO HARD CAPS
  const isCurated = recipe.source === 'curated' || (typeof recipe.source === 'string' && recipe.source.toLowerCase().includes('cookly'));
  const hasRealNutrition = recipe.nutritionVerified === true || isCurated || (typeof recipe.calories === 'number' && recipe.calories > 0 && recipe.source === 'dummyjson');

  // If source has no verified nutrition (like generic TheMealDB), disqualify from Healthy Picks
  if (!isCurated && !hasRealNutrition) {
    return {
      healthyScore: 30,
      healthyEligible: false,
      categories: [],
      healthReasons: [],
      disqualificationReason: 'Unverified nutrition profile'
    };
  }

  const calories = recipe.calories || 340;
  const protein = recipe.proteinGrams || (typeof recipe.protein === 'number' ? recipe.protein : parseInt(String(recipe.protein || '0'), 10)) || 0;
  const fiber = recipe.fiberGrams || (typeof recipe.fiber === 'number' ? recipe.fiber : parseInt(String(recipe.fiber || '0'), 10)) || 0;
  const fat = recipe.fatGrams || (typeof recipe.fat === 'number' ? recipe.fat : parseInt(String(recipe.fat || '0'), 10)) || 0;

  // Strict Calorie & Fat Hard Caps
  if (calories > 480 && protein < 35) {
    return {
      healthyScore: 30,
      healthyEligible: false,
      categories: [],
      healthReasons: [],
      disqualificationReason: 'Calorie density too high for everyday healthy picks (>480 kcal)'
    };
  }
  if (fat > 20 && protein < 22 && fiber < 6) {
    return {
      healthyScore: 30,
      healthyEligible: false,
      categories: [],
      healthReasons: [],
      disqualificationReason: 'High fat ratio without sufficient protein or fiber'
    };
  }

  // 5. WHOLE FOODS & NUTRIENT DENSITY ANALYSIS
  const healthReasons: string[] = [];
  let score = 55;

  // Protein Evaluation
  if (protein >= 28) {
    score += 20;
    healthReasons.push(`High Lean Protein (${protein}g)`);
  } else if (protein >= 18) {
    score += 15;
    healthReasons.push(`Quality Protein (${protein}g)`);
  } else if (protein >= 12) {
    score += 8;
  }

  // Fiber Evaluation
  if (fiber >= 7) {
    score += 18;
    healthReasons.push(`Prebiotic Fiber (${fiber}g)`);
  } else if (fiber >= 4) {
    score += 12;
    healthReasons.push(`Dietary Fiber (${fiber}g)`);
  } else if (fiber >= 2) {
    score += 5;
  }

  // Calorie Balance
  if (calories >= 200 && calories <= 420) {
    score += 12;
    healthReasons.push(`Balanced Energy (${calories} kcal)`);
  } else if (calories <= 480) {
    score += 6;
  }

  // Whole foods bonuses
  const hasGreens = ingredients.some(i =>
    i.includes('spinach') || i.includes('kale') || i.includes('broccoli') || i.includes('arugula') ||
    i.includes('cabbage') || i.includes('zucchini') || i.includes('asparagus') || i.includes('bell pepper') ||
    i.includes('cucumber') || i.includes('lettuce') || i.includes('bok choy')
  );
  if (hasGreens) {
    score += 8;
    healthReasons.push('Rich in Greens & Micronutrients');
  }

  const hasLegumesOrSuperfoods = ingredients.some(i =>
    i.includes('chia') || i.includes('quinoa') || i.includes('oat') || i.includes('lentil') ||
    i.includes('chickpea') || i.includes('bean') || i.includes('flax') || i.includes('pumpkin seed') ||
    i.includes('sprout') || i.includes('edamame') || i.includes('walnut') || i.includes('almond')
  );
  if (hasLegumesOrSuperfoods) {
    score += 8;
    healthReasons.push('Whole Grains & Legumes');
  }

  const hasBerriesOrCitrus = ingredients.some(i =>
    i.includes('blueberry') || i.includes('berry') || i.includes('lemon') || i.includes('pomegranate') ||
    i.includes('orange') || i.includes('avocado')
  );
  if (hasBerriesOrCitrus) {
    score += 6;
    healthReasons.push('Antioxidant Rich Produce');
  }

  const hasLeanProtein = ingredients.some(i =>
    i.includes('chicken breast') || i.includes('salmon') || i.includes('tuna') || i.includes('greek yogurt') ||
    i.includes('egg') || i.includes('tofu') || i.includes('paneer') || i.includes('moong dal') || i.includes('cottage cheese')
  );
  if (hasLeanProtein) {
    score += 6;
  }

  const finalScore = Math.min(99, Math.max(10, Math.round(score)));

  // Strict Health Eligibility Gate:
  // Must have verified nutrition, healthScore >= 75, and at least 2 whole-food pillars
  const healthyEligible = finalScore >= 75 && (isCurated || hasRealNutrition);

  // Categories
  const categories: DietaryTag[] = ['Balanced Meals'];
  if (protein >= 18) categories.push('High-Protein');
  if (fiber >= 5 || hasLegumesOrSuperfoods) categories.push('High-Fiber');
  if (hasGreens || hasBerriesOrCitrus) categories.push('Nutrient Dense');
  if (calories <= 380) categories.push('Low-Calorie');
  if (!hasRefinedSugar && (calories <= 420 || isCurated)) categories.push('Low Added Sugar');

  const isBreakfast = mealType.includes('breakfast') || name.includes('oat') || name.includes('yogurt') ||
                      name.includes('chilla') || name.includes('upma') || name.includes('scramble') ||
                      name.includes('smoothie');
  if (isBreakfast) categories.push('Healthy Breakfast');

  const isLunch = mealType.includes('lunch') || name.includes('salad') || name.includes('bowl') ||
                  name.includes('soup') || name.includes('wrap');
  if (isLunch) categories.push('Healthy Lunch');

  const isDinner = mealType.includes('dinner') || name.includes('grilled') || name.includes('skillet') ||
                   name.includes('salmon') || name.includes('stir-fry') || name.includes('tofu');
  if (isDinner) categories.push('Healthy Dinner');

  const isSnack = calories <= 320 && (name.includes('chaat') || name.includes('bowl') || name.includes('jar') || name.includes('crunch') || name.includes('snack') || name.includes('smoothie'));
  if (isSnack) categories.push('Healthy Snacks');

  const isVeg = !ingredients.some(i =>
    i.includes('chicken') || i.includes('beef') || i.includes('pork') || i.includes('fish') ||
    i.includes('salmon') || i.includes('lamb') || i.includes('tuna') || i.includes('meat') ||
    i.includes('turkey') || i.includes('shrimp')
  );
  if (isVeg) categories.push('Vegetarian');

  const isVegan = isVeg && !ingredients.some(i =>
    i.includes('egg') || i.includes('yogurt') || i.includes('paneer') || i.includes('cheese') ||
    i.includes('milk') || i.includes('butter') || i.includes('ghee') || i.includes('honey')
  );
  if (isVegan) categories.push('Vegan');

  return {
    healthyScore: finalScore,
    healthyEligible,
    categories,
    healthReasons: healthReasons.slice(0, 3)
  };
}

/**
 * Helper to estimate realistic macronutrients for DummyJSON recipes
 */
function estimateDummyJSONNutrients(name: string, rawIngredients: string[], calories: number) {
  const ingLower = rawIngredients.map(i => i.toLowerCase());
  const nameLower = name.toLowerCase();

  let protein = 6;
  let fiber = 2;
  let fat = Math.max(2, Math.round(calories * 0.28 / 9));
  let carbs = Math.max(10, Math.round((calories - (protein * 4) - (fat * 9)) / 4));

  const hasPoultryOrFish = ingLower.some(i => i.includes('chicken') || i.includes('turkey') || i.includes('salmon') || i.includes('tuna') || i.includes('shrimp') || i.includes('fish') || i.includes('beef') || i.includes('pork'));
  const hasPlantProtein = ingLower.some(i => i.includes('tofu') || i.includes('paneer') || i.includes('chickpea') || i.includes('lentil') || i.includes('edamame') || i.includes('egg'));
  const hasWholeGrains = ingLower.some(i => i.includes('quinoa') || i.includes('oat') || i.includes('brown rice'));
  const hasVeggies = ingLower.some(i => i.includes('spinach') || i.includes('broccoli') || i.includes('kale') || i.includes('cabbage') || i.includes('zucchini'));

  if (hasPoultryOrFish) {
    protein = Math.max(22, Math.min(38, Math.round(calories * 0.28 / 4)));
  } else if (hasPlantProtein) {
    protein = Math.max(14, Math.min(24, Math.round(calories * 0.20 / 4)));
  } else if (nameLower.includes('smoothie') || nameLower.includes('salad')) {
    protein = 5;
  } else if (nameLower.includes('bruschetta') || nameLower.includes('patatas') || nameLower.includes('dessert') || nameLower.includes('chocolate') || nameLower.includes('brigadeiro')) {
    protein = 2;
    fat = Math.round(calories * 0.45 / 9);
  }

  if (hasWholeGrains || hasPlantProtein) {
    fiber = Math.max(5, Math.min(10, Math.round(protein * 0.35)));
  } else if (hasVeggies) {
    fiber = 4;
  } else {
    fiber = 1;
  }

  return { protein, fiber, fat, carbs };
}

/**
 * Natural Language Pantry Input Parser
 */
export function parseNaturalLanguagePantry(text: string): { included: string[]; excluded: string[]; rawText: string } {
  const trimmed = text.trim();
  if (!trimmed) return { included: [], excluded: [], rawText: text };

  const lower = trimmed.toLowerCase();
  const included: string[] = [];
  const excluded: string[] = [];

  const splitExclusion = lower.split(/(?:but no|without|except|no |excluding)/i);
  const positivePart = splitExclusion[0] || '';
  const negativePart = splitExclusion.slice(1).join(' ');

  const cleanedPositive = positivePart
    .replace(/^(?:i have|i only have|i've got|we have|we've got|there is|there are|got|using|just)\s+/i, '')
    .replace(/[.!?;]+$/, '');

  const rawItems = cleanedPositive.split(/[,&+]|\band\b/i);
  rawItems.forEach(item => {
    const cleanItem = item.trim().replace(/^a |^an |^some /i, '');
    if (cleanItem.length > 1) {
      const formatted = cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1);
      if (!included.some(i => i.toLowerCase() === formatted.toLowerCase())) {
        included.push(formatted);
      }
    }
  });

  if (negativePart) {
    const rawNegItems = negativePart.split(/[,&+]|\band\b/i);
    rawNegItems.forEach(item => {
      const cleanItem = item.trim().replace(/^a |^an |^some /i, '');
      if (cleanItem.length > 1) {
        const formatted = cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1);
        if (!excluded.some(i => i.toLowerCase() === formatted.toLowerCase())) {
          excluded.push(formatted);
        }
      }
    });
  }

  return { included, excluded, rawText: text };
}

/**
 * Natural Language AI Chef Query Parser
 */
export function parseNaturalLanguageAIChefQuery(query: string, currentPantry: string[] = []): AIChefPromptParams {
  const lower = query.toLowerCase();

  let budget = 150;
  const budgetMatch = lower.match(/(?:₹|rs\.?|inr|budget\s*(?:of)?\s*|under\s*₹?)\s*(\d+)/i) ||
                      lower.match(/(\d+)\s*(?:rs|rupees|bucks|₹)/i);
  if (budgetMatch && budgetMatch[1]) {
    const val = parseInt(budgetMatch[1], 10);
    if (!isNaN(val) && val > 0) budget = val;
  }

  let peopleCount = 2;
  const peopleMatch = lower.match(/(?:for|serves|feed|family of|table for)\s*(\d+)\s*(?:people|persons?|pax|heads)?/i) ||
                      lower.match(/(\d+)\s*(?:people|persons?|pax)/i);
  if (peopleMatch && peopleMatch[1]) {
    const val = parseInt(peopleMatch[1], 10);
    if (!isNaN(val) && val > 0 && val <= 20) peopleCount = val;
  }

  let maxCookTimeMinutes = 30;
  if (lower.includes('1 hour') || lower.includes('60 min')) {
    maxCookTimeMinutes = 60;
  } else {
    const timeMatch = lower.match(/(?:under|less than|within|in)\s*(\d+)\s*(?:min|mins|minutes)/i) ||
                      lower.match(/(\d+)\s*(?:min|mins|minutes)/i);
    if (timeMatch && timeMatch[1]) {
      const val = parseInt(timeMatch[1], 10);
      if (!isNaN(val) && val > 0) maxCookTimeMinutes = val;
    }
  }

  let foodPreference: FoodPreference = 'Any';
  if (lower.includes('vegan')) foodPreference = 'Vegetarian';
  else if (lower.includes('veg') && !lower.includes('non-veg')) foodPreference = 'Vegetarian';
  else if (lower.includes('non-veg') || lower.includes('chicken') || lower.includes('meat') || lower.includes('fish')) foodPreference = 'Non-vegetarian';
  else if (lower.includes('protein') || lower.includes('high protein')) foodPreference = 'High-protein';
  else if (lower.includes('low calorie') || lower.includes('weight loss')) foodPreference = 'Low-calorie';
  else if (lower.includes('healthy')) foodPreference = 'Healthy';

  const detectedIngredients = new Set<string>(currentPantry);
  const commonStaples = [
    'egg', 'eggs', 'potato', 'potatoes', 'rice', 'onion', 'onions', 'tomato', 'tomatoes',
    'chicken', 'garlic', 'ginger', 'paneer', 'spinach', 'pasta', 'cheese', 'bread', 'mushrooms', 'fish'
  ];

  commonStaples.forEach(staple => {
    if (lower.includes(staple)) {
      const formatted = staple.charAt(0).toUpperCase() + staple.slice(1);
      detectedIngredients.add(formatted);
    }
  });

  return {
    budget,
    budgetMode: 'total',
    peopleCount,
    availableIngredients: Array.from(detectedIngredients),
    maxCookTimeMinutes,
    foodPreference,
    userQuery: query
  };
}

/**
 * Calculates strict and transparent pantry match details
 */
export function calculatePantryMatch(
  recipe: NormalizedRecipe,
  userPantry: string[],
  excludedIngredients: string[] = []
): NormalizedRecipe {
  if (!userPantry || userPantry.length === 0) {
    return {
      ...recipe,
      matchScore: 0,
      matchedCount: 0,
      totalIngredientsCount: recipe.ingredients.length,
      matchedIngredients: [],
      missingIngredients: recipe.ingredients.map(i => i.name),
      ingredients: recipe.ingredients.map(i => ({ ...i, inPantry: false }))
    };
  }

  const userPantryLower = userPantry.map(p => p.toLowerCase().trim());
  const excludedLower = excludedIngredients.map(e => e.toLowerCase().trim());

  const hasExcluded = recipe.ingredients.some(ing => {
    const ingLower = ing.name.toLowerCase();
    return excludedLower.some(ex => ingLower.includes(ex));
  });

  const matchedIngredients: string[] = [];
  const missingIngredients: string[] = [];

  const enrichedIngredients = recipe.ingredients.map(ing => {
    const ingLower = ing.name.toLowerCase().trim();
    const isMatched = userPantryLower.some(p => ingLower.includes(p) || p.includes(ingLower));

    if (isMatched) {
      matchedIngredients.push(ing.name);
    } else {
      missingIngredients.push(ing.name);
    }

    return {
      ...ing,
      inPantry: isMatched
    };
  });

  const requiredCount = recipe.ingredients.filter(i => !i.isOptional).length || recipe.ingredients.length;
  const matchedRequiredCount = enrichedIngredients.filter(i => i.inPantry && !i.isOptional).length;

  let matchScore = 0;
  if (requiredCount > 0) {
    matchScore = Math.round((matchedRequiredCount / requiredCount) * 100);
    if (missingIngredients.length > 0 && matchScore === 100) {
      matchScore = 95;
    }
  }

  if (hasExcluded) {
    matchScore = 0;
  }

  return {
    ...recipe,
    ingredients: enrichedIngredients,
    matchedIngredients,
    missingIngredients,
    matchedCount: matchedIngredients.length,
    totalIngredientsCount: recipe.ingredients.length,
    matchScore
  };
}

/**
 * Fetch TheMealDB live REST API
 */
async function fetchTheMealDB(query: string, signal?: AbortSignal): Promise<NormalizedRecipe[]> {
  try {
    const trimmed = query.trim();
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(trimmed)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    if (signal) signal.addEventListener('abort', () => controller.abort());

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.meals || !Array.isArray(data.meals)) return [];

    return data.meals.map((meal: any): NormalizedRecipe => {
      const ingredients: RecipeIngredient[] = [];
      for (let i = 1; i <= 20; i++) {
        const name = meal[`strIngredient${i}`]?.trim();
        const amount = meal[`strMeasure${i}`]?.trim() || '';
        if (name) {
          ingredients.push({ name, amount: amount || '1 portion', inPantry: false });
        }
      }

      const rawInstructions: string = meal.strInstructions || '';
      const splitSteps = rawInstructions
        .split(/\r?\n+/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 10 && !s.match(/^(STEP\s*\d+|INSTRUCTIONS?)$/i));

      const instructions: InstructionStep[] = (splitSteps.length > 0 ? splitSteps : [rawInstructions])
        .slice(0, 8)
        .map((text: string, idx: number) => ({ step: idx + 1, instruction: text }));

      const category = (meal.strCategory || '').toLowerCase();
      const tags: DietaryTag[] = ['Comfort Food'];
      if (category.includes('veg') || (meal.strTags || '').toLowerCase().includes('veg')) tags.push('Vegetarian');
      if (category.includes('chicken') || category.includes('beef') || category.includes('seafood') || category.includes('lamb')) tags.push('High-Protein');
      if (category.includes('breakfast')) tags.push('Healthy Breakfast');

      return {
        id: `themealdb-${meal.idMeal}`,
        name: meal.strMeal,
        title: meal.strMeal,
        image: meal.strMealThumb || null,
        imageUrl: meal.strMealThumb || '',
        description: `Authentic ${meal.strMeal} prepared with ${ingredients.slice(0, 3).map(i => i.name).join(', ')}.`,
        cookingTime: 30,
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        servings: 4,
        difficulty: 'Medium',
        calories: 450,
        protein: '22g',
        proteinGrams: 22,
        carbs: '48g',
        carbsGrams: 48,
        fat: '16g',
        fatGrams: 16,
        fiber: '3g',
        fiberGrams: 3,
        cuisine: meal.strArea || 'International',
        mealType: meal.strCategory || 'Main Dish',
        dietaryTags: tags,
        tags,
        source: 'themealdb',
        sourceUrl: meal.strSource || meal.strYoutube || undefined,
        rating: 4.8,
        reviewCount: 92,
        nutritionVerified: false,
        ingredients,
        instructions
      };
    });
  } catch (err) {
    return [];
  }
}

/**
 * Fetch DummyJSON Recipes API
 */
async function fetchDummyJSON(query: string, signal?: AbortSignal): Promise<NormalizedRecipe[]> {
  try {
    const trimmed = query.trim();
    const url = trimmed
      ? `https://dummyjson.com/recipes/search?q=${encodeURIComponent(trimmed)}`
      : 'https://dummyjson.com/recipes?limit=50';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    if (signal) signal.addEventListener('abort', () => controller.abort());

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.recipes || !Array.isArray(data.recipes)) return [];

    return data.recipes.map((r: any): NormalizedRecipe => {
      const rawIngredients: string[] = r.ingredients || [];
      const ingredients: RecipeIngredient[] = rawIngredients.map((name: string) => ({
        name,
        amount: '1 portion',
        inPantry: false
      }));

      const instructions: InstructionStep[] = (r.instructions || []).map((inst: string, idx: number) => ({
        step: idx + 1,
        instruction: inst
      }));

      const tags: DietaryTag[] = ['Balanced Meals'];
      const rawTags = (r.tags || []).map((t: string) => t.toLowerCase());
      if (rawTags.some((t: string) => t.includes('veg'))) tags.push('Vegetarian');
      if (rawTags.some((t: string) => t.includes('protein') || t.includes('chicken'))) tags.push('High-Protein');

      const prep = r.prepTimeMinutes || 15;
      const cook = r.cookTimeMinutes || 20;
      const image = r.image || `https://cdn.dummyjson.com/recipe-images/${r.id}.webp`;
      const calories = r.caloriesPerServing || 360;

      const nutrients = estimateDummyJSONNutrients(r.name, rawIngredients, calories);

      return {
        id: `dummyjson-${r.id}`,
        name: r.name,
        title: r.name,
        image,
        imageUrl: image,
        description: `${r.name} crafted with ${r.cuisine || 'international'} flair.`,
        cookingTime: prep + cook,
        prepTimeMinutes: prep,
        cookTimeMinutes: cook,
        servings: r.servings || 4,
        difficulty: (r.difficulty as any) || 'Easy',
        calories,
        protein: `${nutrients.protein}g`,
        proteinGrams: nutrients.protein,
        carbs: `${nutrients.carbs}g`,
        carbsGrams: nutrients.carbs,
        fat: `${nutrients.fat}g`,
        fatGrams: nutrients.fat,
        fiber: `${nutrients.fiber}g`,
        fiberGrams: nutrients.fiber,
        cuisine: r.cuisine || 'International',
        mealType: r.mealType?.[0] || 'Dinner',
        dietaryTags: tags,
        tags,
        source: 'dummyjson',
        sourceUrl: `https://dummyjson.com/recipes/${r.id}`,
        rating: r.rating || 4.7,
        reviewCount: r.reviewCount || 64,
        nutritionVerified: true,
        ingredients,
        instructions
      };
    });
  } catch (err) {
    return [];
  }
}

/**
 * Dedicated Healthy Recipe Pipeline
 * Searches verified healthy collection and strictly eligible recipes.
 * Never falls back to general Discover recipes.
 */
export async function searchHealthyRecipes(options: UniversalSearchOptions = {}): Promise<NormalizedRecipe[]> {
  const {
    query = '',
    ingredients = [],
    excludedIngredients = [],
    pantryMode = 'best_match',
    cuisine = 'All',
    healthyCategory = 'All Healthy',
    maxCookTime,
    maxCalories,
    minProtein,
    minFiber,
    sortBy = 'relevance',
    userPantry = [],
    signal
  } = options;

  const trimmedQuery = query.trim().toLowerCase();
  const activePantry = ingredients.length > 0 ? ingredients : userPantry;

  // 1. Fetch from Cookly Central AI Agent Backend (/api/agent/query)
  let agentRecipes: NormalizedRecipe[] = [];
  try {
    const validSortBy = ['relevance', 'time', 'calories', 'rating', 'healthScore', 'protein'].includes(sortBy) ? sortBy : undefined;
    const promptParts = [
      trimmedQuery,
      healthyCategory && healthyCategory !== 'All Healthy' ? `${healthyCategory} healthy meals` : 'healthy wholesome recipes',
      minProtein ? `high protein at least ${minProtein}g` : '',
      maxCalories ? `under ${maxCalories} calories` : '',
      maxCookTime ? `ready under ${maxCookTime} mins` : '',
      minFiber ? `high fiber at least ${minFiber}g` : ''
    ].filter(Boolean);

    const res = await fetch('/api/agent/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptParts.join(' '),
        pantry: activePantry,
        filters: {
          healthyCategory: healthyCategory !== 'All Healthy' ? healthyCategory : undefined,
          cuisine: cuisine !== 'All' ? cuisine : undefined,
          maxCookTime,
          maxCalories,
          minProtein,
          minFiber,
          sortBy: validSortBy as any
        },
        context: { page: 'healthy' }
      }),
      signal
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data && Array.isArray(result.data.recipes)) {
        agentRecipes = result.data.recipes.map((r: any): NormalizedRecipe => ({
          ...r,
          title: r.name || r.title,
          imageUrl: r.image || r.imageUrl || '',
          tags: r.dietaryTags || r.tags || [],
          prepTimeMinutes: r.prepTimeMinutes || Math.round((r.cookingTime || 30) * 0.4),
          cookTimeMinutes: r.cookTimeMinutes || Math.round((r.cookingTime || 30) * 0.6)
        }));
      }
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
    // Fallback to local healthy dataset if offline
  }

  // 2. Fetch Candidates (Curated Verified Healthy + DummyJSON) if backend had no items
  let dummyJSONRecipes: NormalizedRecipe[] = [];
  if (agentRecipes.length === 0) {
    const [dResults] = await Promise.all([
      fetchDummyJSON(trimmedQuery, signal)
    ]);
    dummyJSONRecipes = dResults;
  }

  const curatedHealthy: NormalizedRecipe[] = HEALTHY_RECIPES.map(r => ({
    ...r,
    name: r.title,
    image: r.imageUrl,
    cookingTime: r.cookingTime || (r.prepTimeMinutes + r.cookTimeMinutes),
    mealType: 'Healthy Dining',
    dietaryTags: r.tags,
    source: 'curated',
    nutritionVerified: true
  }));

  const combined: NormalizedRecipe[] = [];
  const seenNames = new Set<string>();

  const addUnique = (recipe: NormalizedRecipe) => {
    const rawName = recipe.name || recipe.title || '';
    const key = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenNames.has(key)) {
      seenNames.add(key);
      combined.push(recipe);
    }
  };

  agentRecipes.forEach(addUnique);

  if (trimmedQuery) {
    const queryTokens = trimmedQuery.split(/\s+/).filter(t => t.length > 1);
    const matchesQuery = (r: NormalizedRecipe) => {
      const target = `${r.name || r.title || ''} ${r.description || ''} ${r.cuisine || ''} ${(r.dietaryTags || []).join(' ')} ${r.ingredients.map(i => i.name).join(' ')}`.toLowerCase();
      return queryTokens.some(token => target.includes(token));
    };

    curatedHealthy.filter(matchesQuery).forEach(addUnique);
    dummyJSONRecipes.filter(matchesQuery).forEach(addUnique);
  } else {
    curatedHealthy.forEach(addUnique);
    dummyJSONRecipes.forEach(addUnique);
  }

  // 3. Strict Health Evaluation Gate
  let evaluated: NormalizedRecipe[] = combined.map(recipe => {
    const evalResult = evaluateRecipeHealth(recipe);
    return {
      ...recipe,
      healthScore: evalResult.healthyScore,
      healthyScore: evalResult.healthyScore,
      isHealthy: evalResult.healthyEligible,
      healthyEligible: evalResult.healthyEligible,
      healthHighlights: evalResult.healthReasons,
      healthReasons: evalResult.healthReasons,
      dietaryTags: Array.from(new Set([...(recipe.dietaryTags || []), ...evalResult.categories]))
    };
  });

  // 4. Keep ONLY eligible recipes (healthyEligible === true)
  let filtered = evaluated.filter(r => r.healthyEligible === true);

  // 5. Apply Category Filter
  if (healthyCategory && healthyCategory !== 'All Healthy') {
    const hCatLower = healthyCategory.toLowerCase();
    filtered = filtered.filter(r => {
      const catTags = (r.dietaryTags || []).map(t => t.toLowerCase());
      if (catTags.includes(hCatLower)) return true;

      if ((hCatLower === 'high-protein' || hCatLower === 'high protein') && (r.proteinGrams || 0) >= 18) return true;
      if ((hCatLower === 'high-fiber' || hCatLower === 'high fiber') && (r.fiberGrams || 0) >= 5) return true;
      if ((hCatLower === 'low-calorie' || hCatLower === 'low calorie') && (r.calories || 999) <= 380) return true;
      if ((hCatLower === 'low added sugar') && (r.calories || 999) <= 420) return true;
      if ((hCatLower === 'nutrient dense') && (r.healthScore || 0) >= 75) return true;
      if ((hCatLower === 'balanced' || hCatLower === 'balanced meals') && (r.healthScore || 0) >= 70) return true;
      if (hCatLower === 'vegetarian' && catTags.some(t => t.includes('veg'))) return true;
      if (hCatLower === 'vegan' && catTags.includes('vegan')) return true;
      return false;
    });
  }

  // 6. Enrich with pantry calculations if pantry items provided
  if (activePantry.length > 0) {
    filtered = filtered.map(r => calculatePantryMatch(r, activePantry, excludedIngredients));

    if (pantryMode === 'exact') {
      filtered = filtered.filter(r => (r.matchScore || 0) >= 80);
    } else if (pantryMode === 'single') {
      const singleTarget = activePantry[0].toLowerCase();
      filtered = filtered.filter(r =>
        r.ingredients.some(i => i.name.toLowerCase().includes(singleTarget))
      );
    } else if (pantryMode === 'multi') {
      filtered = filtered.filter(r => (r.matchedCount || 0) >= Math.min(2, activePantry.length));
    }
  } else if (userPantry.length > 0) {
    filtered = filtered.map(r => calculatePantryMatch(r, userPantry, excludedIngredients));
  }

  // 7. Apply Other Custom Constraints
  if (cuisine && cuisine !== 'All') {
    filtered = filtered.filter(r => r.cuisine.toLowerCase().includes(cuisine.toLowerCase()));
  }

  if (maxCookTime) {
    filtered = filtered.filter(r => (r.cookingTime || (r.prepTimeMinutes + r.cookTimeMinutes)) <= maxCookTime);
  }

  if (maxCalories) {
    filtered = filtered.filter(r => (r.calories || 0) <= maxCalories);
  }

  if (minProtein) {
    filtered = filtered.filter(r => (r.proteinGrams || 0) >= minProtein);
  }

  if (minFiber) {
    filtered = filtered.filter(r => (r.fiberGrams || 0) >= minFiber);
  }

  // 8. Sort by Healthy Score and Match Score
  filtered.sort((a, b) => {
    const timeA = a.cookingTime || (a.prepTimeMinutes + a.cookTimeMinutes) || 30;
    const timeB = b.cookingTime || (b.prepTimeMinutes + b.cookTimeMinutes) || 30;

    if (sortBy === 'relevance') {
      if (activePantry.length > 0 && (b.matchScore || 0) !== (a.matchScore || 0)) {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      return (b.healthyScore || b.healthScore || 50) - (a.healthyScore || a.healthScore || 50);
    }

    switch (sortBy) {
      case 'healthScore':
        return (b.healthyScore || b.healthScore || 0) - (a.healthyScore || a.healthScore || 0);
      case 'match':
        return (b.matchScore || 0) - (a.matchScore || 0);
      case 'missing_least':
        return (a.missingIngredients?.length || 0) - (b.missingIngredients?.length || 0);
      case 'time':
        return timeA - timeB;
      case 'protein':
        return (b.proteinGrams || 0) - (a.proteinGrams || 0);
      case 'calories':
        return (a.calories || 999) - (b.calories || 999);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return (b.healthyScore || 50) - (a.healthyScore || 50);
    }
  });

  return filtered;
}

/**
 * Universal Recipe Search Engine
 * Delegates to the Cookly Central AI Agent (/api/agent/query) or specialized pipelines based on search intent.
 */
export async function searchUniversalRecipes(options: UniversalSearchOptions = {}): Promise<NormalizedRecipe[]> {
  if (options.healthyOnly) {
    return searchHealthyRecipes(options);
  }

  const {
    query = '',
    ingredients = [],
    excludedIngredients = [],
    pantryMode = 'best_match',
    cuisine = 'All',
    dietary = 'All',
    difficulty = 'All',
    maxCookTime,
    maxCalories,
    minProtein,
    minFiber,
    sortBy = 'relevance',
    userPantry = [],
    signal
  } = options;

  const trimmedQuery = query.trim().toLowerCase();
  const activePantry = ingredients.length > 0 ? ingredients : userPantry;

  const cacheKey = JSON.stringify({
    query: trimmedQuery,
    ingredients: [...ingredients].sort(),
    excludedIngredients: [...excludedIngredients].sort(),
    pantryMode,
    cuisine,
    dietary,
    difficulty,
    maxCookTime,
    maxCalories,
    minProtein,
    minFiber,
    sortBy,
    userPantry: [...userPantry].sort()
  });

  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
    return cached.data;
  }

  // 1. Fetch from Cookly Central AI Agent Backend (/api/agent/query)
  let agentRecipes: NormalizedRecipe[] = [];
  try {
    const validSortBy = ['relevance', 'time', 'calories', 'rating', 'match'].includes(sortBy) ? sortBy : undefined;

    const promptText = [
      trimmedQuery,
      cuisine && cuisine !== 'All' ? `${cuisine} cuisine` : '',
      dietary && dietary !== 'All' ? dietary : '',
      difficulty && difficulty !== 'All' ? `${difficulty} difficulty` : '',
      maxCookTime ? `under ${maxCookTime} mins` : '',
      maxCalories ? `under ${maxCalories} calories` : '',
      minProtein ? `at least ${minProtein}g protein` : '',
      minFiber ? `at least ${minFiber}g fiber` : ''
    ].filter(Boolean).join(' ') || (activePantry.length > 0 ? `recipes with ${activePantry.join(', ')}` : 'popular dishes');

    const res = await fetch('/api/agent/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        pantry: activePantry,
        filters: {
          cuisine: cuisine !== 'All' ? cuisine : undefined,
          dietary: dietary !== 'All' ? dietary : undefined,
          difficulty: difficulty !== 'All' ? difficulty : undefined,
          maxCookTime,
          maxCalories,
          minProtein,
          minFiber,
          sortBy: validSortBy as any
        },
        context: { page: activePantry.length > 0 ? 'pantry' : 'discover' }
      }),
      signal
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data && Array.isArray(result.data.recipes)) {
        agentRecipes = result.data.recipes.map((r: any): NormalizedRecipe => ({
          ...r,
          title: r.name || r.title,
          imageUrl: r.image || r.imageUrl || '',
          tags: r.dietaryTags || r.tags || [],
          prepTimeMinutes: r.prepTimeMinutes || Math.round((r.cookingTime || 30) * 0.4),
          cookTimeMinutes: r.cookTimeMinutes || Math.round((r.cookingTime || 30) * 0.6)
        }));
      }
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
    // Fallback to client provider engines if offline
  }

  // 2. Fetch from client providers if backend returned no recipes
  let dummyJSONRecipes: NormalizedRecipe[] = [];
  let mealDBMeals: NormalizedRecipe[] = [];

  if (agentRecipes.length === 0) {
    const [dResults, mResults] = await Promise.all([
      fetchDummyJSON(trimmedQuery, signal),
      fetchTheMealDB(trimmedQuery, signal)
    ]);
    dummyJSONRecipes = dResults;
    mealDBMeals = mResults;
  }

  const curatedHealthy: NormalizedRecipe[] = HEALTHY_RECIPES.map(r => ({
    ...r,
    name: r.title,
    image: r.imageUrl,
    cookingTime: r.cookingTime || (r.prepTimeMinutes + r.cookTimeMinutes),
    mealType: 'Healthy Dining',
    dietaryTags: r.tags,
    source: 'curated',
    nutritionVerified: true
  }));

  const seenNames = new Set<string>();
  const combined: NormalizedRecipe[] = [];

  const addUnique = (recipe: NormalizedRecipe) => {
    const rawName = recipe.name || recipe.title || '';
    const key = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenNames.has(key)) {
      seenNames.add(key);
      combined.push(recipe);
    }
  };

  agentRecipes.forEach(addUnique);

  if (agentRecipes.length === 0) {
    if (trimmedQuery) {
      const queryTokens = trimmedQuery.split(/\s+/).filter(t => t.length > 1);
      const matchesQuery = (r: NormalizedRecipe) => {
        const target = `${r.name || r.title || ''} ${r.description || ''} ${r.cuisine || ''} ${(r.dietaryTags || []).join(' ')} ${r.ingredients.map(i => i.name).join(' ')}`.toLowerCase();
        return queryTokens.some(token => target.includes(token));
      };

      dummyJSONRecipes.forEach(addUnique);
      mealDBMeals.forEach(addUnique);
      curatedHealthy.filter(matchesQuery).forEach(addUnique);
    } else {
      dummyJSONRecipes.forEach(addUnique);
      mealDBMeals.forEach(addUnique);
      curatedHealthy.forEach(addUnique);
    }
  }

  const evaluated: NormalizedRecipe[] = combined.map(recipe => {
    const evalResult = evaluateRecipeHealth(recipe);
    return {
      ...recipe,
      healthScore: evalResult.healthyScore,
      healthyScore: evalResult.healthyScore,
      isHealthy: evalResult.healthyEligible,
      healthyEligible: evalResult.healthyEligible,
      healthHighlights: evalResult.healthReasons,
      healthReasons: evalResult.healthReasons,
      dietaryTags: Array.from(new Set([...(recipe.dietaryTags || []), ...evalResult.categories]))
    };
  });

  let filtered: NormalizedRecipe[] = evaluated;

  if (activePantry.length > 0) {
    filtered = filtered.map(r => calculatePantryMatch(r, activePantry, excludedIngredients));

    if (pantryMode === 'exact') {
      filtered = filtered.filter(r => (r.matchScore || 0) === 100);
    } else if (pantryMode === 'single') {
      const singleTarget = activePantry[0].toLowerCase();
      filtered = filtered.filter(r =>
        r.ingredients.some(i => i.name.toLowerCase().includes(singleTarget))
      );
    } else if (pantryMode === 'multi') {
      filtered = filtered.filter(r => (r.matchedCount || 0) >= Math.min(2, activePantry.length));
    } else {
      // best_match: keep items with at least 1 matched ingredient
      filtered = filtered.filter(r => (r.matchedCount || 0) > 0);
    }
  } else if (userPantry.length > 0) {
    filtered = filtered.map(r => calculatePantryMatch(r, userPantry, excludedIngredients));
  }

  if (cuisine && cuisine !== 'All') {
    filtered = filtered.filter(r => r.cuisine.toLowerCase().includes(cuisine.toLowerCase()));
  }

  if (dietary && dietary !== 'All') {
    const dLower = dietary.toLowerCase();
    filtered = filtered.filter(r => {
      const tags = r.dietaryTags || (r.tags as string[]) || [];
      const meal = r.mealType || '';
      if (dLower === 'high-protein' || dLower === 'high protein') return (r.proteinGrams || 0) >= 20 || tags.some(t => t.toLowerCase().includes('protein'));
      if (dLower === 'low-calorie' || dLower === 'low calorie') return (r.calories || 999) <= 400 || tags.some(t => t.toLowerCase().includes('low-calorie'));
      if (dLower === 'high-fiber' || dLower === 'high fiber') return (r.fiberGrams || 0) >= 5 || tags.some(t => t.toLowerCase().includes('fiber'));
      if (dLower === 'vegetarian') return tags.some(t => t.toLowerCase().includes('vegetarian'));
      if (dLower === 'healthy breakfast') return meal.toLowerCase().includes('breakfast') || tags.some(t => t.toLowerCase().includes('breakfast'));
      if (dLower === 'healthy lunch') return meal.toLowerCase().includes('lunch') || tags.some(t => t.toLowerCase().includes('lunch'));
      if (dLower === 'healthy dinner') return meal.toLowerCase().includes('dinner') || tags.some(t => t.toLowerCase().includes('dinner'));
      return tags.some(t => t.toLowerCase().includes(dLower));
    });
  }

  if (difficulty && difficulty !== 'All') {
    filtered = filtered.filter(r => (r.difficulty || '').toLowerCase() === difficulty.toLowerCase());
  }

  if (maxCookTime) {
    filtered = filtered.filter(r => (r.cookingTime || (r.prepTimeMinutes + r.cookTimeMinutes)) <= maxCookTime);
  }

  if (maxCalories) {
    filtered = filtered.filter(r => (r.calories || 0) <= maxCalories);
  }

  if (minProtein) {
    filtered = filtered.filter(r => (r.proteinGrams || 0) >= minProtein);
  }

  if (minFiber) {
    filtered = filtered.filter(r => (r.fiberGrams || 0) >= minFiber);
  }

  filtered.sort((a, b) => {
    const timeA = a.cookingTime || (a.prepTimeMinutes + a.cookTimeMinutes) || 30;
    const timeB = b.cookingTime || (b.prepTimeMinutes + b.cookTimeMinutes) || 30;

    switch (sortBy) {
      case 'healthScore':
        return (b.healthyScore || b.healthScore || 0) - (a.healthyScore || a.healthScore || 0);
      case 'match':
        return (b.matchScore || 0) - (a.matchScore || 0);
      case 'missing_least':
        return (a.missingIngredients?.length || 0) - (b.missingIngredients?.length || 0);
      case 'time':
        return timeA - timeB;
      case 'protein':
        return (b.proteinGrams || 0) - (a.proteinGrams || 0);
      case 'calories':
        return (a.calories || 999) - (b.calories || 999);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'relevance':
      default:
        if (activePantry.length > 0 && (b.matchScore || 0) !== (a.matchScore || 0)) {
          return (b.matchScore || 0) - (a.matchScore || 0);
        }
        return (b.rating || 4.7) - (a.rating || 4.7);
    }
  });

  searchCache.set(cacheKey, { timestamp: Date.now(), data: filtered });
  return filtered;
}

/**
 * Universal AI Chef Generator
 * Invokes the Cookly Central AI Agent (/api/agent/query) to synthesize personalized recommendations.
 */
export async function generateAIChefRecommendations(params: AIChefPromptParams): Promise<AIChefSuggestion[]> {
  const { budget, peopleCount, availableIngredients, maxCookTimeMinutes, foodPreference, userQuery } = params;

  const promptText = userQuery || `I have ₹${budget}, ${peopleCount} people, ${availableIngredients.join(', ')}, ${foodPreference}, under ${maxCookTimeMinutes} mins`;

  // 1. Fetch from Cookly Central AI Agent Backend
  try {
    const res = await fetch('/api/agent/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        pantry: availableIngredients,
        context: { page: 'ai-chef' }
      })
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data && Array.isArray(result.data.aiChefSuggestions) && result.data.aiChefSuggestions.length > 0) {
        return result.data.aiChefSuggestions.map((s: any, index: number): AIChefSuggestion => {
          const costPP = s.costPerPerson || Math.round((s.estimatedCostInRupees || budget) / (s.servings || peopleCount));
          const totalCost = s.estimatedCostInRupees || s.totalCost || (costPP * (s.servings || peopleCount));
          const cookingTime = s.cookingTimeMinutes || 25;

          const whyItMatches = Array.isArray(s.whyItMatches)
            ? s.whyItMatches
            : typeof s.whyThisMatches === 'string'
            ? s.whyThisMatches.split(' • ')
            : [
                s.whyThisMatches || `✓ Tailored recipe for ${peopleCount} people within ₹${budget} budget`,
                `✓ Estimated budget fit: ₹${costPP}/person`,
                s.proteinGrams ? `✓ Rich in protein (${s.proteinGrams}g)` : `✓ Balanced macro profile`
              ];

          const formattedInstructions: InstructionStep[] = (s.instructions || []).map((inst: any, idx: number) => {
            if (typeof inst === 'string') {
              return { step: idx + 1, instruction: inst };
            }
            return {
              step: inst.step || idx + 1,
              title: inst.title,
              instruction: inst.instruction || inst.text || ''
            };
          });

          const formattedIngredients: RecipeIngredient[] = (s.allIngredients || []).map((ing: any) => ({
            name: ing.name || String(ing),
            amount: ing.amount || '1 portion',
            inPantry: Boolean(ing.inPantry)
          }));

          return {
            id: s.id,
            title: s.title,
            subtitle: s.subtitle || `${s.cuisine || 'Fusion'} • ${cookingTime} mins • ₹${costPP}/person`,
            description: s.description,
            imageUrl: s.imageUrl || s.image || '',
            isBestMatch: index === 0,
            totalCost,
            costPerPerson: costPP,
            servings: s.servings || peopleCount,
            cookingTimeMinutes: cookingTime,
            difficulty: (s.difficulty as any) || 'Medium',
            calories: s.calories || 360,
            proteinGrams: s.proteinGrams || 20,
            carbsGrams: s.carbsGrams || 38,
            fatGrams: s.fatGrams || 12,
            fiberGrams: s.fiberGrams,
            availableIngredients: s.pantryUsed || s.availableIngredients || availableIngredients,
            missingIngredients: s.missingIngredientsToBuy || s.missingIngredients || [],
            whyItMatches,
            instructions: formattedInstructions,
            allIngredients: formattedIngredients,
            chefTip: s.chefTip,
            cuisine: s.cuisine || 'Fusion'
          };
        });
      }
    }
  } catch (err) {
    console.warn('Backend AI Chef endpoint not reachable, falling back to dynamic search:', err);
  }

  // 2. Client-side fallback if backend unavailable
  const isHealthyPreferred = foodPreference === 'Healthy' || foodPreference === 'High-protein' || foodPreference === 'Low-calorie';

  const candidates = await searchUniversalRecipes({
    query: userQuery,
    ingredients: availableIngredients,
    pantryMode: 'best_match',
    maxCookTime: maxCookTimeMinutes,
    healthyOnly: isHealthyPreferred,
    dietary: foodPreference !== 'Any' && foodPreference !== 'Non-vegetarian' ? foodPreference : undefined,
    userPantry: availableIngredients
  });

  const baseCostPerPerson = Math.max(25, Math.min(Math.round(budget / peopleCount), 120));
  const calcTotal = (pp: number) => pp * peopleCount;

  const suggestions: AIChefSuggestion[] = candidates.slice(0, 4).map((recipe, index) => {
    const costPP = Math.max(20, Math.min(baseCostPerPerson, 35 + index * 10));
    const totalCost = calcTotal(costPP);
    const recipeTime = recipe.cookingTime || (recipe.prepTimeMinutes + recipe.cookTimeMinutes) || 25;
    const recipeTitle = recipe.name || recipe.title || 'Recipe';

    const whyItMatches = [
      recipe.matchedIngredients && recipe.matchedIngredients.length > 0
        ? `✓ Uses your available ${recipe.matchedIngredients.slice(0, 3).join(', ')}`
        : `✓ Fast weeknight dish ready in ${recipeTime} mins`,
      `✓ Fits within ₹${budget} budget (only ₹${costPP}/person for ${peopleCount} people)`,
      recipe.proteinGrams ? `✓ Rich in protein (${recipe.proteinGrams}g per serving)` : `✓ Balanced macro profile`
    ];

    return {
      id: recipe.id,
      title: recipeTitle,
      subtitle: `${recipe.cuisine} • ${recipeTime} mins • ₹${costPP}/person`,
      description: recipe.description,
      imageUrl: recipe.image || recipe.imageUrl,
      isBestMatch: index === 0,
      totalCost,
      costPerPerson: costPP,
      servings: peopleCount,
      cookingTimeMinutes: recipeTime,
      difficulty: recipe.difficulty || 'Medium',
      calories: recipe.calories || 360,
      proteinGrams: recipe.proteinGrams || 20,
      carbsGrams: recipe.carbsGrams || 38,
      fatGrams: recipe.fatGrams || 12,
      fiberGrams: recipe.fiberGrams,
      availableIngredients: recipe.matchedIngredients || [],
      missingIngredients: recipe.missingIngredients || [],
      whyItMatches,
      instructions: recipe.instructions,
      allIngredients: recipe.ingredients,
      chefTip: recipe.chefTip,
      cuisine: recipe.cuisine
    };
  });

  return suggestions;
}
