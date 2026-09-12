export interface AIChefRecipeImageMapping {
  id: string;
  name: string;
  image: string;
}

export const aiChefRecipes: AIChefRecipeImageMapping[] = [
  {
    id: 'ai-recipe-1',
    name: 'High-Protein Egg Potato Bowl',
    image: '/images/ai-chef/ai_egg_potato_bowl.jpg'
  },
  {
    id: 'ai-recipe-2',
    name: '20-Min Golden Egg & Jeera Rice Skillet',
    image: '/images/ai-chef/ai_egg_jeera_rice_skillet.jpg'
  },
  {
    id: 'ai-recipe-3',
    name: 'Quick Dhaba-Style Aloo Jeera',
    image: '/images/ai-chef/ai_dhaba_aloo_jeera.jpg'
  },
  {
    id: 'ai-recipe-4',
    name: 'Seared Lemon Garlic Pepper Chicken',
    image: '/images/ai-chef/ai_lemon_garlic_pepper_chicken.jpg'
  }
];

export function getAIChefRecipeImage(recipeId: string): string {
  const match = aiChefRecipes.find((r) => r.id === recipeId);
  return match?.image || '/images/ai-chef/ai_egg_potato_bowl.jpg';
}
