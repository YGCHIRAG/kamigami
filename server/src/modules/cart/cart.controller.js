const cartService = require('./cart.service');
const { redisClient } = require('../../db/redis');
const asyncHandler = require('../../common/middleware/asyncHandler');

const getCacheKey = (userId) => `cart:${userId}`;

exports.getCart = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Try cache first
  if (redisClient.isOpen) {
    const cached = await redisClient.get(getCacheKey(userId));
    if (cached) {
      return res.status(200).json({
        status: 'success',
        source: 'cache',
        data: JSON.parse(cached)
      });
    }
  }

  const cart = await cartService.getCart(userId);

  // Set cache (TTL 10 mins)
  if (redisClient.isOpen) {
    await redisClient.set(getCacheKey(userId), JSON.stringify(cart), { EX: 600 });
  }

  res.status(200).json({
    status: 'success',
    source: 'db',
    data: cart
  });
});

exports.addItem = asyncHandler(async (req, res) => {
  const { variantId, quantity } = req.body;
  const userId = req.user.userId;

  const item = await cartService.addItem(userId, variantId, quantity);

  // Invalidate cache
  if (redisClient.isOpen) {
    await redisClient.del(getCacheKey(userId));
  }

  res.status(201).json({
    status: 'success',
    data: item
  });
});

exports.updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;
  const userId = req.user.userId;

  const item = await cartService.updateItem(userId, itemId, quantity);

  // Invalidate cache
  if (redisClient.isOpen) {
    await redisClient.del(getCacheKey(userId));
  }

  res.status(200).json({
    status: 'success',
    data: item
  });
});

exports.removeItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.userId;

  await cartService.removeItem(userId, itemId);

  // Invalidate cache
  if (redisClient.isOpen) {
    await redisClient.del(getCacheKey(userId));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
