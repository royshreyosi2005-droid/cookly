import { CompositeRecipeProvider } from './compositeRecipeProvider.js';

export const defaultRecipeProvider = new CompositeRecipeProvider();
export * from './recipeProvider.interface.js';
export * from './spoonacularProvider.js';
export * from './mealDbProvider.js';
export * from './dummyJsonProvider.js';
export * from './compositeRecipeProvider.js';
