import { RepairBooking } from '../models/RepairBooking.js';
import { RepairStatusHistory } from '../models/RepairStatusHistory.js';
import { AppointmentSlot } from '../models/AppointmentSlot.js';
import { generateTicketId } from '../utils/ticketGenerator.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { emitNewBooking } from '../services/socketService.js';
import { sendBookingConfirmationEmail } from '../services/emailService.js';
import { REPAIR_STATUS } from '../config/constants.js';

const STANDARD_SLOTS = [
  '09:30 AM - 11:00 AM',
  '11:00 AM - 12:30 PM',
  '01:30 PM - 03:00 PM',
  '03:00 PM - 04:30 PM',
  '04:30 PM - 06:00 PM',
  '06:00 PM - 07:30 PM',
];

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) {
      return errorResponse(res, 'Date query parameter is required (YYYY-MM-DD)', 400);
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return errorResponse(res, 'Cannot book appointments for past dates', 400);
    }

    // Check Sunday rule or custom working hours
    const isSunday = selectedDate.getDay() === 0;
    const allowedSlots = isSunday
      ? ['10:00 AM - 11:30 AM', '11:30 AM - 01:00 PM']
      : STANDARD_SLOTS;

    // Fetch existing booked slots for this date
    const bookedRecords = await AppointmentSlot.find({ date });
    const slotMap = new Map();
    bookedRecords.forEach((r) => slotMap.set(r.timeSlot, r));

    const result = allowedSlots.map((slot) => {
      const record = slotMap.get(slot);
      const bookedCount = record ? record.bookedCount : 0;
      const maxCapacity = record ? record.maxCapacity : 4;
      const isBlocked = record ? record.isBlocked : false;
      const available = !isBlocked && bookedCount < maxCapacity;

      return {
        timeSlot: slot,
        available,
        remainingCapacity: Math.max(0, maxCapacity - bookedCount),
      };
    });

    return successResponse(res, 'Available slots retrieved', { date, slots: result });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const {
      device,
      problem,
      photos,
      servicePreference,
      doorstepAddress,
      appointment,
    } = req.body;

    if (!device?.deviceType || !device?.brand || !device?.model) {
      return errorResponse(res, 'Please provide complete device information', 400);
    }

    if (!problem?.category || !problem?.description) {
      return errorResponse(res, 'Please provide the problem category and description', 400);
    }

    if (!appointment?.date || !appointment?.timeSlot) {
      return errorResponse(res, 'Please provide appointment date and time slot', 400);
    }

    const apptDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (apptDate < today) {
      return errorResponse(res, 'Appointment date cannot be in the past', 400);
    }

    const dateStr = apptDate.toISOString().split('T')[0];

    // Atomically reserve slot capacity to avoid double booking
    const slotRecord = await AppointmentSlot.findOneAndUpdate(
      {
        date: dateStr,
        timeSlot: appointment.timeSlot,
        isBlocked: false,
        $expr: { $lt: ['$bookedCount', '$maxCapacity'] },
      },
      { $inc: { bookedCount: 1 } },
      { new: true, upsert: false }
    );

    // If slot record doesn't exist yet, try to create it atomically
    if (!slotRecord) {
      // Check if slot was already full or just needs initialization
      const existing = await AppointmentSlot.findOne({ date: dateStr, timeSlot: appointment.timeSlot });
      if (existing && (existing.bookedCount >= existing.maxCapacity || existing.isBlocked)) {
        return errorResponse(res, 'This appointment slot is fully booked. Please select another time.', 409);
      }

      try {
        await AppointmentSlot.create({
          date: dateStr,
          timeSlot: appointment.timeSlot,
          bookedCount: 1,
          maxCapacity: 4,
        });
      } catch (err) {
        // In case of race condition
        if (err.code === 11000) {
          await AppointmentSlot.updateOne(
            { date: dateStr, timeSlot: appointment.timeSlot },
            { $inc: { bookedCount: 1 } }
          );
        }
      }
    }

    // Generate atomic ticket ID (e.g. LPC-2026-000001)
    const ticketId = await generateTicketId();

    const booking = await RepairBooking.create({
      ticketId,
      customer: req.user._id,
      device,
      problem,
      photos: photos || [],
      servicePreference,
      doorstepAddress: doorstepAddress || {},
      appointment: {
        date: apptDate,
        timeSlot: appointment.timeSlot,
      },
      status: REPAIR_STATUS.BOOKING_RECEIVED,
    });

    // Create initial status history entry
    await RepairStatusHistory.create({
      booking: booking._id,
      ticketId,
      fromStatus: 'None',
      toStatus: REPAIR_STATUS.BOOKING_RECEIVED,
      note: 'Booking successfully confirmed via online portal.',
      changedBy: req.user._id,
      changedByName: req.user.name,
    });

    // Real-time broadcast to admin dashboard
    emitNewBooking(booking);

    // Send confirmation email
    sendBookingConfirmationEmail(booking, req.user).catch((err) => {
      // non-blocking
    });

    return successResponse(
      res,
      'Repair booking submitted successfully',
      { booking, ticketId },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { customer: req.user._id };

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      RepairBooking.find(query)
        .populate('assignedTechnician', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      RepairBooking.countDocuments(query),
    ]);

    return successResponse(res, 'Bookings fetched', {
      bookings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingByTicketId = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const cleanTicket = ticketId.trim().toUpperCase();

    const booking = await RepairBooking.findOne({ ticketId: cleanTicket })
      .populate('assignedTechnician', 'name phone')
      .populate('customer', 'name email phone');

    if (!booking) {
      return errorResponse(res, `Repair booking with Ticket ID ${cleanTicket} not found`, 404);
    }

    // Role verification: Customers can only view their own bookings in full detail
    if (req.user.role === 'CUSTOMER' && booking.customer._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied. You do not own this repair ticket.', 403);
    }

    const history = await RepairStatusHistory.find({ booking: booking._id }).sort({ createdAt: 1 });

    return successResponse(res, 'Booking details fetched', { booking, history });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { reason } = req.body;
    const cleanTicket = ticketId.trim().toUpperCase();

    const booking = await RepairBooking.findOne({ ticketId: cleanTicket });
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    // Ownership check
    if (req.user.role === 'CUSTOMER' && booking.customer.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Unauthorized to cancel this booking', 403);
    }

    // Only early stages can be cancelled by customer
    const cancellableStatuses = [REPAIR_STATUS.BOOKING_RECEIVED, REPAIR_STATUS.DEVICE_RECEIVED];
    if (!cancellableStatuses.includes(booking.status) && req.user.role === 'CUSTOMER') {
      return errorResponse(res, 'Cannot cancel repair once diagnosis or active work has commenced. Please contact the service center directly.', 400);
    }

    const prevStatus = booking.status;
    booking.status = REPAIR_STATUS.CANCELLED;
    booking.cancellationReason = reason || 'Cancelled by customer';
    await booking.save();

    await RepairStatusHistory.create({
      booking: booking._id,
      ticketId: booking.ticketId,
      fromStatus: prevStatus,
      toStatus: REPAIR_STATUS.CANCELLED,
      note: `Cancelled: ${reason || 'Cancelled by customer'}`,
      changedBy: req.user._id,
      changedByName: req.user.name,
    });

    return successResponse(res, 'Repair booking cancelled successfully', { booking });
  } catch (error) {
    next(error);
  }
};
