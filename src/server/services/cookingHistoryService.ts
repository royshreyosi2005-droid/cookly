import { getDatabase } from '../db/database.js';
import type { UserCookingHistory } from '../models/user.model.js';

export class CookingHistoryService {
  public static getHistory(userId: string, limit: number = 50): UserCookingHistory[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM cooking_history WHERE user_id = ? ORDER BY cooked_at DESC LIMIT ?').all(userId, limit) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      recipeId: r.recipe_id,
      recipeName: r.recipe_name,
      recipeImage: r.recipe_image,
      servings: r.servings,
      rating: r.rating,
      source: r.source,
      cookedAt: r.cooked_at
    }));
  }

  public static recordCooking(userId: string, params: {
    recipeId: string;
    recipeName: string;
    recipeImage?: string;
    servings?: number;
    rating?: number;
    source?: string;
  }): UserCookingHistory {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = `his_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    db.prepare(`
      INSERT INTO cooking_history (id, user_id, recipe_id, recipe_name, recipe_image, servings, rating, source, cooked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      params.recipeId,
      params.recipeName,
      params.recipeImage || '',
      params.servings || 2,
      params.rating || 5,
      params.source || '',
      now
    );

    return {
      id,
      userId,
      recipeId: params.recipeId,
      recipeName: params.recipeName,
      recipeImage: params.recipeImage || '',
      servings: params.servings || 2,
      rating: params.rating || 5,
      source: params.source || '',
      cookedAt: now
    };
  }

  public static clearHistory(userId: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM cooking_history WHERE user_id = ?').run(userId);
    return result.changes > 0;
  }
}
