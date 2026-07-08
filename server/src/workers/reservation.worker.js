const { Worker } = require('bullmq');
const { redisClient } = require('../db/redis');
const { connection } = require('../modules/reservation/reservation.utils');

const initWorker = () => {
  const worker = new Worker(
    'reservation-expiry',
    async (job) => {
      const { dropId, variantId, userId, reservationKey, stockKey } = job.data;
      
      // Check if reservation still exists in Redis
      // If it exists, it means checkout didn't happen
      const exists = await redisClient.exists(reservationKey);
      
      if (exists) {
        console.log(`[Worker] Reservation expired for user ${userId}, variant ${variantId}. Restoring stock.`);
        
        // Atomic restoration using multi or just increment
        const multi = redisClient.multi();
        multi.incr(stockKey);
        multi.del(reservationKey);
        await multi.exec();
      }
    },
    { connection }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Cleanup job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Cleanup job ${job.id} failed:`, err);
  });

  return worker;
};

module.exports = { initWorker };
