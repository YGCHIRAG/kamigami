const config = require('./config');
const app = require('./app');
const { connectRedis } = require('./db/redis');
const dropsScheduler = require('./modules/drops/drops.scheduler');
const reservationWorker = require('./workers/reservation.worker');

const startServer = async () => {
  try {
    // Attempt to connect to Redis
    await connectRedis();

    // Ensure Admin User exists (Dev only)
    const { ensureAdmin } = require('./modules/auth/auth.init');
    await ensureAdmin();

    // Initialize Scheduler
    dropsScheduler.init();

    // Initialize Reservation Worker
    reservationWorker.initWorker();

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`Server is running in ${config.env} mode on port ${config.port}`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1); 
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
