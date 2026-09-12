import { Router } from 'express';
import { AuthService } from '../services/authService.js';
import { SignupSchema, LoginSchema } from '../models/user.model.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const authRouter = Router();

// POST /api/auth/signup
authRouter.post('/signup', async (req, res) => {
  try {
    const parseResult = SignupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: parseResult.error.issues[0]?.message || 'Invalid registration input'
        }
      });
      return;
    }

    const { user, preferences, token } = await AuthService.signup(parseResult.data);
    res.status(201).json({
      success: true,
      data: { user, preferences, token }
    });
  } catch (err: any) {
    if (err.message === 'EMAIL_EXISTS') {
      res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists'
        }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'Failed to create account'
      }
    });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: parseResult.error.issues[0]?.message || 'Invalid credentials'
        }
      });
      return;
    }

    const { user, preferences, token } = await AuthService.login(parseResult.data);
    res.status(200).json({
      success: true,
      data: { user, preferences, token }
    });
  } catch (err: any) {
    if (err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'Failed to authenticate'
      }
    });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const userWithStats = AuthService.getUserWithStats(userId);
    res.status(200).json({
      success: true,
      data: userWithStats
    });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User profile could not be found'
      }
    });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
});
