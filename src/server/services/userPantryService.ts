import { getDatabase } from '../db/database.js';
import type { UserPantryItem } from '../models/user.model.js';

export class UserPantryService {
  public static getPantry(userId: string): UserPantryItem[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM pantry_items WHERE user_id = ? ORDER BY ingredient ASC').all(userId) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      ingredient: r.ingredient,
      quantity: r.quantity,
      unit: r.unit,
      category: r.category,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  public static addOrUpdateItem(userId: string, params: {
    ingredient: string;
    quantity?: number;
    unit?: string;
    category?: string;
  }): UserPantryItem {
    const db = getDatabase();
    const formatted = params.ingredient.trim().charAt(0).toUpperCase() + params.ingredient.trim().slice(1);
    const now = new Date().toISOString();
    const id = `pnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    db.prepare(`
      INSERT INTO pantry_items (id, user_id, ingredient, quantity, unit, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, ingredient) DO UPDATE SET
        quantity = excluded.quantity,
        unit = excluded.unit,
        category = excluded.category,
        updated_at = excluded.updated_at
    `).run(
      id,
      userId,
      formatted,
      params.quantity || 1,
      params.unit || '',
      params.category || 'Pantry',
      now,
      now
    );

    const row = db.prepare('SELECT * FROM pantry_items WHERE user_id = ? AND ingredient = ?').get(userId, formatted) as any;

    return {
      id: row.id,
      userId: row.user_id,
      ingredient: row.ingredient,
      quantity: row.quantity,
      unit: row.unit,
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  public static batchAddItems(userId: string, ingredients: string[]): UserPantryItem[] {
    const db = getDatabase();
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO pantry_items (id, user_id, ingredient, quantity, unit, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, ingredient) DO UPDATE SET
        updated_at = excluded.updated_at
    `);

    const transaction = db.transaction(() => {
      for (const raw of ingredients) {
        const trimmed = raw.trim();
        if (trimmed) {
          const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
          const id = `pnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          insertStmt.run(id, userId, formatted, 1, '', 'Pantry', now, now);
        }
      }
    });

    transaction();

    return this.getPantry(userId);
  }

  public static removeItem(userId: string, ingredientOrId: string): boolean {
    const db = getDatabase();
    const result = db.prepare(`
      DELETE FROM pantry_items
      WHERE user_id = ? AND (id = ? OR LOWER(ingredient) = LOWER(?))
    `).run(userId, ingredientOrId, ingredientOrId);

    return result.changes > 0;
  }

  public static clearPantry(userId: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM pantry_items WHERE user_id = ?').run(userId);
    return result.changes > 0;
  }
}
