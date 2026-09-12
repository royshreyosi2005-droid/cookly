import type { AIChefPromptParams, AIChefSuggestion, FoodPreference } from '../types';
import { getAIChefRecipeImage } from '../data/aiChefRecipesData';

export const EXAMPLE_PROMPTS = [
  'I have ₹150, there are 3 people, I have eggs and potatoes, and I want something healthy under 30 mins.',
  'I have ₹100 for dinner for 2 people with rice and onions.',
  'High protein meal in 20 minutes with eggs and garlic.',
  'Healthy vegetarian lunch under ₹80 with potatoes, tomatoes and rice.'
];

export function parseNaturalLanguageQuery(query: string, existingParams?: Partial<AIChefPromptParams>): AIChefPromptParams {
  const lower = query.toLowerCase();

  // 1. Budget extraction (₹150, 150 rs, under 100, etc.)
  let budget = existingParams?.budget || 150;
  const budgetMatch = lower.match(/(?:₹|rs\.?|inr|budget\s*(?:of)?\s*|under\s*₹?)\s*(\d+)/i) ||
                      lower.match(/(\d+)\s*(?:rs|rupees|bucks|₹)/i);
  if (budgetMatch && budgetMatch[1]) {
    const val = parseInt(budgetMatch[1], 10);
    if (!isNaN(val) && val > 0) {
      budget = val;
    }
  }

  // 2. People extraction (for 3 people, 2 person, 4 people, dinner for 2)
  let peopleCount = existingParams?.peopleCount || 2;
  const peopleMatch = lower.match(/(?:for|serves|feed|family of|table for)\s*(\d+)\s*(?:people|persons?|pax|heads)?/i) ||
                      lower.match(/(\d+)\s*(?:people|persons?|pax)/i);
  if (peopleMatch && peopleMatch[1]) {
    const val = parseInt(peopleMatch[1], 10);
    if (!isNaN(val) && val > 0 && val <= 20) {
      peopleCount = val;
    }
  }

  // 3. Time extraction (30 min, 15 minutes, 1 hour, 45 mins)
  let maxCookTimeMinutes = existingParams?.maxCookTimeMinutes || 30;
  if (lower.includes('1 hour') || lower.includes('60 min')) {
    maxCookTimeMinutes = 60;
  } else {
    const timeMatch = lower.match(/(?:under|less than|within|in)\s*(\d+)\s*(?:min|mins|minutes)/i) ||
                      lower.match(/(\d+)\s*(?:min|mins|minutes)/i);
    if (timeMatch && timeMatch[1]) {
      const val = parseInt(timeMatch[1], 10);
      if (!isNaN(val) && val > 0) {
        maxCookTimeMinutes = val;
      }
    }
  }

  // 4. Food Preference extraction
  let foodPreference: FoodPreference = existingParams?.foodPreference || 'Any';
  if (lower.includes('high protein') || lower.includes('protein rich') || lower.includes('high-protein')) {
    foodPreference = 'High-protein';
  } else if (lower.includes('vegetarian') || lower.includes('veg ') || lower.includes('pure veg')) {
    foodPreference = 'Vegetarian';
  } else if (lower.includes('non-veg') || lower.includes('non veg') || lower.includes('chicken') || lower.includes('meat')) {
    foodPreference = 'Non-vegetarian';
  } else if (lower.includes('low calorie') || lower.includes('low cal') || lower.includes('weight loss')) {
    foodPreference = 'Low-calorie';
  } else if (lower.includes('healthy') || lower.includes('clean eating') || lower.includes('diet')) {
    foodPreference = 'Healthy';
  }

  // 5. Ingredients extraction
  const knownIngredients = [
    'eggs', 'egg', 'potatoes', 'potato', 'rice', 'onion', 'onions', 'tomatoes', 'tomato',
    'garlic', 'spinach', 'paneer', 'chicken', 'bread', 'pasta', 'butter', 'lemon',
    'ginger', 'chilli', 'chili', 'cheese', 'curd', 'yogurt', 'chickpeas', 'lentils', 'dal',
    'mushroom', 'mushrooms', 'bell pepper', 'capsicum', 'olive oil'
  ];

  const detectedIngredients = new Set<string>(existingParams?.availableIngredients || []);
  knownIngredients.forEach(item => {
    if (new RegExp(`\\b${item}\\b`, 'i').test(lower)) {
      // Normalize
      if (item === 'egg') detectedIngredients.add('Eggs');
      else if (item === 'eggs') detectedIngredients.add('Eggs');
      else if (item === 'potato' || item === 'potatoes') detectedIngredients.add('Potatoes');
      else if (item === 'onion' || item === 'onions') detectedIngredients.add('Onions');
      else if (item === 'tomato' || item === 'tomatoes') detectedIngredients.add('Tomatoes');
      else if (item === 'chilli' || item === 'chili') detectedIngredients.add('Green Chillies');
      else detectedIngredients.add(item.charAt(0).toUpperCase() + item.slice(1));
    }
  });

  return {
    budget,
    budgetMode: existingParams?.budgetMode || 'total',
    peopleCount,
    availableIngredients: Array.from(detectedIngredients),
    maxCookTimeMinutes,
    foodPreference,
    userQuery: query
  };
}

export function generateAIChefSuggestions(params: AIChefPromptParams): AIChefSuggestion[] {
  const { budget, peopleCount, availableIngredients, maxCookTimeMinutes, foodPreference } = params;

  const hasEggs = availableIngredients.some(i => i.toLowerCase().includes('egg'));
  const hasPotatoes = availableIngredients.some(i => i.toLowerCase().includes('potato'));
  const hasRice = availableIngredients.some(i => i.toLowerCase().includes('rice'));
  const hasOnion = availableIngredients.some(i => i.toLowerCase().includes('onion'));
  const hasTomatoes = availableIngredients.some(i => i.toLowerCase().includes('tomato'));
  const hasGarlic = availableIngredients.some(i => i.toLowerCase().includes('garlic'));
  const hasChicken = availableIngredients.some(i => i.toLowerCase().includes('chicken'));

  const baseCostPerPerson = Math.max(25, Math.min(Math.round(budget / peopleCount), 95));
  const calcTotal = (perPerson: number) => perPerson * peopleCount;

  const catalog: AIChefSuggestion[] = [];

  // Suggestion 1: High-Protein Egg Potato Bowl (Best Match when eggs/potatoes or budget dinner)
  if (hasEggs || hasPotatoes || foodPreference === 'High-protein' || foodPreference === 'Any' || foodPreference === 'Healthy') {
    const costPP = Math.min(baseCostPerPerson, 42);
    const total = calcTotal(costPP);
    catalog.push({
      id: 'ai-recipe-1',
      title: '🥘 High-Protein Egg Potato Bowl',
      subtitle: 'Crispy pan-roasted potatoes tossed with spiced scrambled farm eggs, sautéed onions, and fresh cilantro.',
      description: 'A comforting, nutrient-dense skillet meal. Golden spiced potatoes caramelized with cumin and turmeric, combined with fluffy protein-packed scrambled eggs for a hearty satisfying dinner.',
      imageUrl: getAIChefRecipeImage('ai-recipe-1'),
      isBestMatch: true,
      totalCost: total,
      costPerPerson: costPP,
      servings: peopleCount,
      cookingTimeMinutes: Math.min(maxCookTimeMinutes, 25),
      difficulty: 'Easy',
      calories: 360,
      proteinGrams: 24,
      carbsGrams: 32,
      fatGrams: 14,
      cuisine: 'Homestyle Fusion',
      availableIngredients: ['Eggs', 'Potatoes', ...(hasOnion ? ['Onions'] : []), ...(hasGarlic ? ['Garlic'] : [])],
      missingIngredients: ['Tomato', 'Green Chilli', 'Fresh Coriander'],
      whyItMatches: [
        `✓ Uses your ${hasEggs && hasPotatoes ? 'eggs and potatoes' : hasEggs ? 'eggs' : 'potatoes'}`,
        `✓ Fits your ₹${budget} budget (only ₹${costPP}/person)`,
        `✓ High protein (24g per serving)`,
        `✓ Ready in 25 mins (under ${maxCookTimeMinutes}m limit)`,
        `✓ Perfectly scaled for ${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}`
      ],
      allIngredients: [
        { name: 'Eggs', amount: `${peopleCount * 2} large`, inPantry: hasEggs },
        { name: 'Potatoes', amount: `${peopleCount * 1.5} medium, diced`, inPantry: hasPotatoes },
        { name: 'Onion', amount: '1 large sliced', inPantry: hasOnion },
        { name: 'Tomato', amount: '1 diced', inPantry: hasTomatoes },
        { name: 'Green Chilli', amount: '2 chopped', inPantry: false },
        { name: 'Turmeric & Cumin', amount: '1 tsp each', inPantry: true },
        { name: 'Cooking Oil', amount: '1.5 tbsp', inPantry: true }
      ],
      instructions: [
        { step: 1, title: 'Crisp Potatoes', instruction: 'Dice potatoes into 1cm cubes. Sauté in hot oil with cumin, turmeric, and salt for 10-12 mins until fork-tender and deeply golden.' },
        { step: 2, title: 'Add Aromatics', instruction: 'Toss in sliced onions and green chillies; sauté for 3 minutes until fragrant.' },
        { step: 3, title: 'Scramble Eggs', instruction: 'Pour whisked eggs directly into the pan. Stir gently over medium flame until soft curds form and coat the potatoes.' },
        { step: 4, title: 'Garnish & Plate', instruction: 'Finish with chopped fresh coriander and a squeeze of fresh lemon juice.' }
      ],
      chefTip: 'Par-boiling diced potatoes in the microwave for 2 minutes before searing cuts your stove cooking time in half!'
    });
  }

  // Suggestion 2: Fragrant Garlic Jeera Rice with Spicy Egg Curry / Dal
  if (hasRice || hasEggs || hasOnion || foodPreference !== 'Non-vegetarian') {
    const costPP = Math.min(baseCostPerPerson - 4, 38);
    const total = calcTotal(costPP);
    catalog.push({
      id: 'ai-recipe-2',
      title: '🍚 20-Min Golden Egg & Jeera Rice Skillet',
      subtitle: 'Fluffy cumin-infused rice tossed with jammy spiced eggs, caramelized garlic, and toasted mustard seeds.',
      description: 'Quick budget-friendly perfection. Aromatic tempered basmati rice layered with seasoned boiled or pan-fried eggs, fresh herbs, and warming spices.',
      imageUrl: getAIChefRecipeImage('ai-recipe-2'),
      totalCost: total,
      costPerPerson: costPP,
      servings: peopleCount,
      cookingTimeMinutes: Math.min(maxCookTimeMinutes, 20),
      difficulty: 'Easy',
      calories: 390,
      proteinGrams: 19,
      carbsGrams: 54,
      fatGrams: 12,
      cuisine: 'Indian Bistro',
      availableIngredients: ['Rice', ...(hasEggs ? ['Eggs'] : []), ...(hasGarlic ? ['Garlic'] : []), ...(hasOnion ? ['Onions'] : [])],
      missingIngredients: ['Curry Leaves', 'Mustard Seeds', 'Ghee / Butter'],
      whyItMatches: [
        `✓ Utilizes your pantry staples (${hasRice ? 'rice' : ''} ${hasEggs ? 'and eggs' : ''})`,
        `✓ Budget friendly (₹${costPP}/person, ₹${total} total)`,
        `✓ Quick weeknight dinner in just 20 mins`,
        `✓ High satisfaction & energy for ${peopleCount} servings`
      ],
      allIngredients: [
        { name: 'Rice', amount: `${peopleCount * 80}g dry or leftover`, inPantry: hasRice },
        { name: 'Eggs', amount: `${peopleCount * 2} eggs`, inPantry: hasEggs },
        { name: 'Garlic', amount: '4 cloves sliced', inPantry: hasGarlic },
        { name: 'Onion', amount: '1 medium chopped', inPantry: hasOnion },
        { name: 'Cumin & Spices', amount: '1 tsp cumin seeds', inPantry: true }
      ],
      instructions: [
        { step: 1, title: 'Temper Aromatics', instruction: 'Heat ghee or oil, sizzle cumin seeds, sliced garlic, and onions until translucent and fragrant.' },
        { step: 2, title: 'Fold Rice & Eggs', instruction: 'Add cooked rice and sliced hard-boiled or scrambled eggs, tossing over high heat with pinch of garam masala.' }
      ],
      chefTip: 'Day-old chilled rice gives separate fluffy grains without sticking to the pan.'
    });
  }

  // Suggestion 3: Sautéed Aloo Jeera & Garlic Flatbread
  if (hasPotatoes || foodPreference === 'Vegetarian' || foodPreference === 'Any') {
    const costPP = Math.min(baseCostPerPerson - 8, 32);
    const total = calcTotal(costPP);
    catalog.push({
      id: 'ai-recipe-3',
      title: '🥔 Quick Dhaba-Style Aloo Jeera',
      subtitle: 'Crispy cumin spiced potato wedges with roasted coriander, green chillies, and tangy amchur.',
      description: 'The definitive Indian comfort dish. Golden-roasted baby potato slices sautéed in fragrant cumin, ginger juliennes, and fresh green chillies.',
      imageUrl: getAIChefRecipeImage('ai-recipe-3'),
      totalCost: total,
      costPerPerson: costPP,
      servings: peopleCount,
      cookingTimeMinutes: 18,
      difficulty: 'Easy',
      calories: 280,
      proteinGrams: 8,
      carbsGrams: 46,
      fatGrams: 9,
      cuisine: 'Indian Traditional',
      availableIngredients: ['Potatoes', ...(hasOnion ? ['Onions'] : []), ...(hasGarlic ? ['Garlic'] : [])],
      missingIngredients: ['Cumin Seeds', 'Amchur / Lemon', 'Coriander'],
      whyItMatches: [
        `✓ 100% Vegetarian & low cost (₹${costPP}/person)`,
        `✓ Super fast (18 minutes total time)`,
        `✓ Comfort food classic for ${peopleCount} people`
      ],
      allIngredients: [
        { name: 'Potatoes', amount: `${peopleCount * 2} medium`, inPantry: hasPotatoes },
        { name: 'Cumin Seeds', amount: '1.5 tsp', inPantry: true },
        { name: 'Turmeric & Chilli Powder', amount: '1/2 tsp each', inPantry: true },
        { name: 'Lemon Juice', amount: '1 tbsp', inPantry: true }
      ],
      instructions: [
        { step: 1, title: 'Slice & Sauté', instruction: 'Slice boiled or raw potatoes into rounds. Fry in hot oil with cumin seeds until golden crisp.' },
        { step: 2, title: 'Season & Serve', instruction: 'Toss with spices and finish with lemon juice.' }
      ],
      chefTip: 'Roast cumin seeds on low flame until nutty brown for maximum aroma.'
    });
  }

  // Suggestion 4: Lemon Garlic Chicken Breast Skillet (if non-veg or chicken present)
  if (hasChicken || foodPreference === 'Non-vegetarian' || (budget >= 150 && foodPreference !== 'Vegetarian')) {
    const costPP = Math.max(55, Math.min(baseCostPerPerson + 15, 85));
    const total = calcTotal(costPP);
    catalog.push({
      id: 'ai-recipe-4',
      title: '🍗 Seared Lemon Garlic Pepper Chicken',
      subtitle: 'Juicy golden chicken pan-seared with cracked black pepper, garlic pan juices, and lemon zest.',
      description: 'High-protein restaurant quality dinner made effortlessly on the stovetop with minimal dishes.',
      imageUrl: getAIChefRecipeImage('ai-recipe-4'),
      totalCost: total,
      costPerPerson: costPP,
      servings: peopleCount,
      cookingTimeMinutes: 20,
      difficulty: 'Medium',
      calories: 420,
      proteinGrams: 42,
      carbsGrams: 4,
      fatGrams: 16,
      cuisine: 'Continental',
      availableIngredients: ['Garlic', ...(hasChicken ? ['Chicken'] : []), ...(hasOnion ? ['Onion'] : [])],
      missingIngredients: ['Chicken Breast', 'Lemon', 'Black Pepper'],
      whyItMatches: [
        `✓ Ultra high protein (42g per serving)`,
        `✓ Fits your ₹${budget} budget`,
        `✓ Ready in 20 minutes`
      ],
      allIngredients: [
        { name: 'Chicken Breast', amount: `${peopleCount * 150}g`, inPantry: hasChicken },
        { name: 'Garlic', amount: '6 cloves crushed', inPantry: hasGarlic },
        { name: 'Lemon', amount: '1 whole', inPantry: true },
        { name: 'Butter / Oil', amount: '2 tbsp', inPantry: true }
      ],
      instructions: [
        { step: 1, title: 'Sear', instruction: 'Sear seasoned chicken fillets on high heat for 5 mins per side.' },
        { step: 2, title: 'Baste & Glaze', instruction: 'Add garlic and lemon juice, basting until glossy.' }
      ],
      chefTip: 'Rest chicken for 3 minutes after searing to keep all juices locked inside.'
    });
  }

  // Ensure first item is marked Best Match
  if (catalog.length > 0 && !catalog.some(c => c.isBestMatch)) {
    catalog[0].isBestMatch = true;
  }

  return catalog;
}
