import { redis } from "./redis";

export class CacheService {

  async get(key: string) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttlSeconds = 60) {
    await redis.set(
      key,
      JSON.stringify(value),
      "EX",
      ttlSeconds
    );
  }

  async del(key: string) {
    await redis.del(key);
  }
}

export const cacheService = new CacheService();
