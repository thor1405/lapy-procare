import mongoose from 'mongoose';
import { logger } from './logger.js';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lapy_procare';
    
    // Mask sensitive credentials in connection logs
    const sanitizedURI = mongoURI.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
    logger.info(`Connecting to Database: ${sanitizedURI}`);

    const conn = await mongoose.connect(mongoURI, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    const isAtlas = mongoURI.includes('mongodb+srv') || conn.connection.host.includes('mongodb.net');
    logger.info(
      `MongoDB Connected [${isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'}]: ${conn.connection.host}/${conn.connection.name}`
    );
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      logger.error('CRITICAL: MongoDB Atlas authentication failed. Check your MONGO_URI username, password, and database name in .env');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('Server selection timed out')) {
      logger.error('CRITICAL: Connection timed out. Ensure your Raspberry Pi / server IP is allowed in MongoDB Atlas Network Access (0.0.0.0/0).');
    }
    process.exit(1);
  }
};
