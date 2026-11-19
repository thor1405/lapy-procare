import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingByTicketId,
  cancelBooking,
  getAvailableSlots,
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { createBookingSchema, slotsQuerySchema } from '../validators/bookingValidator.js';

const router = Router();

// Publicly check available slots with query validation
router.get('/slots', validate(slotsQuerySchema, 'query'), getAvailableSlots);

// Customer endpoints
router.post('/', authenticate, bookingLimiter, validate(createBookingSchema), createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/:ticketId', authenticate, getBookingByTicketId);
router.post('/:ticketId/cancel', authenticate, cancelBooking);

export default router;
