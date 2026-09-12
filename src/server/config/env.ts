import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  clientOrigin: string;
  cacheTtlSeconds: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  spoonacularApiKey?: string;
}

const parseNumber = (val: string | undefined, defaultVal: number): number => {
  if (!val) return defaultVal;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultVal : parsed;
};

export const config: ServerConfig = {
  port: parseNumber(process.env.PORT, 5000),
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  cacheTtlSeconds: parseNumber(process.env.CACHE_TTL_SECONDS, 300),
  rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  rateLimitMaxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  spoonacularApiKey: process.env.SPOONACULAR_API_KEY ? process.env.SPOONACULAR_API_KEY.trim() : undefined
};
