import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CooklyAgent } from '../agents/cooklyAgent.js';
import { validateBody } from '../middleware/validate.js';
import type { ApiSuccessResponse } from '../models/api.model.js';
import type { AgentResponse } from '../models/agent.model.js';

export const agentRouter = Router();

const agentQuerySchema = z.object({
  prompt: z.string().optional().default(''),
  pantry: z.array(z.string()).optional(),
  filters: z.record(z.string(), z.any()).optional()
});

agentRouter.post(
  '/agent/query',
  validateBody(agentQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prompt, pantry, filters } = req.body;
      const result = await CooklyAgent.process(prompt, { pantry, filters });

      const response: ApiSuccessResponse<AgentResponse> = {
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
