import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { recipeRouter } from './recipe.routes.js';
import { pantryRouter } from './pantry.routes.js';
import { healthyRouter } from './healthy.routes.js';
import { aiChefRouter } from './aiChef.routes.js';
import { agentRouter } from './agent.routes.js';
import { authRouter } from './auth.routes.js';
import { profileRouter } from './profile.routes.js';
import { userPantryRouter } from './userPantry.routes.js';
import { savedRouter } from './saved.routes.js';
import { shoppingRouter } from './shopping.routes.js';
import { historyRouter } from './history.routes.js';

export const apiRouter = Router();

// Mount all API route sub-routers under /api
apiRouter.use(healthRouter);
apiRouter.use(recipeRouter);
apiRouter.use(pantryRouter);
apiRouter.use(healthyRouter);
apiRouter.use(aiChefRouter);
apiRouter.use(agentRouter);

// Persistent User Data & Authentication Routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/user-pantry', userPantryRouter);
apiRouter.use('/saved', savedRouter);
apiRouter.use('/shopping-list', shoppingRouter);
apiRouter.use('/history', historyRouter);


