import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AIChefService } from '../services/aiChefService.js';
import { validateBody } from '../middleware/validate.js';
import type { ApiSuccessResponse } from '../models/api.model.js';
import type { AIChefMealSuggestion } from '../models/recipe.model.js';

export const aiChefRouter = Router();

const aiChefSchema = z.object({
  prompt: z.string().optional(),
  budget: z.number().int().positive().optional(),
  peopleCount: z.number().int().positive().max(20).optional(),
  maxCookTimeMinutes: z.number().int().positive().optional(),
  foodPreference: z.string().optional(),
  ingredients: z.array(z.string()).optional()
});

aiChefRouter.post(
  '/ai-chef',
  validateBody(aiChefSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AIChefService.generate(req.body);
      const response: ApiSuccessResponse<{
        query: string;
        suggestions: AIChefMealSuggestion[];
        budgetSummary: {
          totalBudget: number;
          peopleCount: number;
          budgetPerPerson: number;
        };
      }> = {
        success: true,
        data: result,
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
