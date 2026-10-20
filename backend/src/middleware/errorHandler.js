import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { errorResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`, { stack: err.stack });

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 'Validation failed', 400, formattedErrors);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, `Resource not found with id ${err.value}`, 404);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, `Duplicate value entered for ${field}. Please use another value.`, 409);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const formattedErrors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return errorResponse(res, 'Database validation failed', 400, formattedErrors);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid authorization token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Authorization token has expired', 401);
  }

  // Multer Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'File size exceeds maximum permitted limit (5MB)', 400);
  }

  // Database Connection / DNS Resolution / Atlas Buffering Errors
  if (
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongooseError' && err.message.includes('buffering timed out') ||
    err.message.includes('ENOTFOUND') ||
    err.message.includes('querySrv') ||
    err.message.includes('bad auth') ||
    err.message.includes('Authentication failed')
  ) {
    logger.error(`DATABASE CONNECTION FAILURE: ${err.message}`);
    return errorResponse(
      res,
      'Database connection failed. Please verify your MongoDB Atlas MONGO_URI in .env (your cluster URL must include your unique Atlas subdomain like cluster0.abcde.mongodb.net, not cluster0.mongodb.net) and ensure Network Access has 0.0.0.0/0 whitelisted.',
      503
    );
  }

  // Default Internal Server Error
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);

  return errorResponse(res, message, statusCode);
};
