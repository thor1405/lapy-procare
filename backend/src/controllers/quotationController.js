import { Quotation } from '../models/Quotation.js';
import { RepairBooking } from '../models/RepairBooking.js';
import { RepairStatusHistory } from '../models/RepairStatusHistory.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { generateDocumentPDF } from '../services/pdfService.js';
import { emitStatusUpdate } from '../services/socketService.js';
import { QUOTATION_STATUS, REPAIR_STATUS } from '../config/constants.js';

export const getMyQuotations = async (req, res, next) => {
  try {
    const quotations = await Quotation.find({ customer: req.user._id })
      .populate('booking', 'device ticketId status')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Quotations retrieved', { quotations });
  } catch (error) {
    next(error);
  }
};

export const getQuotationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id)
      .populate('booking')
      .populate('customer', 'name email phone');

    if (!quotation) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    if (req.user.role === 'CUSTOMER' && quotation.customer._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    return successResponse(res, 'Quotation retrieved', { quotation });
  } catch (error) {
    next(error);
  }
};

export const approveQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    if (req.user.role === 'CUSTOMER' && quotation.customer.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    if (quotation.status === QUOTATION_STATUS.APPROVED) {
      return errorResponse(res, 'Quotation has already been approved', 400);
    }

    if (new Date() > quotation.expiresAt) {
      quotation.status = QUOTATION_STATUS.EXPIRED;
      await quotation.save();
      return errorResponse(res, 'This quotation has expired. Please contact us for a revised estimate.', 400);
    }

    quotation.status = QUOTATION_STATUS.APPROVED;
    quotation.approvedAt = new Date();
    await quotation.save();

    // Advance booking status to REPAIR_APPROVED
    const booking = await RepairBooking.findById(quotation.booking);
    if (booking) {
      const prev = booking.status;
      booking.status = REPAIR_STATUS.REPAIR_APPROVED;
      await booking.save();

      await RepairStatusHistory.create({
        booking: booking._id,
        ticketId: booking.ticketId,
        fromStatus: prev,
        toStatus: REPAIR_STATUS.REPAIR_APPROVED,
        note: `Customer approved Quotation ${quotation.quotationNumber} for ₹${quotation.totalAmount.toLocaleString('en-IN')}`,
        changedBy: req.user._id,
        changedByName: req.user.name,
      });

      emitStatusUpdate(booking.ticketId, {
        ticketId: booking.ticketId,
        status: REPAIR_STATUS.REPAIR_APPROVED,
        customerId: booking.customer,
        note: 'Customer approved quotation. Repair work authorized.',
      });
    }

    return successResponse(res, 'Quotation approved successfully. Repair work will proceed.', { quotation });
  } catch (error) {
    next(error);
  }
};

export const rejectQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    if (req.user.role === 'CUSTOMER' && quotation.customer.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    quotation.status = QUOTATION_STATUS.REJECTED;
    quotation.rejectedAt = new Date();
    quotation.rejectionReason = reason || 'Declined by customer';
    await quotation.save();

    const booking = await RepairBooking.findById(quotation.booking);
    if (booking) {
      await RepairStatusHistory.create({
        booking: booking._id,
        ticketId: booking.ticketId,
        fromStatus: booking.status,
        toStatus: booking.status,
        note: `Customer rejected Quotation ${quotation.quotationNumber}. Reason: ${quotation.rejectionReason}`,
        changedBy: req.user._id,
        changedByName: req.user.name,
      });
    }

    return successResponse(res, 'Quotation rejected', { quotation });
  } catch (error) {
    next(error);
  }
};

export const requestClarification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { query } = req.body;

    if (!query) {
      return errorResponse(res, 'Please provide your question or clarification request', 400);
    }

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    quotation.customerClarificationRequest = query;
    await quotation.save();

    return successResponse(res, 'Clarification request submitted to our technician team', { quotation });
  } catch (error) {
    next(error);
  }
};

export const downloadQuotationPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id).populate('customer');

    if (!quotation) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    if (req.user.role === 'CUSTOMER' && quotation.customer._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Quotation-${quotation.quotationNumber}.pdf`);

    generateDocumentPDF('QUOTATION', quotation, res);
  } catch (error) {
    next(error);
  }
};
