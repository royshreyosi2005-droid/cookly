import { getDatabase } from '../db/database.js';
import type { User, UserPreferences } from '../models/user.model.js';

export class ProfileService {
  public static updateProfile(userId: string, updates: Partial<User>): Omit<User, 'passwordHash'> {
    const db = getDatabase();
    const now = new Date().toISOString();

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name.trim());
    }
    if (updates.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(updates.avatarUrl);
    }
    if (updates.bio !== undefined) {
      fields.push('bio = ?');
      values.push(updates.bio.trim());
    }
    if (updates.skillLevel !== undefined) {
      fields.push('skill_level = ?');
      values.push(updates.skillLevel);
    }

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(now);
      values.push(userId);

      db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    const raw = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!raw) throw new Error('USER_NOT_FOUND');

    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      avatarUrl: raw.avatar_url || '',
      bio: raw.bio || '',
      skillLevel: raw.skill_level || 'Intermediate',
      createdAt: raw.created_at,
      updatedAt: raw.updated_at
    };
  }

  public static getPreferences(userId: string): UserPreferences {
    const db = getDatabase();
    const raw = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(userId) as any;

    if (!raw) {
      return {
        userId,
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
    }

    return {
      userId: raw.user_id,
      foodPreferences: JSON.parse(raw.food_preferences || '[]'),
      dietaryPreferences: JSON.parse(raw.dietary_preferences || '[]'),
      nutritionGoals: JSON.parse(raw.nutrition_goals || '[]'),
      allergies: JSON.parse(raw.allergies || '[]'),
      foodsToAvoid: JSON.parse(raw.foods_to_avoid || '[]'),
      cookingSkill: raw.cooking_skill || 'Intermediate',
      preferredCuisines: JSON.parse(raw.preferred_cuisines || '[]'),
      preferredMealTypes: JSON.parse(raw.preferred_meal_types || '[]'),
      defaultServings: raw.default_servings || 2,
      maxCookTimeMinutes: raw.max_cook_time_minutes || 30,
      updatedAt: raw.updated_at
    };
  }

  public static updatePreferences(userId: string, updates: Partial<UserPreferences>): UserPreferences {
    const db = getDatabase();
    const current = this.getPreferences(userId);
    const now = new Date().toISOString();

    const merged: UserPreferences = {
      ...current,
      ...updates,
      userId,
      updatedAt: now
    };

    db.prepare(`
      INSERT INTO user_preferences (
        user_id, food_preferences, dietary_preferences, nutrition_goals, allergies,
        foods_to_avoid, cooking_skill, preferred_cuisines, preferred_meal_types,
        default_servings, max_cook_time_minutes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        food_preferences = excluded.food_preferences,
        dietary_preferences = excluded.dietary_preferences,
        nutrition_goals = excluded.nutrition_goals,
        allergies = excluded.allergies,
        foods_to_avoid = excluded.foods_to_avoid,
        cooking_skill = excluded.cooking_skill,
        preferred_cuisines = excluded.preferred_cuisines,
        preferred_meal_types = excluded.preferred_meal_types,
        default_servings = excluded.default_servings,
        max_cook_time_minutes = excluded.max_cook_time_minutes,
        updated_at = excluded.updated_at
    `).run(
      userId,
      JSON.stringify(merged.foodPreferences || []),
      JSON.stringify(merged.dietaryPreferences || []),
      JSON.stringify(merged.nutritionGoals || []),
      JSON.stringify(merged.allergies || []),
      JSON.stringify(merged.foodsToAvoid || []),
      merged.cookingSkill || 'Intermediate',
      JSON.stringify(merged.preferredCuisines || []),
      JSON.stringify(merged.preferredMealTypes || []),
      merged.defaultServings || 2,
      merged.maxCookTimeMinutes || 30,
      now
    );

    return merged;
  }
}
