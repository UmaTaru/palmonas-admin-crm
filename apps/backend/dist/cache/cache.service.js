"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const redis_1 = require("./redis");
class CacheService {
    async get(key) {
        const data = await redis_1.redis.get(key);
        return data ? JSON.parse(data) : null;
    }
    async set(key, value, ttlSeconds = 60) {
        await redis_1.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    }
    async del(key) {
        await redis_1.redis.del(key);
    }
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
