import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingByTicketId,
  cancelBooking,
  getAvailableSlots,
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Publicly check available slots
router.get('/slots', getAvailableSlots);

// Customer endpoints
router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/:ticketId', authenticate, getBookingByTicketId);
router.post('/:ticketId/cancel', authenticate, cancelBooking);

export default router;
