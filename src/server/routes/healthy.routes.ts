import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { HealthyRecipeService } from '../services/healthyRecipeService.js';
import { validateBody } from '../middleware/validate.js';
import type { ApiSuccessResponse } from '../models/api.model.js';
import type { NormalizedRecipe } from '../models/recipe.model.js';

export const healthyRouter = Router();

const healthySearchSchema = z.object({
  category: z.string().optional(),
  minProtein: z.number().nonnegative().optional(),
  minFiber: z.number().nonnegative().optional(),
  maxCalories: z.number().positive().optional(),
  maxCookTime: z.number().positive().optional(),
  query: z.string().optional()
});

healthyRouter.post(
  '/healthy/search',
  validateBody(healthySearchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await HealthyRecipeService.search(req.body);
      const response: ApiSuccessResponse<{ recipes: NormalizedRecipe[]; count: number }> = {
        success: true,
        data: result,
        meta: {
          total: result.count,
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
);
