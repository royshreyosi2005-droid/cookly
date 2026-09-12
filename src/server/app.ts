import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const createApp = (): Express => {
  const app: Express = express();

  // Configure CORS
  const allowedOrigins = [
    config.clientOrigin,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000'
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        if (origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    })
  );

  // Body parser
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Basic request logger
  if (config.nodeEnv !== 'test') {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      const start = Date.now();
      _res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[HTTP] ${req.method} ${req.originalUrl} ${_res.statusCode} - ${duration}ms`);
      });
      next();
    });
  }

  // Mount API endpoints under /api
  app.use('/api', apiRouter);

  // Robust dist directory resolution for production
  const candidateDistDirs = [
    path.resolve(process.cwd(), 'dist'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
  ];
  const distPath = candidateDistDirs.find((dir) => fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) || candidateDistDirs[0];

  if (fs.existsSync(distPath)) {
    console.log(`[Static] Serving frontend static assets from: ${distPath}`);
    app.use(express.static(distPath));

    // SPA fallback for frontend client routing (e.g. /, /pantry, /ai-chef, /discover, /profile)
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
      }
      next();
    });
  } else {
    console.warn(`[Static Warning] dist directory not found at candidate paths. Run 'npm run build' to compile frontend.`);
  }

  // 404 Handler for unhandled API routes
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
