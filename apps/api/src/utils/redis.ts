import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

class CacheClient {
  private client: Redis;

  constructor() {
    this.client = new Redis(config.redis.url, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
    });

    this.client.on('error', (err) => {
      logger.warn('Redis connection error — caching disabled', { error: err.message });
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch {
      // Silently fail — cache is best-effort
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      // no-op
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) await this.client.del(...keys);
    } catch {
      // no-op
    }
  }
}

export const cache = new CacheClient();