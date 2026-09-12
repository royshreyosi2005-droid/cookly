import { Router } from 'express';
import { CookingHistoryService } from '../services/cookingHistoryService.js';
import { AddHistorySchema } from '../models/user.model.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const historyRouter = Router();

historyRouter.use(requireAuth);

// GET /api/history
historyRouter.get('/', (req: AuthenticatedRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const history = CookingHistoryService.getHistory(req.userId!, limit);
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: err.message || 'Failed to load cooking history' }
    });
  }
});

// POST /api/history
historyRouter.post('/', (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = AddHistorySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: parseResult.error.issues[0]?.message }
      });
      return;
    }

    const item = CookingHistoryService.recordCooking(req.userId!, parseResult.data);
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'RECORD_FAILED', message: err.message || 'Failed to record cooking event' }
    });
  }
});

// DELETE /api/history
historyRouter.delete('/', (req: AuthenticatedRequest, res) => {
  try {
    const cleared = CookingHistoryService.clearHistory(req.userId!);
    res.status(200).json({
      success: true,
      data: { cleared }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CLEAR_FAILED', message: err.message || 'Failed to clear cooking history' }
    });
  }
});
