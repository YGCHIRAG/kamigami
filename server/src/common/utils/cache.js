const { redisClient } = require('../../db/redis');

/**
 * Get data from cache
 * @param {string} key 
 * @returns {Promise<any|null>}
 */
exports.getCache = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`[Cache] Error getting key ${key}:`, err);
    return null;
  }
};

/**
 * Set data in cache with TTL
 * @param {string} key 
 * @param {any} data 
 * @param {number} ttl In seconds
 */
exports.setCache = async (key, data, ttl = 300) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.set(key, JSON.stringify(data), {
      EX: ttl,
    });
  } catch (err) {
    console.error(`[Cache] Error setting key ${key}:`, err);
  }
};

/**
 * Delete specific key from cache
 * @param {string} key 
 */
exports.deleteCache = async (key) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.del(key);
  } catch (err) {
    console.error(`[Cache] Error deleting key ${key}:`, err);
  }
};

/**
 * Delete keys matching a pattern
 * @param {string} pattern 
 */
exports.deleteByPattern = async (pattern) => {
  try {
    if (!redisClient.isOpen) return;
    const keysToDelete = [];
    for await (const key of redisClient.scanIterator({
      MATCH: pattern,
      COUNT: 100
    })) {
      keysToDelete.push(key);
    }
    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
    }
  } catch (err) {
    console.error(`[Cache] Error deleting pattern ${pattern}:`, err);
  }
};
