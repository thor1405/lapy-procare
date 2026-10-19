import { RepairBooking } from '../models/RepairBooking.js';
import { RepairStatusHistory } from '../models/RepairStatusHistory.js';
import { InventoryItem } from '../models/InventoryItem.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { emitStatusUpdate } from '../services/socketService.js';
import { REPAIR_STATUS } from '../config/constants.js';

const ALLOWED_TECH_STATUSES = [
  REPAIR_STATUS.DEVICE_RECEIVED,
  REPAIR_STATUS.DIAGNOSIS_IN_PROGRESS,
  REPAIR_STATUS.REPAIR_IN_PROGRESS,
  REPAIR_STATUS.TESTING_QUALITY_CHECK,
  REPAIR_STATUS.READY_FOR_COLLECTION,
];

export const getAssignedRepairs = async (req, res, next) => {
  try {
    const repairs = await RepairBooking.find({ assignedTechnician: req.user._id })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Assigned repairs fetched', { repairs });
  } catch (error) {
    next(error);
  }
};

export const updateDiagnosticFindings = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { diagnosticFindings, priority } = req.body;

    const repair = await RepairBooking.findOne({
      ticketId: ticketId.trim().toUpperCase(),
      assignedTechnician: req.user._id,
    });

    if (!repair) {
      return errorResponse(res, 'Repair job not found or not assigned to you', 404);
    }

    if (diagnosticFindings) repair.diagnosticFindings = diagnosticFindings;
    if (priority) repair.priority = priority;

    await repair.save();

    return successResponse(res, 'Diagnostic findings updated', { repair });
  } catch (error) {
    next(error);
  }
};

export const updateTechnicianStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status, note } = req.body;

    if (!ALLOWED_TECH_STATUSES.includes(status)) {
      return errorResponse(res, `Technicians are authorized to set stages: ${ALLOWED_TECH_STATUSES.join(', ')}`, 403);
    }

    const repair = await RepairBooking.findOne({
      ticketId: ticketId.trim().toUpperCase(),
      assignedTechnician: req.user._id,
    });

    if (!repair) {
      return errorResponse(res, 'Repair job not found or not assigned to you', 404);
    }

    const prev = repair.status;
    repair.status = status;

    if (note) {
      repair.customerNotes.push({
        note,
        author: req.user._id,
        authorName: req.user.name,
      });
    }

    await repair.save();

    await RepairStatusHistory.create({
      booking: repair._id,
      ticketId: repair.ticketId,
      fromStatus: prev,
      toStatus: status,
      note: note || `Technician updated stage to ${status}`,
      changedBy: req.user._id,
      changedByName: req.user.name,
    });

    emitStatusUpdate(repair.ticketId, {
      ticketId: repair.ticketId,
      status,
      customerId: repair.customer,
      note: note || '',
      updatedAt: new Date(),
    });

    return successResponse(res, 'Stage updated successfully', { repair });
  } catch (error) {
    next(error);
  }
};

export const submitCompletionReport = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { completionNotes } = req.body;

    const repair = await RepairBooking.findOne({
      ticketId: ticketId.trim().toUpperCase(),
      assignedTechnician: req.user._id,
    });

    if (!repair) {
      return errorResponse(res, 'Repair job not found or not assigned to you', 404);
    }

    repair.status = REPAIR_STATUS.READY_FOR_COLLECTION;
    repair.customerNotes.push({
      note: `Quality Check Complete & Ready for Collection. ${completionNotes || 'All diagnostic tests passed successfully.'}`,
      author: req.user._id,
      authorName: req.user.name,
    });

    await repair.save();

    await RepairStatusHistory.create({
      booking: repair._id,
      ticketId: repair.ticketId,
      fromStatus: REPAIR_STATUS.TESTING_QUALITY_CHECK,
      toStatus: REPAIR_STATUS.READY_FOR_COLLECTION,
      note: `Technician submitted completion report: ${completionNotes || 'Ready for collection'}`,
      changedBy: req.user._id,
      changedByName: req.user.name,
    });

    emitStatusUpdate(repair.ticketId, {
      ticketId: repair.ticketId,
      status: REPAIR_STATUS.READY_FOR_COLLECTION,
      customerId: repair.customer,
      note: 'Device repair and testing completed. Device is ready for collection!',
    });

    return successResponse(res, 'Repair completion submitted', { repair });
  } catch (error) {
    next(error);
  }
};
