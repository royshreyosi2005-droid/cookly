import { Router } from 'express';
import { ProfileService } from '../services/profileService.js';
import { UpdateProfileSchema, UpdatePreferencesSchema } from '../models/user.model.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const profileRouter = Router();

// All profile endpoints require authentication
profileRouter.use(requireAuth);

// PUT /api/profile
profileRouter.put('/', (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = UpdateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: parseResult.error.issues[0]?.message || 'Invalid profile updates'
        }
      });
      return;
    }

    const updated = ProfileService.updateProfile(req.userId!, parseResult.data as any);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: err.message || 'Failed to update user profile'
      }
    });
  }
});

// GET /api/profile/preferences
profileRouter.get('/preferences', (req: AuthenticatedRequest, res) => {
  try {
    const preferences = ProfileService.getPreferences(req.userId!);
    res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: err.message || 'Failed to fetch preferences'
      }
    });
  }
});

// PUT /api/profile/preferences
profileRouter.put('/preferences', (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = UpdatePreferencesSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: parseResult.error.issues[0]?.message || 'Invalid preferences data'
        }
      });
      return;
    }

    const updated = ProfileService.updatePreferences(req.userId!, parseResult.data);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: err.message || 'Failed to update preferences'
      }
    });
  }
});
