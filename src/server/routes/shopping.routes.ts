import { Router } from 'express';
import { ShoppingListService } from '../services/shoppingListService.js';
import { AddShoppingItemSchema, BatchAddShoppingSchema } from '../models/user.model.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const shoppingRouter = Router();

shoppingRouter.use(requireAuth);

// GET /api/shopping-list
shoppingRouter.get('/', (req: AuthenticatedRequest, res) => {
  try {
    const list = ShoppingListService.getShoppingList(req.userId!);
    res.status(200).json({
      success: true,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: err.message || 'Failed to load shopping list' }
    });
  }
});

// POST /api/shopping-list
shoppingRouter.post('/', (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = AddShoppingItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: parseResult.error.issues[0]?.message }
      });
      return;
    }

    const item = ShoppingListService.addItem(req.userId!, parseResult.data);
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ADD_FAILED', message: err.message || 'Failed to add item' }
    });
  }
});

// POST /api/shopping-list/batch
shoppingRouter.post('/batch', (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = BatchAddShoppingSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: parseResult.error.issues[0]?.message }
      });
      return;
    }

    const list = ShoppingListService.batchAddItems(req.userId!, parseResult.data.items);
    res.status(200).json({
      success: true,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'BATCH_ADD_FAILED', message: err.message || 'Failed to add items' }
    });
  }
});

// PATCH /api/shopping-list/:id/toggle
shoppingRouter.patch('/:id/toggle', (req: AuthenticatedRequest, res) => {
  try {
    const item = ShoppingListService.toggleCheck(req.userId!, req.params.id as string);
    if (!item) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Item not found' }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'TOGGLE_FAILED', message: err.message || 'Failed to update item' }
    });
  }
});

// DELETE /api/shopping-list/completed
shoppingRouter.delete('/completed', (req: AuthenticatedRequest, res) => {
  try {
    const clearedCount = ShoppingListService.clearCompleted(req.userId!);
    res.status(200).json({
      success: true,
      data: { clearedCount }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CLEAR_FAILED', message: err.message || 'Failed to clear completed items' }
    });
  }
});

// DELETE /api/shopping-list/:id
shoppingRouter.delete('/:id', (req: AuthenticatedRequest, res) => {
  try {
    const deleted = ShoppingListService.deleteItem(req.userId!, req.params.id as string);
    res.status(200).json({
      success: true,
      data: { deleted }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: err.message || 'Failed to delete item' }
    });
  }
});

// DELETE /api/shopping-list
shoppingRouter.delete('/', (req: AuthenticatedRequest, res) => {
  try {
    const clearedCount = ShoppingListService.clearAll(req.userId!);
    res.status(200).json({
      success: true,
      data: { clearedCount }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CLEAR_FAILED', message: err.message || 'Failed to clear shopping list' }
    });
  }
});
