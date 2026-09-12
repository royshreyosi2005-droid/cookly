import type { AgentIntent, ParsedConstraints } from '../models/agent.model.js';

export class NLUEngine {
  private static readonly COMMON_INGREDIENTS = [
    'egg', 'eggs', 'potato', 'potatoes', 'onion', 'onions', 'tomato', 'tomatoes',
    'garlic', 'ginger', 'chicken', 'paneer', 'rice', 'pasta', 'cheese', 'spinach',
    'mushroom', 'mushrooms', 'bell pepper', 'capsicum', 'butter', 'milk', 'cream',
    'yogurt', 'curd', 'fish', 'salmon', 'tuna', 'shrimp', 'beef', 'pork', 'lamb',
    'flour', 'bread', 'quinoa', 'oat', 'oats', 'lentil', 'lentils', 'dal', 'chickpea',
    'chickpeas', 'tofu', 'broccoli', 'carrot', 'carrots', 'cucumber', 'lemon', 'avocado'
  ];

  private static readonly CUISINES = [
    'indian', 'italian', 'mexican', 'asian', 'chinese', 'japanese',
    'mediterranean', 'american', 'thai', 'french', 'greek', 'spanish'
  ];

  private static readonly MEAL_TYPES = [
    'breakfast', 'brunch', 'lunch', 'dinner', 'dessert', 'snack', 'appetizer', 'soup', 'salad'
  ];

  public static parse(prompt: string, contextPantry: string[] = []): ParsedConstraints {
    const raw = prompt.trim();
    const lower = raw.toLowerCase();

    // 1. Extract Budget
    let budget: number | undefined;
    let budgetMode: 'total' | 'per_person' | undefined;
    const budgetMatch = lower.match(/(?:₹|rs\.?|inr|budget\s*(?:of)?\s*|under\s*₹?)\s*(\d+)/i) ||
                        lower.match(/(\d+)\s*(?:rs|rupees|bucks|₹)/i);
    if (budgetMatch && budgetMatch[1]) {
      const b = parseInt(budgetMatch[1], 10);
      if (!isNaN(b) && b > 0) {
        budget = b;
        budgetMode = lower.includes('per person') || lower.includes('per head') || lower.includes('each') ? 'per_person' : 'total';
      }
    }

    // 2. Extract Servings / People Count
    let servings: number | undefined;
    const peopleMatch = lower.match(/(?:for|serves|feed|family of|table for)\s*(\d+)\s*(?:people|persons?|pax|heads)?/i) ||
                        lower.match(/(\d+)\s*(?:people|persons?|pax)/i);
    if (peopleMatch && peopleMatch[1]) {
      const s = parseInt(peopleMatch[1], 10);
      if (!isNaN(s) && s > 0 && s <= 30) {
        servings = s;
      }
    }

    // 3. Extract Cooking Time Limit
    let maxCookingTime: number | undefined;
    if (lower.includes('1 hour') || lower.includes('60 min') || lower.includes('60 minutes')) {
      maxCookingTime = 60;
    } else {
      const timeMatch = lower.match(/(?:under|less than|within|in|max)\s*(\d+)\s*(?:min|mins|minutes)/i) ||
                        lower.match(/(\d+)\s*(?:min|mins|minutes)/i);
      if (timeMatch && timeMatch[1]) {
        const t = parseInt(timeMatch[1], 10);
        if (!isNaN(t) && t > 0) maxCookingTime = t;
      } else if (lower.includes('quick') || lower.includes('fast') || lower.includes('speedy')) {
        maxCookingTime = 25;
      }
    }

    // 4. Extract Inclusions & Exclusions
    const includedIngredients: string[] = [...contextPantry];
    const excludedIngredients: string[] = [];

    // Parse explicit exclusions (e.g., "without dairy", "no onions", "except mushrooms")
    const exclusionSplits = lower.split(/(?:without|no |except|excluding|but no|free of)/i);
    if (exclusionSplits.length > 1) {
      const exclusionText = exclusionSplits.slice(1).join(' ');
      if (exclusionText.includes('dairy')) {
        excludedIngredients.push('milk', 'cheese', 'butter', 'cream', 'yogurt', 'paneer', 'dairy');
      }
      if (exclusionText.includes('gluten')) {
        excludedIngredients.push('flour', 'wheat', 'bread', 'pasta');
      }
      if (exclusionText.includes('meat') || exclusionText.includes('non-veg')) {
        excludedIngredients.push('chicken', 'beef', 'pork', 'fish', 'meat', 'mutton', 'lamb');
      }

      this.COMMON_INGREDIENTS.forEach((ing) => {
        if (exclusionText.includes(ing) && !excludedIngredients.includes(ing)) {
          excludedIngredients.push(ing);
        }
      });
    }

    // Parse included ingredients from positive clauses
    const positiveText = exclusionSplits[0] || lower;
    this.COMMON_INGREDIENTS.forEach((ing) => {
      // Check if word appears and not in exclusions
      const regex = new RegExp(`\\b${ing}s?\\b`, 'i');
      if (regex.test(positiveText) && !excludedIngredients.includes(ing)) {
        const capitalized = ing.charAt(0).toUpperCase() + ing.slice(1);
        if (!includedIngredients.some((i) => i.toLowerCase() === ing)) {
          includedIngredients.push(capitalized);
        }
      }
    });

    // 5. Extract Cuisine
    let cuisine: string | undefined;
    for (const c of this.CUISINES) {
      if (lower.includes(c)) {
        cuisine = c.charAt(0).toUpperCase() + c.slice(1);
        break;
      }
    }

    // 6. Extract Meal Type
    let mealType: string | undefined;
    for (const m of this.MEAL_TYPES) {
      if (lower.includes(m)) {
        mealType = m.charAt(0).toUpperCase() + m.slice(1);
        break;
      }
    }

    // 7. Extract Dietary Tags
    const dietaryTags: string[] = [];
    if (lower.includes('vegan')) dietaryTags.push('Vegan', 'Vegetarian');
    else if (lower.includes('vegetarian') || (lower.includes('veg') && !lower.includes('non-veg'))) {
      dietaryTags.push('Vegetarian');
    }
    if (lower.includes('gluten-free') || lower.includes('gluten free') || excludedIngredients.includes('flour')) {
      dietaryTags.push('Gluten-Free');
    }
    if (lower.includes('dairy-free') || lower.includes('dairy free') || excludedIngredients.includes('milk')) {
      dietaryTags.push('Dairy-Free');
    }
    if (lower.includes('high protein') || lower.includes('high-protein') || lower.includes('lots of protein')) {
      dietaryTags.push('High-Protein');
    }
    if (lower.includes('low carb') || lower.includes('low-carb') || lower.includes('keto')) {
      dietaryTags.push('Low-Carb');
    }
    if (lower.includes('low calorie') || lower.includes('low-calorie')) {
      dietaryTags.push('Low-Calorie');
    }
    if (lower.includes('high fiber') || lower.includes('high-fiber')) {
      dietaryTags.push('High-Fiber');
    }

    // 8. Health & Nutrition Markers
    const isHealthy = lower.includes('healthy') ||
                      lower.includes('nutritious') ||
                      lower.includes('weight loss') ||
                      lower.includes('high protein') ||
                      lower.includes('low calorie') ||
                      lower.includes('high fiber');

    let minProtein: number | undefined;
    if (lower.includes('high protein') || lower.includes('lots of protein')) {
      minProtein = 20;
    }

    let maxCalories: number | undefined;
    if (lower.includes('low calorie') || lower.includes('light meal')) {
      maxCalories = 420;
    }

    let minFiber: number | undefined;
    if (lower.includes('high fiber') || lower.includes('fiber rich')) {
      minFiber = 5;
    }

    // 9. Clean Query String (strip conversational prefixes, dietary tags, cuisines & modifiers)
    let cleaned = raw
      .replace(/^(?:i have|i only have|i've got|we have|give me|find me|search for|show me|what can i make with|how to make|recipe for|what can i make for)\s+/i, '')
      .replace(/(?:without|no |except|excluding|but no|free of)\s+[a-z\s,]+/i, '')
      .replace(/\b(?:high protein|low calorie|high fiber|healthy|nutritious|weight loss|quick|easy|fast|dinner|lunch|breakfast|brunch|dessert|snack|something|vegetarian|vegan|gluten[- ]free|dairy[- ]free|keto|low[- ]carb)\b/gi, '')
      .replace(new RegExp(`\\b(?:${NLUEngine.CUISINES.join('|')})\\b`, 'gi'), '')
      .replace(/(?:under|less than|within|in)\s*\d+\s*(?:min|mins|minutes)?/gi, '')
      .replace(/(?:₹|rs\.?|inr|budget\s*(?:of)?|for\s*\d+\s*(?:people|persons?|pax)?)/gi, '')
      .replace(/[.!?;,]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned || cleaned.length < 2) {
      cleaned = includedIngredients.join(' ') || '';
    }

    // 10. Determine Agent Intent
    let intent: AgentIntent = 'GENERAL_SEARCH';

    const isPantryPhrase = /^(?:i have|i only have|i've got|using|got|available ingredients|with only)\b/i.test(lower) ||
                           (includedIngredients.length >= 2 && !budget && !lower.includes('recipe for'));

    if (budget !== undefined || (servings !== undefined && (budget !== undefined || lower.includes('what can i make')))) {
      intent = 'AI_CHEF';
    } else if (isHealthy) {
      intent = 'HEALTHY_SEARCH';
    } else if (isPantryPhrase) {
      intent = 'PANTRY_MATCH';
    } else if (/^(?:how to make|recipe for|how to cook|details of|steps for)\b/i.test(lower)) {
      intent = 'RECIPE_DETAILS';
    } else if (excludedIngredients.length > 0 || (includedIngredients.length > 0 && lower.includes('with '))) {
      intent = 'INGREDIENT_SEARCH';
    } else if (cuisine && !includedIngredients.length) {
      intent = 'CUISINE_SEARCH';
    } else if (mealType && !includedIngredients.length) {
      intent = 'MEAL_TYPE_SEARCH';
    }

    return {
      rawQuery: prompt,
      cleanedQuery: cleaned,
      intent,
      budget,
      budgetMode,
      servings,
      maxCookingTime,
      includedIngredients,
      excludedIngredients,
      cuisine,
      mealType,
      dietaryTags: Array.from(new Set(dietaryTags)),
      isHealthy,
      minProtein,
      maxCalories,
      minFiber
    };
  }
}
