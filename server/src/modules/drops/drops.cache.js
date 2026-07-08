const { redisClient } = require('../../db/redis');

const CACHE_PREFIX = 'drop';
const DEFAULT_TTL = 300; // 5 minutes

// Metadata Caching
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

// Real-time Drop Stock Management
const getStockKey = (dropId, variantId) => `${CACHE_PREFIX}:${dropId}:variant:${variantId}:stock`;

exports.loadDropStock = async (dropId, products) => {
  if (!redisClient.isOpen) return;

  const multi = redisClient.multi();
  
  for (const dp of products) {
    const allocations = dp.variantAllocations || {};
    for (const variant of dp.product.variants) {
      const key = getStockKey(dropId, variant.id);
      const allocatedStock = allocations[variant.id] || 0;
      multi.set(key, allocatedStock.toString());
    }
  }

  await multi.exec();
};

exports.getVariantStock = async (dropId, variantId) => {
  if (!redisClient.isOpen) return null;
  const stock = await redisClient.get(getStockKey(dropId, variantId));
  return stock !== null ? parseInt(stock) : null;
};

exports.clearDropStock = async (dropId) => {
  if (!redisClient.isOpen) return;
  const keys = await redisClient.keys(`${CACHE_PREFIX}:${dropId}:variant:*:stock`);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

exports.invalidateDrop = async (slug) => {
  if (!redisClient.isOpen) return;
  await Promise.all([
    this.delete(slug),
    this.clearListCache(),
  ]);
};
