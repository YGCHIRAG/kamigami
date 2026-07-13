const fs = require('fs');
const path = require('path');
const { redisClient } = require('../../db/redis');
const { reservationExpiryQueue } = require('./reservation.utils');
const AppError = require('../../common/errors/AppError');

let reserveLuaSha = null;

const loadLuaScript = async () => {
  if (reserveLuaSha) return reserveLuaSha;
  
  const scriptPath = path.join(__dirname, '../../db/redis/scripts/reserve.lua');
  const script = fs.readFileSync(scriptPath, 'utf8');
  reserveLuaSha = await redisClient.scriptLoad(script);
  return reserveLuaSha;
};

exports.reserveStock = async (dropId, variantId, userId, quantity = 1) => {
  const sha = await loadLuaScript();
  
  const stockKey = `drop:${dropId}:variant:${variantId}:stock`;
  const reservationKey = `reservation:${userId}:${variantId}`;
  const ttl = 300; // 5 minutes

  const result = await redisClient.evalSha(sha, {
    keys: [stockKey, reservationKey],
    arguments: [userId, variantId, ttl.toString(), dropId, quantity.toString()]
  });

  if (result === 'out_of_stock') {
    throw new AppError('Product is out of stock', 409);
  }

  if (result === 'already_reserved') {
    throw new AppError('You already have a reservation for this product', 409);
  }

  // If reserved, schedule a cleanup job in BullMQ
  // This job will run after 5 minutes and check if the reservation still exists
  await reservationExpiryQueue.add(
    'cleanup',
    { dropId, variantId, userId, reservationKey, stockKey, quantity },
    { delay: ttl * 1000 }
  );

  return {
    status: 'reserved',
    variantId,
    quantity,
    expiresIn: ttl
  };
};

exports.validateReservation = async (userId, variantId) => {
  const reservationKey = `reservation:${userId}:${variantId}`;
  const data = await redisClient.get(reservationKey);
  return data ? JSON.parse(data) : null;
};

exports.clearReservation = async (userId, variantId) => {
  const reservationKey = `reservation:${userId}:${variantId}`;
  await redisClient.del(reservationKey);
};
