const cron = require('node-cron');
const prisma = require('../../db/prisma');
const dropsService = require('./drops.service');

let isChecking = false;

const checkDrops = async () => {
  if (isChecking) return;
  isChecking = true;

  try {
    const now = new Date();

    // 1. Find scheduled drops that should be active
    const dropsToActivate = await prisma.drop.findMany({
      where: {
        status: 'SCHEDULED',
        startTime: { lte: now }
      }
    });

    for (const drop of dropsToActivate) {
      console.log(`[Scheduler] Activating drop: ${drop.title}`);
      await dropsService.activateDrop(drop.id);
    }

    // 2. Find active drops that should be ended
    const dropsToEnd = await prisma.drop.findMany({
      where: {
        status: 'ACTIVE',
        endTime: { lte: now }
      }
    });

    for (const drop of dropsToEnd) {
      console.log(`[Scheduler] Ending drop: ${drop.title}`);
      await dropsService.endDrop(drop.id);
    }
  } catch (err) {
    console.error('[Scheduler] Error processing drops:', err);
  } finally {
    isChecking = false;
  }
};

// Run every minute
const init = () => {
  console.log('[Scheduler] Drop lifecycle monitor initialized');
  cron.schedule('* * * * *', checkDrops);
};

module.exports = { init };
