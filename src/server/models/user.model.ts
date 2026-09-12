import { z } from 'zod';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  avatarUrl: string;
  bio: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Pro Home Cook';
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;
  foodPreferences: string[];
  dietaryPreferences: string[];
  nutritionGoals: string[];
  allergies: string[];
  foodsToAvoid: string[];
  cookingSkill: string;
  preferredCuisines: string[];
  preferredMealTypes: string[];
  defaultServings: number;
  maxCookTimeMinutes: number;
  updatedAt: string;
}

export interface UserSavedRecipe {
  id: string;
  userId: string;
  recipeId: string;
  source: string;
  recipeTitle: string;
  recipeImage: string;
  recipeData?: any;
  savedAt: string;
}

export interface UserPantryItem {
  id: string;
  userId: string;
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserShoppingItem {
  id: string;
  userId: string;
  name: string;
  amount: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
  recipeSource?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCookingHistory {
  id: string;
  userId: string;
  recipeId: string;
  recipeName: string;
  recipeImage: string;
  servings: number;
  rating: number;
  source: string;
  cookedAt: string;
}

// Zod Schemas for Request Validation
export const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100)
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
  bio: z.string().max(300).optional(),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Pro Home Cook']).optional(),
  defaultServings: z.number().int().min(1).max(20).optional(),
  maxCookTimeMinutes: z.number().int().min(5).max(180).optional()
});

export const UpdatePreferencesSchema = z.object({
  foodPreferences: z.array(z.string()).optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  nutritionGoals: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  foodsToAvoid: z.array(z.string()).optional(),
  cookingSkill: z.string().optional(),
  preferredCuisines: z.array(z.string()).optional(),
  preferredMealTypes: z.array(z.string()).optional(),
  defaultServings: z.number().int().min(1).max(20).optional(),
  maxCookTimeMinutes: z.number().int().min(5).max(180).optional()
});

export const AddPantryItemSchema = z.object({
  ingredient: z.string().min(1, 'Ingredient name is required'),
  quantity: z.number().optional().default(1),
  unit: z.string().optional().default(''),
  category: z.string().optional().default('Pantry')
});

export const BatchAddPantrySchema = z.object({
  ingredients: z.array(z.string()).min(1, 'At least one ingredient required')
});

export const SaveRecipeSchema = z.object({
  recipeId: z.string().min(1, 'recipeId is required'),
  recipeTitle: z.string().min(1, 'recipeTitle is required'),
  recipeImage: z.string().optional().default(''),
  source: z.string().optional().default('curated'),
  recipeData: z.any().optional()
});

export const AddShoppingItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.string().optional().default('1 portion'),
  quantity: z.number().optional().default(1),
  unit: z.string().optional().default(''),
  category: z.string().optional().default('General'),
  recipeSource: z.string().optional()
});

export const BatchAddShoppingSchema = z.object({
  items: z.array(z.object({
    name: z.string().min(1),
    amount: z.string().optional(),
    quantity: z.number().optional(),
    unit: z.string().optional(),
    category: z.string().optional(),
    recipeSource: z.string().optional()
  })).min(1)
});

export const AddHistorySchema = z.object({
  recipeId: z.string().min(1),
  recipeName: z.string().min(1),
  recipeImage: z.string().optional().default(''),
  servings: z.number().int().min(1).default(2),
  rating: z.number().int().min(1).max(5).default(5),
  source: z.string().optional().default('')
});
