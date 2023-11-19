const { LRUCache } = require('lru-cache')
const Redis = require("ioredis");
// 缓存
class CacheStore {
  constructor() {
    this.stores = [];
  }
  add(store) {
    this.stores.push(store);
    return this;
  }
  async get(key) {
    for (const store of this.stores) {
      const value = await store.get(key);
      if (value !== undefined) {
        return value;
      }
    }
  }
  async set(key, value) {
    for (const store of this.stores) {
      await store.set(key, value);
    }
  }
}
// 内存
class MemoryStore {
  constructor() {
    this.cache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60 * 24,
    });
  }
  async get(key) {
    return this.cache.get(key);
  }
  async set(key, value) {
    this.cache.set(key, value);
  }
}
// redis缓存
class RedisStore {
  constructor(options) {
    this.client = new Redis(options);
  }
  async get(key) {
    let value = await this.client.get(key);
    return value ? JSON.parse(value) : undefined;
  }
  async set(key, value) {
    await this.client.set(key, JSON.stringify(value));
  }
}
const cacheMiddleware = (options = {}) => {
  return async function (ctx, next) {
    const cacheStore = new CacheStore();
    cacheStore.add(new MemoryStore());
    const redisStore = new RedisStore(options);
    cacheStore.add(redisStore);
    ctx.cache = cacheStore;
    await next();
  };
};
module.exports = cacheMiddleware;