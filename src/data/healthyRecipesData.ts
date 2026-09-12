import type { Recipe } from '../types';

export const HEALTHY_RECIPES: Recipe[] = [
  {
    id: 'healthy-1',
    title: 'Greek Yogurt Berry Crunch Bowl',
    subtitle: 'Creamy high-protein strained yogurt layered with wild blueberries, chia seeds, and toasted pumpkin seeds.',
    description: 'An energizing, gut-friendly breakfast or afternoon snack. Packed with probiotics and slow-digesting proteins, naturally sweetened with fresh berries and a hint of warm cinnamon.',
    imageUrl: '/images/healthy/greek_yogurt_berry_bowl.jpg',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: 'Easy',
    cuisine: 'Mediterranean Clean',
    calories: 280,
    proteinGrams: 24,
    carbsGrams: 26,
    fatGrams: 7,
    fiberGrams: 6,
    nutritionalBenefits: [
      '24g High-Quality Protein',
      'Probiotic Gut Support',
      'Antioxidant Rich',
      'Zero Refined Sugar'
    ],
    rating: 4.9,
    reviewCount: 168,
    featured: true,
    tags: ['High-Protein', 'Healthy Breakfast', 'Healthy Snacks', 'Vegetarian', 'Low Added Sugar', 'Nutrient Dense', 'Quick & Healthy'],
    ingredients: [
      { name: 'Greek Yogurt', amount: '200g plain unsweetened', inPantry: true },
      { name: 'Blueberries', amount: '1/2 cup fresh or thawed', inPantry: false },
      { name: 'Chia Seeds', amount: '1 tbsp', inPantry: false },
      { name: 'Pumpkin Seeds', amount: '1 tbsp toasted', inPantry: false, isOptional: true },
      { name: 'Honey', amount: '1 tsp raw', inPantry: true, isOptional: true },
      { name: 'Ground Cinnamon', amount: 'Pinch', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Base Layer', instruction: 'Spoon thick, unsweetened Greek yogurt into a chilled bowl.' },
      { step: 2, title: 'Top with Berries', instruction: 'Scatter fresh blueberries over the yogurt and lightly press a few so juices release.' },
      { step: 3, title: 'Garnish & Crunch', instruction: 'Sprinkle chia seeds, toasted pumpkin seeds, and a dusting of cinnamon. Drizzle raw honey if desired.' }
    ],
    chefTip: 'Toasting pumpkin seeds in a dry pan for 2 minutes releases their nutty aroma and adds satisfying crunch.'
  },
  {
    id: 'healthy-2',
    title: 'Overnight Chia & Rolled Oats Jar',
    subtitle: 'Slow-digesting whole oats soaked in almond milk with chia seeds, cinnamon, and sliced banana.',
    description: 'The ultimate prep-ahead healthy breakfast. Complex carbohydrates and soluble fiber keep blood sugar balanced and hunger steady all morning.',
    imageUrl: '/images/healthy/overnight_oats_jar.jpg',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    difficulty: 'Easy',
    cuisine: 'Whole Food Plant-Based',
    calories: 340,
    proteinGrams: 14,
    carbsGrams: 52,
    fatGrams: 9,
    fiberGrams: 11,
    nutritionalBenefits: [
      '11g Prebiotic Fiber',
      'Sustained Morning Energy',
      'Heart Healthy Beta-Glucans',
      'Low Glycemic'
    ],
    rating: 4.8,
    reviewCount: 204,
    featured: false,
    tags: ['High-Fiber', 'Healthy Breakfast', 'Vegetarian', 'Vegan', 'Balanced Meals', 'Low Added Sugar'],
    ingredients: [
      { name: 'Rolled Oats', amount: '1/2 cup whole rolled', inPantry: true },
      { name: 'Almond Milk', amount: '3/4 cup unsweetened', inPantry: false },
      { name: 'Chia Seeds', amount: '1 tbsp', inPantry: false },
      { name: 'Banana', amount: '1/2 sliced', inPantry: false },
      { name: 'Vanilla Extract', amount: '1/4 tsp', inPantry: true, isOptional: true }
    ],
    instructions: [
      { step: 1, title: 'Combine in Jar', instruction: 'Add rolled oats, chia seeds, vanilla, and milk into a mason jar. Stir thoroughly with a spoon.' },
      { step: 2, title: 'Chill Overnight', instruction: 'Seal the jar and refrigerate for at least 4 hours (or overnight) to allow oats and chia seeds to expand into a creamy texture.' },
      { step: 3, title: 'Serve Fresh', instruction: 'Top with fresh sliced banana and a dusting of cinnamon right before eating.' }
    ],
    chefTip: 'Use whole rolled oats rather than instant oats for superior texture and a lower glycemic index.'
  },
  {
    id: 'healthy-3',
    title: 'Grilled Citrus Herb Chicken & Warm Quinoa Bowl',
    subtitle: 'Lean marinated chicken breast over fluffy quinoa, baby spinach, roasted peppers, and lemon vinaigrette.',
    description: 'A vibrant power bowl designed for clean protein and sustained energy. High-fiber quinoa tossed with fresh herbs, tender chicken, and nutrient-dense greens.',
    imageUrl: '/images/healthy/chicken_quinoa_bowl.jpg',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    difficulty: 'Medium',
    cuisine: 'Mediterranean',
    calories: 440,
    proteinGrams: 42,
    carbsGrams: 36,
    fatGrams: 12,
    fiberGrams: 7,
    nutritionalBenefits: [
      '42g Lean Complete Protein',
      'Complete Amino Acid Profile',
      'Rich in Iron & B-Vitamins',
      'Heart Healthy Fats'
    ],
    rating: 4.9,
    reviewCount: 312,
    featured: true,
    tags: ['High-Protein', 'Balanced Meals', 'Nutrient Dense', 'Healthy Lunch', 'Healthy Dinner'],
    ingredients: [
      { name: 'Chicken Breast', amount: '300g boneless', inPantry: true },
      { name: 'Quinoa', amount: '1 cup cooked', inPantry: false },
      { name: 'Spinach', amount: '2 cups fresh', inPantry: true },
      { name: 'Olive Oil', amount: '1 tbsp extra virgin', inPantry: true },
      { name: 'Lemon', amount: '1 whole juiced', inPantry: true },
      { name: 'Garlic', amount: '2 cloves minced', inPantry: true },
      { name: 'Bell Pepper', amount: '1 sliced', inPantry: false }
    ],
    instructions: [
      { step: 1, title: 'Marinate & Grill', instruction: 'Toss chicken breasts with olive oil, garlic, lemon juice, oregano, salt, and pepper. Grill or sear on medium-high for 6 mins per side.' },
      { step: 2, title: 'Assemble Base', instruction: 'Fluff warm cooked quinoa and arrange in bowls alongside baby spinach and sliced bell peppers.' },
      { step: 3, title: 'Slice & Drizzle', instruction: 'Slice the grilled chicken across the grain, arrange on top, and finish with a squeeze of fresh lemon.' }
    ],
    chefTip: 'Cooking quinoa in low-sodium vegetable or chicken broth instead of plain water infuses deep flavor without extra calories.'
  },
  {
    id: 'healthy-4',
    title: 'Mediterranean Chickpea & Avocado Smash Salad',
    subtitle: 'Protein-packed chickpeas tossed with creamy avocado, diced cucumbers, cherry tomatoes, and herb lemon dressing.',
    description: 'Crisp, refreshing, and deeply nourishing. Packed with plant protein, healthy monounsaturated fats, and vibrant raw produce for an effortless 10-minute lunch.',
    imageUrl: '/images/healthy/chickpea_avocado_salad.jpg',
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Mediterranean Plant-Forward',
    calories: 360,
    proteinGrams: 16,
    carbsGrams: 42,
    fatGrams: 14,
    fiberGrams: 13,
    nutritionalBenefits: [
      '13g High Dietary Fiber',
      'Heart Healthy Monounsaturated Fats',
      '100% Plant-Based Nutrients',
      'No Cooking Required'
    ],
    rating: 4.8,
    reviewCount: 189,
    featured: false,
    tags: ['High-Fiber', 'Balanced Meals', 'Vegetarian', 'Vegan', 'Healthy Lunch', 'Quick & Healthy', 'Nutrient Dense'],
    ingredients: [
      { name: 'Chickpeas', amount: '1 can (400g) rinsed & drained', inPantry: false },
      { name: 'Avocado', amount: '1 ripe diced', inPantry: false },
      { name: 'Tomatoes', amount: '1 cup cherry tomatoes halved', inPantry: true },
      { name: 'Cucumber', amount: '1 cup diced', inPantry: false },
      { name: 'Olive Oil', amount: '1 tbsp', inPantry: true },
      { name: 'Lemon', amount: '1/2 juiced', inPantry: true },
      { name: 'Parsley', amount: 'Handful chopped', inPantry: false, isOptional: true }
    ],
    instructions: [
      { step: 1, title: 'Light Smash', instruction: 'In a mixing bowl, gently mash 1/3 of the chickpeas with a fork to create a hearty binding texture.' },
      { step: 2, title: 'Toss Produce', instruction: 'Fold in diced avocado, cherry tomatoes, cucumber, and remaining whole chickpeas.' },
      { step: 3, title: 'Dress & Season', instruction: 'Drizzle with extra virgin olive oil, lemon juice, sea salt, and black pepper. Toss gently.' }
    ],
    chefTip: 'Lightly crushing a portion of the chickpeas absorbs the dressing into every bite and creates a luxurious creamy mouthfeel.'
  },
  {
    id: 'healthy-5',
    title: 'Protein-Rich Moong Dal Chilla with Mint Paneer',
    subtitle: 'Golden, crispy split mung bean savory crepes stuffed with spiced crumbled fresh paneer and herbs.',
    description: 'An ancient, time-tested Indian wellness staple. High in plant protein and gentle on digestion, with a crispy golden exterior and savory spiced cottage cheese filling.',
    imageUrl: '/images/healthy/moong_dal_chilla.jpg',
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Indian Wellness',
    calories: 310,
    proteinGrams: 22,
    carbsGrams: 28,
    fatGrams: 11,
    fiberGrams: 8,
    nutritionalBenefits: [
      '22g High Quality Protein',
      'Easily Digestible Legumes',
      'Low Glycemic Index',
      'Rich in Folate & Magnesium'
    ],
    rating: 4.9,
    reviewCount: 245,
    featured: true,
    tags: ['High-Protein', 'Vegetarian', 'Healthy Breakfast', 'Healthy Lunch', 'Nutrient Dense', 'Balanced Meals'],
    ingredients: [
      { name: 'Moong Dal', amount: '1 cup yellow/green split dal, soaked & blended', inPantry: false },
      { name: 'Paneer', amount: '80g grated/crumbled', inPantry: false },
      { name: 'Ginger', amount: '1 tsp grated', inPantry: true },
      { name: 'Green Chilli', amount: '1 finely chopped', inPantry: false },
      { name: 'Spinach', amount: '1/2 cup finely shredded', inPantry: true },
      { name: 'Olive Oil', amount: '1 tsp for pan roasting', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Blend Batter', instruction: 'Blend soaked moong dal with ginger, green chilli, salt, and water to a smooth crepe batter consistency.' },
      { step: 2, title: 'Pour & Crisp', instruction: 'Ladle batter onto a hot lightly oiled non-stick skillet. Spread in circular motions and cook until edges turn golden brown and crisp.' },
      { step: 3, title: 'Stuff & Fold', instruction: 'Scatter spiced paneer and shredded spinach across the center. Fold into a half moon and serve hot with mint chutney.' }
    ],
    chefTip: 'Pouring the batter onto a medium-hot skillet ensures an ultra-crispy edge without tearing.'
  },
  {
    id: 'healthy-6',
    title: 'Herb-Crusted Baked Salmon with Asparagus',
    subtitle: 'Omega-3 rich salmon fillet baked with dijon herb crust alongside tender roasted asparagus and lemon.',
    description: 'A deeply restorative dinner rich in essential fatty acids and lean protein. Baking seals in moisture while preserving delicate micronutrients.',
    imageUrl: '/images/healthy/salmon_with_asparagus.jpg',
    prepTimeMinutes: 8,
    cookTimeMinutes: 14,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'French Contemporary',
    calories: 410,
    proteinGrams: 38,
    carbsGrams: 8,
    fatGrams: 24,
    fiberGrams: 5,
    nutritionalBenefits: [
      'High Omega-3 Fatty Acids',
      '38g Lean Protein',
      'Supports Cardiovascular Health',
      'Low Carbohydrate'
    ],
    rating: 4.9,
    reviewCount: 198,
    featured: true,
    tags: ['High-Protein', 'Low-Calorie', 'Healthy Dinner', 'Nutrient Dense', 'Balanced Meals', 'Quick & Healthy'],
    ingredients: [
      { name: 'Salmon Fillet', amount: '2 fillets (160g each)', inPantry: false },
      { name: 'Asparagus', amount: '1 bunch trimmed', inPantry: false },
      { name: 'Olive Oil', amount: '1 tbsp', inPantry: true },
      { name: 'Garlic', amount: '3 cloves minced', inPantry: true },
      { name: 'Dijon Mustard', amount: '1 tsp', inPantry: false },
      { name: 'Lemon', amount: '1 whole sliced', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Prep Sheet Pan', instruction: 'Place salmon fillets and trimmed asparagus on a parchment-lined baking sheet.' },
      { step: 2, title: 'Season & Coat', instruction: 'Brush salmon with a thin layer of dijon, minced garlic, herbs, salt, and pepper. Drizzle asparagus with olive oil.' },
      { step: 3, title: 'Bake to Perfection', instruction: 'Bake at 200°C (400°F) for 12-14 minutes until salmon flakes tenderly with a fork.' }
    ],
    chefTip: 'Do not overbake; removing the salmon when the center is slightly translucent ensures a silky, tender texture.'
  },
  {
    id: 'healthy-7',
    title: 'Golden Turmeric Lentil & Roasted Vegetable Soup',
    subtitle: 'Hearty yellow lentils simmered with anti-inflammatory turmeric, ginger, carrots, and baby spinach.',
    description: 'A warming, comforting elixir in a bowl. Packed with prebiotic plant fiber, plant protein, and anti-inflammatory spices that soothe and nourish.',
    imageUrl: '/images/healthy/lentil_spinach_soup.jpg',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 3,
    difficulty: 'Easy',
    cuisine: 'Ayurvedic Inspired',
    calories: 290,
    proteinGrams: 18,
    carbsGrams: 46,
    fatGrams: 4,
    fiberGrams: 12,
    nutritionalBenefits: [
      '12g High Fiber',
      'Turmeric & Ginger Anti-Inflammatory',
      'Low Fat & Heart Healthy',
      'High Plant Micronutrients'
    ],
    rating: 4.8,
    reviewCount: 142,
    featured: false,
    tags: ['High-Fiber', 'Low-Calorie', 'Vegetarian', 'Vegan', 'Healthy Lunch', 'Healthy Dinner', 'Nutrient Dense', 'Low Added Sugar'],
    ingredients: [
      { name: 'Red or Yellow Lentils', amount: '1 cup rinsed', inPantry: false },
      { name: 'Spinach', amount: '2 cups fresh', inPantry: true },
      { name: 'Tomatoes', amount: '1 cup diced', inPantry: true },
      { name: 'Onion', amount: '1 medium chopped', inPantry: true },
      { name: 'Garlic', amount: '4 cloves minced', inPantry: true },
      { name: 'Ginger', amount: '1 tbsp minced', inPantry: true },
      { name: 'Turmeric & Cumin', amount: '1 tsp each', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Sauté Aromatics', instruction: 'Heat 1 tsp oil in a pot. Sauté onion, garlic, ginger, and turmeric for 3 minutes.' },
      { step: 2, title: 'Simmer Lentils', instruction: 'Add rinsed lentils, diced tomatoes, and 4 cups of vegetable broth or water. Simmer for 15 minutes until lentils are velvety.' },
      { step: 3, title: 'Fold Greens', instruction: 'Stir in fresh baby spinach and a squeeze of fresh lemon juice until wilted.' }
    ],
    chefTip: 'Adding lemon juice right at the end brightens the earthy lentils and aids iron absorption.'
  },
  {
    id: 'healthy-8',
    title: 'Scrambled Farm Eggs with Garlic Spinach & Sourdough',
    subtitle: 'Creamy soft-scrambled eggs served alongside olive oil sautéed spinach and artisan toasted sourdough.',
    description: 'A balanced classic breakfast crafted with whole foods. High bioavailability protein from pasture-raised eggs paired with iron-rich greens.',
    imageUrl: '/images/healthy/scrambled_eggs_spinach.jpg',
    prepTimeMinutes: 4,
    cookTimeMinutes: 6,
    servings: 1,
    difficulty: 'Easy',
    cuisine: 'Cafe Artisan',
    calories: 320,
    proteinGrams: 22,
    carbsGrams: 22,
    fatGrams: 14,
    fiberGrams: 4,
    nutritionalBenefits: [
      '22g Bioavailable Protein',
      'Choline for Cognitive Function',
      'Iron & Lutein Rich Greens',
      'Clean Whole Ingredients'
    ],
    rating: 4.8,
    reviewCount: 175,
    featured: false,
    tags: ['High-Protein', 'Healthy Breakfast', 'Vegetarian', 'Balanced Meals', 'Quick & Healthy'],
    ingredients: [
      { name: 'Eggs', amount: '3 whole large', inPantry: true },
      { name: 'Spinach', amount: '2 cups fresh baby spinach', inPantry: true },
      { name: 'Garlic', amount: '2 cloves thinly sliced', inPantry: true },
      { name: 'Olive Oil', amount: '1 tsp', inPantry: true },
      { name: 'Bread', amount: '1 thick slice sourdough or whole grain', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Wilt Greens', instruction: 'Sauté sliced garlic and spinach in 1/2 tsp olive oil for 90 seconds until vibrant green; set aside.' },
      { step: 2, title: 'Soft Scramble', instruction: 'Whisk eggs with a pinch of salt. Pour into low-heat skillet and gently fold with silicone spatula into large soft curds (2 minutes).' },
      { step: 3, title: 'Plate with Toast', instruction: 'Serve immediately on warm toasted sourdough with cracked black pepper.' }
    ],
    chefTip: 'Keep your pan temperature low to medium-low so the eggs stay creamy and custardy without browning.'
  },
  {
    id: 'healthy-9',
    title: 'Savory Oats Vegetable Upma with Roasted Cashews',
    subtitle: 'Rolled oats toasted with mustard seeds, curry leaves, ginger, carrots, peas, and golden cashews.',
    description: 'A wholesome savory porridge packed with dietary fiber and garden vegetables. Light, satisfying, and energizing without heavy carbs.',
    imageUrl: '/images/healthy/oats_vegetable_upma.jpg',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'South Indian Clean',
    calories: 270,
    proteinGrams: 11,
    carbsGrams: 42,
    fatGrams: 7,
    fiberGrams: 8,
    nutritionalBenefits: [
      '8g Soluble Fiber',
      'Cardiovascular Support',
      'Low Calorie & Nutrient Dense',
      '100% Plant-Based'
    ],
    rating: 4.7,
    reviewCount: 118,
    featured: false,
    tags: ['High-Fiber', 'Low-Calorie', 'Vegetarian', 'Vegan', 'Healthy Breakfast', 'Healthy Snacks', 'Balanced Meals', 'Quick & Healthy'],
    ingredients: [
      { name: 'Rolled Oats', amount: '1 cup whole oats', inPantry: true },
      { name: 'Onion', amount: '1 small finely chopped', inPantry: true },
      { name: 'Ginger', amount: '1 tsp minced', inPantry: true },
      { name: 'Green Chilli', amount: '1 slit', inPantry: false },
      { name: 'Mustard Seeds', amount: '1/2 tsp', inPantry: false },
      { name: 'Cashews', amount: '8-10 raw', inPantry: false, isOptional: true },
      { name: 'Lemon', amount: '1/2 juiced', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Dry Roast Oats', instruction: 'Dry roast oats in a pan for 3 minutes until aromatic; transfer to a plate.' },
      { step: 2, title: 'Sauté Tempering', instruction: 'Heat 1 tsp oil, add mustard seeds, cashews, ginger, and green chillies. Add chopped onions and sauté.' },
      { step: 3, title: 'Simmer & Fluff', instruction: 'Pour 1.5 cups boiling water, add salt, stir in roasted oats, cover, and cook on low for 3 minutes until fluffy.' }
    ],
    chefTip: 'Dry roasting the oats before adding water keeps the grains delightfully separate and avoids any gummy texture.'
  },
  {
    id: 'healthy-10',
    title: 'Crunchy Sprouted Moong & Pomegranate Chaat',
    subtitle: 'Live sprouted moong beans tossed with sweet ruby pomegranate arils, lime juice, chaat masala, and mint.',
    description: 'An enzyme-rich, crunchy live food salad. Sprouting multiplies micronutrient absorption, vitamins, and digestible plant protein for an instant midday lift.',
    imageUrl: '/images/healthy/sprouts_chaat.jpg',
    prepTimeMinutes: 8,
    cookTimeMinutes: 0,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Live Whole Foods',
    calories: 210,
    proteinGrams: 15,
    carbsGrams: 34,
    fatGrams: 2,
    fiberGrams: 10,
    nutritionalBenefits: [
      '10g High Plant Fiber',
      'Enzyme-Rich Live Sprouted Nutrition',
      'Under 220 kcal per Serving',
      'Antioxidant Polyphenols'
    ],
    rating: 4.9,
    reviewCount: 210,
    featured: false,
    tags: ['High-Fiber', 'Low-Calorie', 'Healthy Snacks', 'Healthy Lunch', 'Vegetarian', 'Vegan', 'Nutrient Dense', 'Low Added Sugar'],
    ingredients: [
      { name: 'Sprouted Moong Beans', amount: '2 cups fresh sprouts', inPantry: false },
      { name: 'Pomegranate Seeds', amount: '1/2 cup', inPantry: false },
      { name: 'Tomatoes', amount: '1 small diced', inPantry: true },
      { name: 'Cucumber', amount: '1/2 cup diced', inPantry: false },
      { name: 'Lemon', amount: '1 whole juiced', inPantry: true },
      { name: 'Chaat Masala', amount: '1/2 tsp', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Steam or Raw', instruction: 'Use raw fresh sprouts, or steam them for 2 minutes if you prefer a softer bite.' },
      { step: 2, title: 'Toss Together', instruction: 'In a bowl, combine sprouts, pomegranate seeds, diced cucumber, tomatoes, and chopped mint.' },
      { step: 3, title: 'Season & Crunch', instruction: 'Toss with fresh lemon juice, chaat masala, and pink rock salt. Serve immediately.' }
    ],
    chefTip: 'Adding sweet pomegranate pearls provides natural juiciness without needing any oils or added sweeteners.'
  },
  {
    id: 'healthy-11',
    title: 'Crispy Sesame Tofu & Edamame Green Veggie Stir-Fry',
    subtitle: 'Golden pan-seared organic tofu cubes with edamame, broccoli florets, and ginger soy reduction.',
    description: 'A vibrant plant-powered skillet meal bursting with clean protein, fiber, and crunchy cruciferous goodness on high heat.',
    imageUrl: '/images/healthy/tofu_veggie_stirfry.jpg',
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Pan-Asian Clean',
    calories: 360,
    proteinGrams: 28,
    carbsGrams: 22,
    fatGrams: 16,
    fiberGrams: 9,
    nutritionalBenefits: [
      '28g Plant-Based Complete Protein',
      'Cruciferous Sulforaphane Compounds',
      'High in Calcium & Magnesium',
      'Zero Saturated Dairy Fats'
    ],
    rating: 4.8,
    reviewCount: 154,
    featured: false,
    tags: ['High-Protein', 'High-Fiber', 'Vegetarian', 'Vegan', 'Healthy Dinner', 'Healthy Lunch', 'Nutrient Dense', 'Quick & Healthy'],
    ingredients: [
      { name: 'Firm Tofu', amount: '250g pressed & cubed', inPantry: false },
      { name: 'Broccoli', amount: '2 cups florets', inPantry: false },
      { name: 'Garlic', amount: '3 cloves minced', inPantry: true },
      { name: 'Ginger', amount: '1 tbsp minced', inPantry: true },
      { name: 'Soy Sauce', amount: '1.5 tbsp low sodium', inPantry: true },
      { name: 'Sesame Oil', amount: '1 tsp', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Crisp Tofu', instruction: 'Pan-fry pressed tofu cubes in 1 tsp oil on medium-high until edges are golden and crisp (6 mins).' },
      { step: 2, title: 'Flash Sauté Greens', instruction: 'Add minced garlic, ginger, and broccoli florets with 2 tbsp water; cover for 2 mins to steam.' },
      { step: 3, title: 'Glaze & Serve', instruction: 'Uncover, drizzle low-sodium soy sauce and toasted sesame seeds, tossing vigorously for 1 minute.' }
    ],
    chefTip: 'Pressing your tofu block with paper towels for 10 minutes removes excess moisture so it turns delightfully crispy in the pan.'
  },
  {
    id: 'healthy-12',
    title: 'Warm Charred Broccoli & Grilled Paneer Power Bowl',
    subtitle: 'Golden turmeric grilled paneer skewers with charred broccoli, brown rice, and lemon tahini drizzle.',
    description: 'Deeply satisfying vegetarian comfort food packed with calcium, complete dairy proteins, and whole grain fiber.',
    imageUrl: '/images/healthy/paneer_broccoli_bowl.jpg',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Modern Indian Healthy',
    calories: 420,
    proteinGrams: 26,
    carbsGrams: 38,
    fatGrams: 18,
    fiberGrams: 8,
    nutritionalBenefits: [
      '26g Calcium-Rich Protein',
      '8g Whole Grain Fiber',
      'Antioxidant Rich Cruciferous Veggies',
      'Balanced Macro Distribution'
    ],
    rating: 4.9,
    reviewCount: 167,
    featured: false,
    tags: ['High-Protein', 'Balanced Meals', 'Vegetarian', 'Healthy Dinner', 'Healthy Lunch', 'Nutrient Dense'],
    ingredients: [
      { name: 'Paneer', amount: '180g cubed', inPantry: false },
      { name: 'Broccoli', amount: '2 cups florets', inPantry: false },
      { name: 'Rice', amount: '1 cup cooked brown rice', inPantry: true },
      { name: 'Olive Oil', amount: '1 tbsp', inPantry: true },
      { name: 'Turmeric & Cumin', amount: '1/2 tsp each', inPantry: true },
      { name: 'Lemon', amount: '1 whole juiced', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Sear Paneer & Broccoli', instruction: 'Toss paneer and broccoli in olive oil, turmeric, cumin, and salt. Sear in a hot grill pan for 5-6 mins until charred.' },
      { step: 2, title: 'Assemble Bowl', instruction: 'Place warm brown rice at the base, top with charred broccoli and golden paneer.' },
      { step: 3, title: 'Finish', instruction: 'Drizzle with fresh lemon juice and chopped mint.' }
    ],
    chefTip: 'High heat charring on broccoli caramelizes natural sugars without losing its crisp bite.'
  }
];
