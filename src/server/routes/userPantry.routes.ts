import { Router } from 'express';
import { UserPantryService } from '../services/userPantryService.js';
import { AddPantryItemSchema, BatchAddPantrySchema } from '../models/user.model.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const userPantryRouter = Router();

userPantryRouter.use(requireAuth);

// GET /api/user-pantry
userPantryRouter.get('/', (req: AuthenticatedRequest, res) => {
  try {
    const items = UserPantryService.getPantry(req.userId!);
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: err.message || 'Failed to load pantry' }
    });
  }
});

// POST /api/user-pantry
userPantryRouter.post('/', (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = AddPantryItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: parseResult.error.issues[0]?.message }
      });
      return;
    }

    const item = UserPantryService.addOrUpdateItem(req.userId!, parseResult.data);
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ADD_FAILED', message: err.message || 'Failed to add pantry item' }
    });
  }
});

// POST /api/user-pantry/batch
userPantryRouter.post('/batch', (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = BatchAddPantrySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: parseResult.error.issues[0]?.message }
      });
      return;
    }

    const items = UserPantryService.batchAddItems(req.userId!, parseResult.data.ingredients);
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'BATCH_ADD_FAILED', message: err.message || 'Failed to add items' }
    });
  }
});

// DELETE /api/user-pantry/:ingredient
userPantryRouter.delete('/:ingredient', (req: AuthenticatedRequest, res) => {
  try {
    const removed = UserPantryService.removeItem(req.userId!, req.params.ingredient as string);
    res.status(200).json({
      success: true,
      data: { removed }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: err.message || 'Failed to remove item' }
    });
  }
});

// DELETE /api/user-pantry
userPantryRouter.delete('/', (req: AuthenticatedRequest, res) => {
  try {
    const cleared = UserPantryService.clearPantry(req.userId!);
    res.status(200).json({
      success: true,
      data: { cleared }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CLEAR_FAILED', message: err.message || 'Failed to clear pantry' }
    });
  }
});
