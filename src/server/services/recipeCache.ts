import { config } from '../config/env.js';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class RecipeCache {
  private static store: Map<string, CacheEntry<any>> = new Map();

  public static get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  public static set<T>(key: string, data: T, ttlSeconds = config.cacheTtlSeconds): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { data, expiresAt });
  }

  public static clear(): void {
    this.store.clear();
  }
}
