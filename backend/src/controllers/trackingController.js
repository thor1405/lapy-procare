import { RepairBooking } from '../models/RepairBooking.js';
import { RepairStatusHistory } from '../models/RepairStatusHistory.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getPublicTracking = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) {
      return errorResponse(res, 'Ticket ID is required', 400);
    }

    const cleanTicket = ticketId.trim().toUpperCase();
    const booking = await RepairBooking.findOne({ ticketId: cleanTicket });

    if (!booking) {
      return errorResponse(res, `No repair ticket found matching "${cleanTicket}". Please check the ID and try again.`, 404);
    }

    // Status history
    const history = await RepairStatusHistory.find({ booking: booking._id })
      .select('toStatus note createdAt changedByName')
      .sort({ createdAt: 1 });

    // Sanitize data: Never expose customer phone/email, full serial number, or internal notes
    const publicSafePayload = {
      ticketId: booking.ticketId,
      status: booking.status,
      device: {
        deviceType: booking.device.deviceType,
        brand: booking.device.brand,
        model: booking.device.model,
      },
      problemCategory: booking.problem.category,
      servicePreference: booking.servicePreference,
      bookingDate: booking.createdAt,
      appointment: {
        date: booking.appointment.date,
        timeSlot: booking.appointment.timeSlot,
      },
      estimatedCompletionDate: booking.estimatedCompletionDate,
      customerNotes: booking.customerNotes.map((n) => ({
        note: n.note,
        createdAt: n.createdAt,
      })),
      timeline: history.map((h) => ({
        status: h.toStatus,
        note: h.note,
        timestamp: h.createdAt,
      })),
    };

    return successResponse(res, 'Tracking record found', { tracking: publicSafePayload });
  } catch (error) {
    next(error);
  }
};
