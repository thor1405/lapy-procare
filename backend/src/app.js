import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { errorResponse, successResponse } from './utils/apiResponse.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import pcBuilderRoutes from './routes/pcBuilderRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Base Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-friendly fallback
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'lapy_procare_session_cookie_signature_secret_9999'));

// Morgan HTTP request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', globalLimiter);

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/health', (req, res) => {
  return successResponse(res, 'Lapy Procare API is healthy', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Lapy Procare Core API',
    version: '1.0.0',
  });
});

app.get('/api/v1/health', (req, res) => {
  return successResponse(res, 'Lapy Procare API v1 is healthy', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Lapy Procare Core API v1',
  });
});

// Mount API v1 Routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/tracking', trackingRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/pc-builder', pcBuilderRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/technician', technicianRoutes);
app.use('/api/v1/upload', uploadRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  return errorResponse(res, `API route ${req.originalUrl} not found`, 404);
});

// Centralized error handling
app.use(errorHandler);

export default app;
