import type { Recipe, IngredientCategory } from '../types';

export const POPULAR_PANTRY_INGREDIENTS = [
  'Garlic',
  'Eggs',
  'Olive Oil',
  'Onion',
  'Pasta',
  'Tomatoes',
  'Parmesan',
  'Butter',
  'Chicken Breast',
  'Lemon',
  'Spinach',
  'Soy Sauce',
  'Rice',
  'Ginger',
  'Chili Flakes',
  'Cheddar Cheese',
  'Heavy Cream',
  'Basil',
  'Mushrooms',
  'Bread'
];

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  {
    id: 'produce',
    name: 'Fresh Produce',
    iconName: 'Carrot',
    items: ['Garlic', 'Onion', 'Lemon', 'Spinach', 'Tomatoes', 'Ginger', 'Mushrooms', 'Avocado', 'Bell Pepper', 'Broccoli']
  },
  {
    id: 'dairy-eggs',
    name: 'Dairy & Eggs',
    iconName: 'Egg',
    items: ['Eggs', 'Butter', 'Parmesan', 'Heavy Cream', 'Cheddar Cheese', 'Milk', 'Greek Yogurt', 'Feta Cheese']
  },
  {
    id: 'pantry-staples',
    name: 'Pantry Staples',
    iconName: 'Jar',
    items: ['Olive Oil', 'Pasta', 'Rice', 'Soy Sauce', 'Chili Flakes', 'Flour', 'Breadcrumbs', 'Honey', 'Dijon Mustard', 'Black Pepper']
  },
  {
    id: 'proteins',
    name: 'Proteins & Meats',
    iconName: 'Beef',
    items: ['Chicken Breast', 'Bacon', 'Ground Beef', 'Salmon Fillet', 'Canned Tuna', 'Tofu', 'Shrimp', 'Chickpeas']
  }
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'dummyjson-1',
    name: 'Classic Margherita Pizza',
    title: 'Classic Margherita Pizza',
    subtitle: 'Crispy oven-baked crust with San Marzano tomatoes, fresh mozzarella, and sweet basil.',
    description: 'A timeless Italian classic. Crisp homemade dough brushed with extra virgin olive oil, topped with aromatic crushed tomato sauce, melted fresh mozzarella, and fragrant fresh basil leaves.',
    image: 'https://cdn.dummyjson.com/recipe-images/1.webp',
    imageUrl: 'https://cdn.dummyjson.com/recipe-images/1.webp',
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    cookingTime: 35,
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Italian',
    calories: 300,
    proteinGrams: 12,
    carbsGrams: 36,
    fatGrams: 10,
    rating: 4.6,
    reviewCount: 98,
    featured: true,
    tags: ['Vegetarian', 'Quick & Easy', 'Comfort Food'],
    dietaryTags: ['Vegetarian', 'Quick & Easy', 'Comfort Food'],
    source: 'dummyjson',
    sourceUrl: 'https://dummyjson.com/recipes/1',
    ingredients: [
      { name: 'Pizza dough', amount: '1 ball', inPantry: true },
      { name: 'Tomato sauce', amount: '1/2 cup', inPantry: true },
      { name: 'Fresh mozzarella cheese', amount: '1 cup sliced', inPantry: true },
      { name: 'Fresh basil leaves', amount: 'Handful', inPantry: false, isOptional: true },
      { name: 'Olive oil', amount: '1 tbsp', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Roll Dough', instruction: 'Preheat oven to 220°C (425°F). Roll out pizza dough onto a baking sheet.' },
      { step: 2, title: 'Sauce & Cheese', instruction: 'Spread tomato sauce evenly over dough and scatter fresh mozzarella slices.' },
      { step: 3, title: 'Bake & Garnish', instruction: 'Bake for 12-15 minutes until crust is golden and cheese is bubbly. Top with fresh basil.' }
    ]
  },
  {
    id: 'dummyjson-4',
    name: 'Chicken Alfredo Pasta',
    title: 'Chicken Alfredo Pasta',
    subtitle: 'Fettuccine in a rich garlic parmesan cream sauce with seared chicken breast.',
    description: 'Rich, luxurious Italian comfort food. Al dente fettuccine tossed in a velvety reduction of heavy cream, garlic butter, and Parmigiano-Reggiano with tender seared chicken breast.',
    image: 'https://cdn.dummyjson.com/recipe-images/4.webp',
    imageUrl: 'https://cdn.dummyjson.com/recipe-images/4.webp',
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    cookingTime: 35,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Italian',
    calories: 520,
    proteinGrams: 38,
    carbsGrams: 48,
    fatGrams: 22,
    rating: 4.8,
    reviewCount: 142,
    featured: true,
    tags: ['High-Protein', 'Comfort Food'],
    dietaryTags: ['High-Protein', 'Comfort Food'],
    source: 'dummyjson',
    sourceUrl: 'https://dummyjson.com/recipes/4',
    ingredients: [
      { name: 'Fettuccine pasta', amount: '300g', inPantry: true },
      { name: 'Chicken breast', amount: '2 breasts sliced', inPantry: true },
      { name: 'Heavy cream', amount: '1 cup', inPantry: true },
      { name: 'Parmesan cheese', amount: '1/2 cup grated', inPantry: true },
      { name: 'Garlic', amount: '3 cloves minced', inPantry: true },
      { name: 'Butter', amount: '2 tbsp', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Cook Pasta', instruction: 'Boil fettuccine in salted water until al dente; drain and set aside.' },
      { step: 2, title: 'Sear Chicken', instruction: 'Sear sliced chicken breast in butter until golden brown and cooked through; remove.' },
      { step: 3, title: 'Cream Sauce & Toss', instruction: 'Sauté garlic in pan, pour in heavy cream and parmesan. Simmer 3 minutes, then toss pasta and chicken in sauce.' }
    ]
  },
  {
    id: 'dummyjson-11',
    name: 'Chicken Biryani',
    title: 'Chicken Biryani',
    subtitle: 'Fragrant basmati rice layered with spiced marinated chicken, saffron, and fried onions.',
    description: 'A celebrated royal dish. Fluffy aged basmati rice infused with whole spices and saffron, layered over succulent marinated chicken cooked to aromatic perfection.',
    image: 'https://cdn.dummyjson.com/recipe-images/11.webp',
    imageUrl: 'https://cdn.dummyjson.com/recipe-images/11.webp',
    prepTimeMinutes: 30,
    cookTimeMinutes: 45,
    cookingTime: 75,
    servings: 6,
    difficulty: 'Medium',
    cuisine: 'Pakistani / Indian',
    calories: 550,
    proteinGrams: 32,
    carbsGrams: 64,
    fatGrams: 16,
    rating: 4.9,
    reviewCount: 220,
    featured: true,
    tags: ['High-Protein', 'Comfort Food', 'Balanced Meals'],
    dietaryTags: ['High-Protein', 'Comfort Food', 'Balanced Meals'],
    source: 'dummyjson',
    sourceUrl: 'https://dummyjson.com/recipes/11',
    ingredients: [
      { name: 'Basmati rice', amount: '2.5 cups', inPantry: true },
      { name: 'Chicken', amount: '600g bone-in', inPantry: true },
      { name: 'Yogurt', amount: '1/2 cup', inPantry: false },
      { name: 'Onions', amount: '2 large sliced', inPantry: true },
      { name: 'Biryani spices', amount: '2 tbsp', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Marinate Chicken', instruction: 'Marinate chicken in yogurt, ginger-garlic paste, and biryani spices for 30 minutes.' },
      { step: 2, title: 'Parboil Rice', instruction: 'Boil soaked basmati rice with whole spices until 70% cooked.' },
      { step: 3, title: 'Layer & Dum', instruction: 'Layer cooked chicken masala and rice in a pot, cover tightly, and steam on low for 25 minutes.' }
    ]
  },
  {
    id: 'dummyjson-16',
    name: 'Japanese Ramen Soup',
    title: 'Japanese Ramen Soup',
    image: 'https://cdn.dummyjson.com/recipe-images/16.webp',
    imageUrl: 'https://cdn.dummyjson.com/recipe-images/16.webp',
    subtitle: 'Noodles in savory soy-miso broth with soft-boiled egg, scallions, and nori.',
    description: 'Deeply comforting Japanese ramen bowl. Springy noodles in rich umami broth topped with jammy soft-boiled eggs, crisp green onions, and sesame oil.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    cookingTime: 35,
    servings: 2,
    difficulty: 'Medium',
    cuisine: 'Japanese',
    calories: 420,
    proteinGrams: 20,
    carbsGrams: 52,
    fatGrams: 14,
    rating: 4.8,
    reviewCount: 164,
    featured: false,
    tags: ['Comfort Food', 'High-Protein'],
    dietaryTags: ['Comfort Food', 'High-Protein'],
    source: 'dummyjson',
    sourceUrl: 'https://dummyjson.com/recipes/16',
    ingredients: [
      { name: 'Ramen noodles', amount: '2 packs', inPantry: true },
      { name: 'Broth', amount: '4 cups', inPantry: true },
      { name: 'Eggs', amount: '2 soft-boiled', inPantry: true },
      { name: 'Soy sauce', amount: '2 tbsp', inPantry: true },
      { name: 'Green onions', amount: '2 stalks', inPantry: false }
    ],
    instructions: [
      { step: 1, title: 'Simmer Broth', instruction: 'Heat broth with soy sauce, garlic, and ginger for 10 minutes.' },
      { step: 2, title: 'Boil Noodles', instruction: 'Cook ramen noodles for 3 minutes until al dente; drain into bowls.' },
      { step: 3, title: 'Assemble', instruction: 'Pour hot broth over noodles and garnish with halved soft-boiled eggs and green onions.' }
    ]
  },
  {
    id: 'dummyjson-20',
    name: 'Butter Chicken (Murgh Makhani)',
    title: 'Butter Chicken (Murgh Makhani)',
    image: 'https://cdn.dummyjson.com/recipe-images/20.webp',
    imageUrl: 'https://cdn.dummyjson.com/recipe-images/20.webp',
    subtitle: 'Tender chicken pieces in a mild spiced tomato butter and cream gravy.',
    description: 'An internationally beloved classic. Charred chicken pieces simmered in a silky tomato, cashew, and butter sauce scented with fenugreek.',
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    cookingTime: 45,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Pakistani / Indian',
    calories: 480,
    proteinGrams: 36,
    carbsGrams: 16,
    fatGrams: 28,
    rating: 4.9,
    reviewCount: 310,
    featured: true,
    tags: ['High-Protein', 'Comfort Food'],
    dietaryTags: ['High-Protein', 'Comfort Food'],
    source: 'dummyjson',
    sourceUrl: 'https://dummyjson.com/recipes/20',
    ingredients: [
      { name: 'Chicken breast', amount: '500g cubed', inPantry: true },
      { name: 'Tomato puree', amount: '2 cups', inPantry: true },
      { name: 'Butter', amount: '3 tbsp', inPantry: true },
      { name: 'Heavy cream', amount: '1/3 cup', inPantry: true },
      { name: 'Garam masala', amount: '1 tbsp', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Sear Chicken', instruction: 'Sear marinated chicken cubes in 1 tbsp butter for 6 minutes until lightly charred.' },
      { step: 2, title: 'Simmer Gravy', instruction: 'Melt remaining butter, add tomato puree and spices; simmer for 10 minutes.' },
      { step: 3, title: 'Finish with Cream', instruction: 'Fold in cream and cooked chicken. Simmer 5 minutes and serve with naan or rice.' }
    ]
  },
  {
    id: 'dummyjson-46',
    name: 'Pesto Pasta with Cherry Tomatoes',
    title: 'Pesto Pasta with Cherry Tomatoes',
    image: 'https://cdn.dummyjson.com/recipe-images/46.webp',
    imageUrl: 'https://cdn.dummyjson.com/recipe-images/46.webp',
    subtitle: 'Penne pasta tossed in aromatic basil pesto, sweet cherry tomatoes, and parmesan.',
    description: 'Bright, herbaceous weeknight pasta. Al dente penne coated in fragrant basil pine nut pesto, blistered sweet cherry tomatoes, and shaved parmesan.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    cookingTime: 22,
    servings: 3,
    difficulty: 'Easy',
    cuisine: 'Italian',
    calories: 410,
    proteinGrams: 14,
    carbsGrams: 56,
    fatGrams: 16,
    rating: 4.7,
    reviewCount: 112,
    featured: false,
    tags: ['Vegetarian', 'Quick & Easy'],
    dietaryTags: ['Vegetarian', 'Quick & Easy'],
    source: 'dummyjson',
    sourceUrl: 'https://dummyjson.com/recipes/46',
    ingredients: [
      { name: 'Pasta', amount: '250g', inPantry: true },
      { name: 'Basil pesto', amount: '1/2 cup', inPantry: false },
      { name: 'Cherry tomatoes', amount: '1 cup halved', inPantry: true },
      { name: 'Parmesan', amount: '1/4 cup grated', inPantry: true },
      { name: 'Olive oil', amount: '1 tbsp', inPantry: true }
    ],
    instructions: [
      { step: 1, title: 'Boil Pasta', instruction: 'Cook penne in boiling salted water until al dente; reserve 1/4 cup cooking water.' },
      { step: 2, title: 'Blister Tomatoes', instruction: 'Sauté cherry tomatoes in olive oil for 2 minutes until slightly softened.' },
      { step: 3, title: 'Toss Pesto', instruction: 'Remove from heat, toss pasta with pesto, blistered tomatoes, and parmesan.' }
    ]
  }
];

export const discoverRecipes = MOCK_RECIPES;

