import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RecipeSearchService } from '../services/recipeSearchService.js';
import { RecipeDetailsService } from '../services/recipeDetailsService.js';
import { validateBody } from '../middleware/validate.js';
import type { ApiSuccessResponse } from '../models/api.model.js';
import type { NormalizedRecipe } from '../models/recipe.model.js';

export const recipeRouter = Router();

const searchSchema = z.object({
  query: z.string().optional(),
  cuisine: z.string().optional(),
  dietary: z.string().optional(),
  difficulty: z.string().optional(),
  mealType: z.string().optional(),
  sortBy: z.enum(['relevance', 'time', 'calories', 'rating']).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional()
});

recipeRouter.post(
  '/recipes/search',
  validateBody(searchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RecipeSearchService.search(req.body);
      const response: ApiSuccessResponse<{ recipes: NormalizedRecipe[]; total: number }> = {
        success: true,
        data: result,
        meta: {
          total: result.total,
          limit: req.body.limit || 50,
          offset: req.body.offset || 0,
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
);

recipeRouter.get(
  '/recipes/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;
      const recipe = await RecipeDetailsService.getById(id);
      const response: ApiSuccessResponse<NormalizedRecipe> = {
        success: true,
        data: recipe,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
);
