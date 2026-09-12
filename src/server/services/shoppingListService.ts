import { getDatabase } from '../db/database.js';
import type { UserShoppingItem } from '../models/user.model.js';

export class ShoppingListService {
  public static getShoppingList(userId: string): UserShoppingItem[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM shopping_list_items WHERE user_id = ? ORDER BY checked ASC, created_at DESC').all(userId) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      amount: r.amount,
      quantity: r.quantity,
      unit: r.unit,
      category: r.category,
      checked: Boolean(r.checked),
      recipeSource: r.recipe_source || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  public static addItem(userId: string, params: {
    name: string;
    amount?: string;
    quantity?: number;
    unit?: string;
    category?: string;
    recipeSource?: string;
  }): UserShoppingItem {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = `shp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const formattedName = params.name.trim().charAt(0).toUpperCase() + params.name.trim().slice(1);

    db.prepare(`
      INSERT INTO shopping_list_items (id, user_id, name, amount, quantity, unit, category, checked, recipe_source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      formattedName,
      params.amount || '1 portion',
      params.quantity || 1,
      params.unit || '',
      params.category || 'General',
      0,
      params.recipeSource || '',
      now,
      now
    );

    const row = db.prepare('SELECT * FROM shopping_list_items WHERE id = ?').get(id) as any;

    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      amount: row.amount,
      quantity: row.quantity,
      unit: row.unit,
      category: row.category,
      checked: Boolean(row.checked),
      recipeSource: row.recipe_source || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  public static batchAddItems(userId: string, items: Array<{
    name: string;
    amount?: string;
    quantity?: number;
    unit?: string;
    category?: string;
    recipeSource?: string;
  }>): UserShoppingItem[] {
    const db = getDatabase();
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO shopping_list_items (id, user_id, name, amount, quantity, unit, category, checked, recipe_source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      for (const item of items) {
        const trimmed = item.name.trim();
        if (trimmed) {
          const formattedName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
          const id = `shp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          insertStmt.run(
            id,
            userId,
            formattedName,
            item.amount || '1 portion',
            item.quantity || 1,
            item.unit || '',
            item.category || 'General',
            0,
            item.recipeSource || '',
            now,
            now
          );
        }
      }
    });

    transaction();

    return this.getShoppingList(userId);
  }

  public static toggleCheck(userId: string, itemId: string): UserShoppingItem | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM shopping_list_items WHERE id = ? AND user_id = ?').get(itemId, userId) as any;
    if (!row) return null;

    const newChecked = row.checked ? 0 : 1;
    const now = new Date().toISOString();

    db.prepare('UPDATE shopping_list_items SET checked = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(
      newChecked,
      now,
      itemId,
      userId
    );

    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      amount: row.amount,
      quantity: row.quantity,
      unit: row.unit,
      category: row.category,
      checked: Boolean(newChecked),
      recipeSource: row.recipe_source || undefined,
      createdAt: row.created_at,
      updatedAt: now
    };
  }

  public static deleteItem(userId: string, itemId: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM shopping_list_items WHERE id = ? AND user_id = ?').run(itemId, userId);
    return result.changes > 0;
  }

  public static clearCompleted(userId: string): number {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM shopping_list_items WHERE user_id = ? AND checked = 1').run(userId);
    return result.changes;
  }

  public static clearAll(userId: string): number {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM shopping_list_items WHERE user_id = ?').run(userId);
    return result.changes;
  }
}
