import { Router } from 'express';
import { SavedRecipeService } from '../services/savedRecipeService.js';
import { SaveRecipeSchema } from '../models/user.model.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const savedRouter = Router();

savedRouter.use(requireAuth);

// GET /api/saved
savedRouter.get('/', (req: AuthenticatedRequest, res) => {
  try {
    const saved = SavedRecipeService.getSavedRecipes(req.userId!);
    res.status(200).json({
      success: true,
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: err.message || 'Failed to fetch saved recipes' }
    });
  }
});

// POST /api/saved
savedRouter.post('/', (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = SaveRecipeSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: parseResult.error.issues[0]?.message }
      });
      return;
    }

    const saved = SavedRecipeService.saveRecipe(req.userId!, parseResult.data);
    res.status(201).json({
      success: true,
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SAVE_FAILED', message: err.message || 'Failed to save recipe' }
    });
  }
});

// DELETE /api/saved/:recipeId
savedRouter.delete('/:recipeId', (req: AuthenticatedRequest, res) => {
  try {
    const removed = SavedRecipeService.removeSavedRecipe(req.userId!, req.params.recipeId as string);
    res.status(200).json({
      success: true,
      data: { removed }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_FAILED', message: err.message || 'Failed to remove saved recipe' }
    });
  }
});
