import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PantryMatcher } from '../services/pantryMatcher.js';
import { validateBody } from '../middleware/validate.js';
import type { ApiSuccessResponse } from '../models/api.model.js';
import type { PantryMatchResult } from '../models/recipe.model.js';

export const pantryRouter = Router();

const pantryMatchSchema = z.object({
  ingredients: z.array(z.string()),
  searchMode: z.enum(['best_match', 'exact', 'single', 'multi']).optional(),
  sortBy: z.enum(['match', 'missing_least', 'time', 'protein', 'calories']).optional()
});

pantryRouter.post(
  '/pantry/match',
  validateBody(pantryMatchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await PantryMatcher.match(req.body);
      const response: ApiSuccessResponse<{
        recipes: PantryMatchResult[];
        exactCount: number;
        totalMatches: number;
      }> = {
        success: true,
        data: result,
        meta: {
          total: result.totalMatches,
          timestamp: new Date().toISOString()
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
);
