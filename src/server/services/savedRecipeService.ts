import { getDatabase } from '../db/database.js';
import type { UserSavedRecipe } from '../models/user.model.js';

export class SavedRecipeService {
  public static getSavedRecipes(userId: string): UserSavedRecipe[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM saved_recipes WHERE user_id = ? ORDER BY saved_at DESC').all(userId) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      recipeId: r.recipe_id,
      source: r.source,
      recipeTitle: r.recipe_title,
      recipeImage: r.recipe_image,
      recipeData: r.recipe_data ? JSON.parse(r.recipe_data) : undefined,
      savedAt: r.saved_at
    }));
  }

  public static saveRecipe(userId: string, params: {
    recipeId: string;
    recipeTitle: string;
    recipeImage?: string;
    source?: string;
    recipeData?: any;
  }): UserSavedRecipe {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = `sav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    db.prepare(`
      INSERT INTO saved_recipes (id, user_id, recipe_id, source, recipe_title, recipe_image, recipe_data, saved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, recipe_id) DO UPDATE SET
        recipe_title = excluded.recipe_title,
        recipe_image = excluded.recipe_image,
        recipe_data = excluded.recipe_data,
        saved_at = excluded.saved_at
    `).run(
      id,
      userId,
      params.recipeId,
      params.source || 'curated',
      params.recipeTitle,
      params.recipeImage || '',
      params.recipeData ? JSON.stringify(params.recipeData) : '{}',
      now
    );

    const row = db.prepare('SELECT * FROM saved_recipes WHERE user_id = ? AND recipe_id = ?').get(userId, params.recipeId) as any;

    return {
      id: row.id,
      userId: row.user_id,
      recipeId: row.recipe_id,
      source: row.source,
      recipeTitle: row.recipe_title,
      recipeImage: row.recipe_image,
      recipeData: row.recipe_data ? JSON.parse(row.recipe_data) : undefined,
      savedAt: row.saved_at
    };
  }

  public static removeSavedRecipe(userId: string, recipeId: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?').run(userId, recipeId);
    return result.changes > 0;
  }

  public static isSaved(userId: string, recipeId: string): boolean {
    const db = getDatabase();
    const row = db.prepare('SELECT id FROM saved_recipes WHERE user_id = ? AND recipe_id = ?').get(userId, recipeId);
    return Boolean(row);
  }
}
