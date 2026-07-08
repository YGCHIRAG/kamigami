const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const config = require('../../config');

// BullMQ requires IORedis
const connection = new IORedis(config.redis.url, {
  maxRetriesPerRequest: null,
});

const reservationExpiryQueue = new Queue('reservation-expiry', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  },
});

module.exports = {
  reservationExpiryQueue,
  connection,
};
