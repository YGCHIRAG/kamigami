const { redisClient } = require('../../db/redis');

const CACHE_PREFIX = 'product';
const DEFAULT_TTL = 300; // 5 minutes

exports.get = async (key) => {
  if (!redisClient.isOpen) return null;
  const data = await redisClient.get(`${CACHE_PREFIX}:${key}`);
  return data ? JSON.parse(data) : null;
};

exports.set = async (key, value, ttl = DEFAULT_TTL) => {
  if (!redisClient.isOpen) return;
  await redisClient.set(`${CACHE_PREFIX}:${key}`, JSON.stringify(value), {
    EX: ttl,
  });
};

exports.delete = async (key) => {
  if (!redisClient.isOpen) return;
  await redisClient.del(`${CACHE_PREFIX}:${key}`);
};

exports.clearListCache = async () => {
  if (!redisClient.isOpen) return;
  const keys = await redisClient.keys(`${CACHE_PREFIX}:list:*`);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

exports.invalidateProduct = async (slug) => {
  if (!redisClient.isOpen) return;
  await Promise.all([
    this.delete(slug),
    this.clearListCache(),
  ]);
};
