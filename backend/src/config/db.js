import mongoose from 'mongoose';
import { logger } from './logger.js';
import { autoSeedIfEmpty } from '../scripts/seed.js';

let isConnected = false;
let connectionError = null;

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lapy_procare';
  
  // Mask sensitive credentials in connection logs
  const sanitizedURI = mongoURI.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
  logger.info(`Connecting to Database: ${sanitizedURI}`);

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
    });

    isConnected = true;
    connectionError = null;
    const isAtlas = mongoURI.includes('mongodb+srv') || conn.connection.host.includes('mongodb.net');
    logger.info(
      `✔ MongoDB Connected [${isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'}]: ${conn.connection.host}/${conn.connection.name}`
    );

    // Auto-seed initial Admin & platform catalog if database is empty
    await autoSeedIfEmpty();

    return conn;
  } catch (error) {
    isConnected = false;
    connectionError = error.message;
    logger.error(`Error connecting to MongoDB: ${error.message}`);

    if (mongoURI.includes('@cluster0.mongodb.net')) {
      logger.error('--------------------------------------------------------------------------------');
      logger.error('CRITICAL CONFIGURATION ERROR: Your MONGO_URI in .env has "@cluster0.mongodb.net".');
      logger.error('In MongoDB Atlas, clusters have a unique 5-7 character subdomain (e.g. cluster0.abcde.mongodb.net).');
      logger.error('Please go to https://cloud.mongodb.com -> Clusters -> Connect -> Drivers and copy the EXACT URI.');
      logger.error('--------------------------------------------------------------------------------');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      logger.error('CRITICAL: MongoDB Atlas hostname could not be resolved via DNS. Check your Atlas cluster URL in .env.');
    } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      logger.error('CRITICAL: MongoDB Atlas authentication failed. Check your database username and password in .env.');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('Server selection timed out')) {
      logger.error('CRITICAL: MongoDB connection timed out. Ensure Network Access in MongoDB Atlas allows 0.0.0.0/0 (IP whitelist).');
    }

    // Do NOT exit the process so the container stays healthy and can serve healthchecks & logs
    logger.warn('Will automatically retry database connection in 10 seconds...');
    setTimeout(connectDB, 10000);
  }
};

export const getDBStatus = () => ({
  isConnected,
  error: connectionError,
  readyState: mongoose.connection.readyState,
});
