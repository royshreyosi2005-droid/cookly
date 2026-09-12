import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../db/database.js';
import { JWT_SECRET } from '../middleware/auth.middleware.js';
import type { User, UserPreferences } from '../models/user.model.js';

const SALT_ROUNDS = 10;

export interface AuthResult {
  user: Omit<User, 'passwordHash'>;
  preferences: UserPreferences;
  token: string;
}

export class AuthService {
  public static async signup(params: { name: string; email: string; password: string }): Promise<AuthResult> {
    const db = getDatabase();
    const email = params.email.toLowerCase().trim();

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined;
    if (existing) {
      throw new Error('EMAIL_EXISTS');
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);
    const now = new Date().toISOString();
    const avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`;

    const defaultFoodPrefs = JSON.stringify(['High-protein', 'Quick Meals', 'Balanced', 'Comfort Food']);
    const defaultDietaryPrefs = JSON.stringify(['Dairy-Free', 'High-Protein']);
    const defaultNutritionGoals = JSON.stringify(['High Protein (25g+/meal)', 'High Fiber (6g+/meal)', 'Calorie Smart (<450 kcal)']);
    const defaultAllergies = JSON.stringify(['Peanuts', 'Excess Sodium']);

    const transaction = db.transaction(() => {
      // 1. Insert User
      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, avatar_url, bio, skill_level, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        params.name.trim(),
        email,
        passwordHash,
        avatarUrl,
        'Home chef & nutrition enthusiast. Passionate about quick, wholesome dinners.',
        'Intermediate',
        now,
        now
      );

      // 2. Insert Default User Preferences
      db.prepare(`
        INSERT INTO user_preferences (
          user_id, food_preferences, dietary_preferences, nutrition_goals, allergies,
          foods_to_avoid, cooking_skill, preferred_cuisines, preferred_meal_types,
          default_servings, max_cook_time_minutes, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        defaultFoodPrefs,
        defaultDietaryPrefs,
        defaultNutritionGoals,
        defaultAllergies,
        '[]',
        'Intermediate',
        JSON.stringify(['Indian', 'Italian', 'Asian', 'Mediterranean']),
        JSON.stringify(['Dinner', 'Lunch', 'Breakfast']),
        2,
        30,
        now
      );
    });

    transaction();

    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

    const user: Omit<User, 'passwordHash'> = {
      id: userId,
      name: params.name.trim(),
      email,
      avatarUrl,
      bio: 'Home chef & nutrition enthusiast. Passionate about quick, wholesome dinners.',
      skillLevel: 'Intermediate',
      createdAt: now,
      updatedAt: now
    };

    const preferences: UserPreferences = {
      userId,
      foodPreferences: JSON.parse(defaultFoodPrefs),
      dietaryPreferences: JSON.parse(defaultDietaryPrefs),
      nutritionGoals: JSON.parse(defaultNutritionGoals),
      allergies: JSON.parse(defaultAllergies),
      foodsToAvoid: [],
      cookingSkill: 'Intermediate',
      preferredCuisines: ['Indian', 'Italian', 'Asian', 'Mediterranean'],
      preferredMealTypes: ['Dinner', 'Lunch', 'Breakfast'],
      defaultServings: 2,
      maxCookTimeMinutes: 30,
      updatedAt: now
    };

    return { user, preferences, token };
  }

  public static async login(params: { email: string; password: string }): Promise<AuthResult> {
    const db = getDatabase();
    const email = params.email.toLowerCase().trim();

    const rawUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!rawUser) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(params.password, rawUser.password_hash);
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const rawPrefs = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(rawUser.id) as any;

    const user: Omit<User, 'passwordHash'> = {
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
      avatarUrl: rawUser.avatar_url || '',
      bio: rawUser.bio || '',
      skillLevel: rawUser.skill_level || 'Intermediate',
      createdAt: rawUser.created_at,
      updatedAt: rawUser.updated_at
    };

    const preferences: UserPreferences = rawPrefs ? {
      userId: rawPrefs.user_id,
      foodPreferences: JSON.parse(rawPrefs.food_preferences || '[]'),
      dietaryPreferences: JSON.parse(rawPrefs.dietary_preferences || '[]'),
      nutritionGoals: JSON.parse(rawPrefs.nutrition_goals || '[]'),
      allergies: JSON.parse(rawPrefs.allergies || '[]'),
      foodsToAvoid: JSON.parse(rawPrefs.foods_to_avoid || '[]'),
      cookingSkill: rawPrefs.cooking_skill || 'Intermediate',
      preferredCuisines: JSON.parse(rawPrefs.preferred_cuisines || '[]'),
      preferredMealTypes: JSON.parse(rawPrefs.preferred_meal_types || '[]'),
      defaultServings: rawPrefs.default_servings || 2,
      maxCookTimeMinutes: rawPrefs.max_cook_time_minutes || 30,
      updatedAt: rawPrefs.updated_at
    } : {
      userId: rawUser.id,
      foodPreferences: [],
      dietaryPreferences: [],
      nutritionGoals: [],
      allergies: [],
      foodsToAvoid: [],
      cookingSkill: 'Intermediate',
      preferredCuisines: [],
      preferredMealTypes: [],
      defaultServings: 2,
      maxCookTimeMinutes: 30,
      updatedAt: new Date().toISOString()
    };

    const token = jwt.sign({ userId: rawUser.id, email }, JWT_SECRET, { expiresIn: '7d' });

    return { user, preferences, token };
  }

  public static getUserWithStats(userId: string): {
    user: Omit<User, 'passwordHash'>;
    preferences: UserPreferences;
    stats: {
      savedCount: number;
      pantryCount: number;
      shoppingListCount: number;
      cookingHistoryCount: number;
    };
  } {
    const db = getDatabase();

    const rawUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!rawUser) {
      throw new Error('USER_NOT_FOUND');
    }

    const rawPrefs = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(userId) as any;

    const savedCount = (db.prepare('SELECT COUNT(*) as count FROM saved_recipes WHERE user_id = ?').get(userId) as any)?.count || 0;
    const pantryCount = (db.prepare('SELECT COUNT(*) as count FROM pantry_items WHERE user_id = ?').get(userId) as any)?.count || 0;
    const shoppingListCount = (db.prepare('SELECT COUNT(*) as count FROM shopping_list_items WHERE user_id = ? AND checked = 0').get(userId) as any)?.count || 0;
    const cookingHistoryCount = (db.prepare('SELECT COUNT(*) as count FROM cooking_history WHERE user_id = ?').get(userId) as any)?.count || 0;

    const user: Omit<User, 'passwordHash'> = {
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
      avatarUrl: rawUser.avatar_url || '',
      bio: rawUser.bio || '',
      skillLevel: rawUser.skill_level || 'Intermediate',
      createdAt: rawUser.created_at,
      updatedAt: rawUser.updated_at
    };

    const preferences: UserPreferences = rawPrefs ? {
      userId: rawPrefs.user_id,
      foodPreferences: JSON.parse(rawPrefs.food_preferences || '[]'),
      dietaryPreferences: JSON.parse(rawPrefs.dietary_preferences || '[]'),
      nutritionGoals: JSON.parse(rawPrefs.nutrition_goals || '[]'),
      allergies: JSON.parse(rawPrefs.allergies || '[]'),
      foodsToAvoid: JSON.parse(rawPrefs.foods_to_avoid || '[]'),
      cookingSkill: rawPrefs.cooking_skill || 'Intermediate',
      preferredCuisines: JSON.parse(rawPrefs.preferred_cuisines || '[]'),
      preferredMealTypes: JSON.parse(rawPrefs.preferred_meal_types || '[]'),
      defaultServings: rawPrefs.default_servings || 2,
      maxCookTimeMinutes: rawPrefs.max_cook_time_minutes || 30,
      updatedAt: rawPrefs.updated_at
    } : {
      userId: rawUser.id,
      foodPreferences: [],
      dietaryPreferences: [],
      nutritionGoals: [],
      allergies: [],
      foodsToAvoid: [],
      cookingSkill: 'Intermediate',
      preferredCuisines: [],
      preferredMealTypes: [],
      defaultServings: 2,
      maxCookTimeMinutes: 30,
      updatedAt: new Date().toISOString()
    };

    return {
      user,
      preferences,
      stats: {
        savedCount,
        pantryCount,
        shoppingListCount,
        cookingHistoryCount
      }
    };
  }
}
