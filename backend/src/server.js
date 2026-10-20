import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { initSocket } from './services/socketService.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;

process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`, { stack: err.stack });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION:', reason);
});

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Start Server & Connect to Database
const startServer = async () => {
  try {
    // 1. Start HTTP Server first so container is immediately healthy and responsive
    httpServer.listen(PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`  LAPY PROCARE BACKEND SERVER RUNNING ON PORT ${PORT} `);
      logger.info(`  Mode: ${process.env.NODE_ENV || 'development'}         `);
      logger.info(`  Location: Vamanjoor, Mangaluru, Karnataka – 575028     `);
      logger.info(`=======================================================`);
    });

    // 2. Connect to MongoDB asynchronously (with auto-retry if network is pending)
    connectDB().catch((err) => {
      logger.warn(`Initial database connection attempt deferred: ${err.message}`);
    });
  } catch (error) {
    logger.error(`Failed to start HTTP server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
