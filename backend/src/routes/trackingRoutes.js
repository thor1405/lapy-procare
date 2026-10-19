import { Router } from 'express';
import { getPublicTracking } from '../controllers/trackingController.js';
import { trackingLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public privacy-safe live repair tracking
router.get('/:ticketId', trackingLimiter, getPublicTracking);

export default router;
