import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { RepairBooking } from '../models/RepairBooking.js';
import { RepairStatusHistory } from '../models/RepairStatusHistory.js';
import { Quotation } from '../models/Quotation.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { InventoryItem } from '../models/InventoryItem.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { TechnicianProfile } from '../models/TechnicianProfile.js';
import { Service } from '../models/Service.js';
import { BusinessSettings } from '../models/BusinessSettings.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { generateQuotationNumber, generateInvoiceNumber } from '../utils/ticketGenerator.js';
import { emitStatusUpdate } from '../services/socketService.js';
import { sendStatusUpdateEmail, sendQuotationEmail, sendInvoiceEmail } from '../services/emailService.js';
import { REPAIR_STATUS, ROLES, PAYMENT_STATUS, QUOTATION_STATUS } from '../config/constants.js';

// ==========================================
// 1. DASHBOARD ANALYTICS
// ==========================================
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalRepairs,
      activeRepairs,
      pendingBookings,
      completedRepairs,
      cancelledBookings,
      invoices,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.CUSTOMER }),
      RepairBooking.countDocuments(),
      RepairBooking.countDocuments({
        status: {
          $in: [
            REPAIR_STATUS.DEVICE_RECEIVED,
            REPAIR_STATUS.DIAGNOSIS_IN_PROGRESS,
            REPAIR_STATUS.AWAITING_CUSTOMER_APPROVAL,
            REPAIR_STATUS.REPAIR_APPROVED,
            REPAIR_STATUS.REPAIR_IN_PROGRESS,
            REPAIR_STATUS.TESTING_QUALITY_CHECK,
            REPAIR_STATUS.READY_FOR_COLLECTION,
          ],
        },
      }),
      RepairBooking.countDocuments({ status: REPAIR_STATUS.BOOKING_RECEIVED }),
      RepairBooking.countDocuments({ status: REPAIR_STATUS.COMPLETED }),
      RepairBooking.countDocuments({ status: REPAIR_STATUS.CANCELLED }),
      Invoice.find(),
      RepairBooking.find()
        .populate('customer', 'name email phone')
        .populate('assignedTechnician', 'name')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    // Financial aggregation from real invoice transactions
    let totalRevenue = 0;
    let outstandingRevenue = 0;

    invoices.forEach((inv) => {
      totalRevenue += inv.amountPaid || 0;
      outstandingRevenue += inv.balanceDue || 0;
    });

    // Aggregate monthly volume for the last 6 months
    const monthlyVolume = await RepairBooking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyVolume.map((item) => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      repairs: item.count,
    }));

    // Aggregate category distribution
    const categoryDistribution = await RepairBooking.aggregate([
      {
        $group: {
          _id: '$device.deviceType',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedCategories = categoryDistribution.map((item) => ({
      name: item._id || 'Other',
      value: item.count,
    }));

    return successResponse(res, 'Dashboard statistics fetched', {
      metrics: {
        totalCustomers,
        totalRepairs,
        activeRepairs,
        pendingBookings,
        completedRepairs,
        cancelledBookings,
        totalRevenue,
        outstandingRevenue,
      },
      monthlyVolume: formattedMonthly.length > 0 ? formattedMonthly : [{ name: 'Current Month', repairs: totalRepairs }],
      categoryDistribution: formattedCategories.length > 0 ? formattedCategories : [{ name: 'Laptop', value: 1 }],
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. REPAIR & BOOKING MANAGEMENT
// ==========================================
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { 'device.brand': { $regex: search, $options: 'i' } },
        { 'device.model': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      RepairBooking.find(query)
        .populate('customer', 'name email phone')
        .populate('assignedTechnician', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      RepairBooking.countDocuments(query),
    ]);

    return successResponse(res, 'Bookings retrieved', {
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

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status, note, estimatedCompletionDate } = req.body;

    if (!status || !Object.values(REPAIR_STATUS).includes(status)) {
      return errorResponse(res, 'Valid status is required', 400);
    }

    const booking = await RepairBooking.findOne({ ticketId: ticketId.trim().toUpperCase() })
      .populate('customer', 'name email phone');

    if (!booking) {
      return errorResponse(res, 'Booking ticket not found', 404);
    }

    const previousStatus = booking.status;
    booking.status = status;

    if (estimatedCompletionDate) {
      booking.estimatedCompletionDate = new Date(estimatedCompletionDate);
    }

    if (note) {
      booking.customerNotes.push({
        note,
        author: req.user._id,
        authorName: req.user.name,
      });
    }

    await booking.save();

    // Create status history log
    await RepairStatusHistory.create({
      booking: booking._id,
      ticketId: booking.ticketId,
      fromStatus: previousStatus,
      toStatus: status,
      note: note || `Status updated to ${status}`,
      changedBy: req.user._id,
      changedByName: req.user.name,
    });

    // Real-time emit to connected sockets
    emitStatusUpdate(booking.ticketId, {
      ticketId: booking.ticketId,
      status,
      customerId: booking.customer._id,
      note: note || '',
      updatedAt: new Date(),
    });

    // Send email alert to customer
    sendStatusUpdateEmail(booking, booking.customer, status, note).catch(() => {});

    return successResponse(res, `Status updated to ${status}`, { booking });
  } catch (error) {
    next(error);
  }
};

export const assignTechnician = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { technicianId } = req.body;

    const booking = await RepairBooking.findOne({ ticketId: ticketId.trim().toUpperCase() });
    if (!booking) {
      return errorResponse(res, 'Booking ticket not found', 404);
    }

    const techUser = await User.findOne({ _id: technicianId, role: ROLES.TECHNICIAN });
    if (!techUser) {
      return errorResponse(res, 'Valid technician account not found', 404);
    }

    booking.assignedTechnician = techUser._id;
    if (booking.status === REPAIR_STATUS.BOOKING_RECEIVED) {
      booking.status = REPAIR_STATUS.DEVICE_RECEIVED;
    }
    await booking.save();

    // Update technician profile workload count
    await TechnicianProfile.findOneAndUpdate(
      { user: techUser._id },
      { $inc: { activeRepairsCount: 1 } },
      { upsert: true }
    );

    await RepairStatusHistory.create({
      booking: booking._id,
      ticketId: booking.ticketId,
      fromStatus: booking.status,
      toStatus: booking.status,
      note: `Assigned to technician ${techUser.name}`,
      changedBy: req.user._id,
      changedByName: req.user.name,
    });

    return successResponse(res, `Technician ${techUser.name} assigned`, { booking });
  } catch (error) {
    next(error);
  }
};

export const addBookingNote = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { note, isInternal = false } = req.body;

    if (!note) {
      return errorResponse(res, 'Note content is required', 400);
    }

    const booking = await RepairBooking.findOne({ ticketId: ticketId.trim().toUpperCase() });
    if (!booking) {
      return errorResponse(res, 'Booking ticket not found', 404);
    }

    const notePayload = {
      note,
      author: req.user._id,
      authorName: req.user.name,
      createdAt: new Date(),
    };

    if (isInternal) {
      booking.internalNotes.push(notePayload);
    } else {
      booking.customerNotes.push(notePayload);
    }

    await booking.save();
    return successResponse(res, 'Note added successfully', { booking });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. QUOTATIONS MANAGEMENT
// ==========================================
export const createQuotation = async (req, res, next) => {
  try {
    const {
      ticketId,
      diagnosis,
      items,
      labourCharges = 0,
      sparePartCharges = 0,
      additionalCharges = 0,
      discount = 0,
      taxRate = 18,
      validityDays = 7,
      termsAndConditions,
    } = req.body;

    const booking = await RepairBooking.findOne({ ticketId: ticketId.trim().toUpperCase() })
      .populate('customer');

    if (!booking) {
      return errorResponse(res, 'Repair booking not found', 404);
    }

    const subtotal = Number(labourCharges) + Number(sparePartCharges) + Number(additionalCharges) - Number(discount);
    const taxAmount = Math.round((subtotal * Number(taxRate)) / 100);
    const totalAmount = Math.max(0, subtotal + taxAmount);

    const quotationNumber = await generateQuotationNumber();
    const expiresAt = new Date(Date.now() + Number(validityDays) * 24 * 60 * 60 * 1000);

    const quotation = await Quotation.create({
      quotationNumber,
      booking: booking._id,
      ticketId: booking.ticketId,
      customer: booking.customer._id,
      diagnosis,
      items: items || [],
      labourCharges,
      sparePartCharges,
      additionalCharges,
      discount,
      taxRate,
      taxAmount,
      totalAmount,
      validityDays,
      expiresAt,
      termsAndConditions: termsAndConditions || undefined,
      createdBy: req.user._id,
    });

    // Advance booking status to AWAITING_CUSTOMER_APPROVAL
    const prevStatus = booking.status;
    booking.status = REPAIR_STATUS.AWAITING_CUSTOMER_APPROVAL;
    await booking.save();

    await RepairStatusHistory.create({
      booking: booking._id,
      ticketId: booking.ticketId,
      fromStatus: prevStatus,
      toStatus: REPAIR_STATUS.AWAITING_CUSTOMER_APPROVAL,
      note: `Quotation ${quotationNumber} issued for ₹${totalAmount.toLocaleString('en-IN')}`,
      changedBy: req.user._id,
      changedByName: req.user.name,
    });

    emitStatusUpdate(booking.ticketId, {
      ticketId: booking.ticketId,
      status: REPAIR_STATUS.AWAITING_CUSTOMER_APPROVAL,
      customerId: booking.customer._id,
      note: `Quotation ${quotationNumber} issued for ₹${totalAmount.toLocaleString('en-IN')}`,
    });

    sendQuotationEmail(quotation, booking.customer, booking.ticketId).catch(() => {});

    return successResponse(res, 'Quotation created successfully', { quotation }, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllQuotations = async (req, res, next) => {
  try {
    const quotations = await Quotation.find()
      .populate('customer', 'name email phone')
      .populate('booking', 'device ticketId status')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Quotations retrieved', { quotations });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. INVOICES & PAYMENTS MANAGEMENT
// ==========================================
export const createInvoice = async (req, res, next) => {
  try {
    const {
      ticketId,
      quotationId,
      items,
      labourCharges = 0,
      sparePartCharges = 0,
      additionalCharges = 0,
      discount = 0,
      taxRate = 18,
      terms,
    } = req.body;

    const booking = await RepairBooking.findOne({ ticketId: ticketId.trim().toUpperCase() })
      .populate('customer');

    if (!booking) {
      return errorResponse(res, 'Repair booking not found', 404);
    }

    const subtotal = Number(labourCharges) + Number(sparePartCharges) + Number(additionalCharges) - Number(discount);
    const taxAmount = Math.round((subtotal * Number(taxRate)) / 100);
    const totalAmount = Math.max(0, subtotal + taxAmount);

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      booking: booking._id,
      ticketId: booking.ticketId,
      quotation: quotationId || null,
      customer: booking.customer._id,
      billingDetails: {
        name: booking.customer.name,
        email: booking.customer.email,
        phone: booking.customer.phone,
        address: `${booking.doorstepAddress?.street || ''} ${booking.doorstepAddress?.city || 'Mangaluru'}, Karnataka`,
      },
      items: items || [],
      labourCharges,
      sparePartCharges,
      additionalCharges,
      discount,
      taxRate,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      paymentStatus: PAYMENT_STATUS.UNPAID,
      terms: terms || undefined,
      createdBy: req.user._id,
    });

    sendInvoiceEmail(invoice, booking.customer).catch(() => {});

    return successResponse(res, 'Invoice generated successfully', { invoice }, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer', 'name email phone')
      .populate('booking', 'device ticketId status')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Invoices retrieved', { invoices });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const { amount, method, transactionId, notes } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, 'Valid payment amount is required', 400);
    }

    const invoice = await Invoice.findById(invoiceId).populate('customer');
    if (!invoice) {
      return errorResponse(res, 'Invoice not found', 404);
    }

    const paymentAmount = Number(amount);
    invoice.amountPaid = (invoice.amountPaid || 0) + paymentAmount;
    invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.amountPaid);

    if (invoice.balanceDue === 0) {
      invoice.paymentStatus = PAYMENT_STATUS.PAID;
      invoice.paidAt = new Date();
    } else {
      invoice.paymentStatus = PAYMENT_STATUS.PARTIALLY_PAID;
    }

    if (method) invoice.paymentMethod = method;
    if (transactionId) invoice.paymentReference = transactionId;

    await invoice.save();

    // Create payment transaction record
    const payment = await Payment.create({
      invoice: invoice._id,
      customer: invoice.customer._id,
      amount: paymentAmount,
      method: method || 'Cash',
      status: PAYMENT_STATUS.PAID,
      transactionId: transactionId || '',
      notes: notes || '',
      recordedBy: req.user._id,
    });

    return successResponse(res, 'Payment recorded successfully', { invoice, payment });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. INVENTORY MANAGEMENT
// ==========================================
export const getInventory = async (req, res, next) => {
  try {
    const { search, category, lowStockOnly } = req.query;
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (lowStockOnly === 'true') {
      query.$expr = { $lte: ['$quantity', '$reorderThreshold'] };
    }

    const items = await InventoryItem.find(query).sort({ quantity: 1, name: 1 });
    return successResponse(res, 'Inventory items retrieved', { items });
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req, res, next) => {
  try {
    const { name, sku, category, supplier, purchasePrice, sellingPrice, quantity, reorderThreshold, location } = req.body;

    if (!name || !sku || !purchasePrice || !sellingPrice) {
      return errorResponse(res, 'Name, SKU, purchase price, and selling price are required', 400);
    }

    const item = await InventoryItem.create({
      name,
      sku: sku.trim().toUpperCase(),
      category: category || 'Spare Parts',
      supplier: supplier || 'Authorized Distributor',
      purchasePrice,
      sellingPrice,
      quantity: quantity || 0,
      reorderThreshold: reorderThreshold || 3,
      location: location || 'Shelf A-1, Vamanjoor Service Center',
    });

    if (quantity > 0) {
      await InventoryMovement.create({
        item: item._id,
        movementType: 'PURCHASE_IN',
        quantity,
        previousQuantity: 0,
        newQuantity: quantity,
        notes: 'Initial stock intake upon item creation',
        performedBy: req.user._id,
      });
    }

    return successResponse(res, 'Inventory item created successfully', { item }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await InventoryItem.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!item) {
      return errorResponse(res, 'Inventory item not found', 404);
    }

    return successResponse(res, 'Inventory item updated', { item });
  } catch (error) {
    next(error);
  }
};

export const recordStockMovement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { movementType, quantity, ticketId, notes } = req.body;

    if (!quantity || !movementType) {
      return errorResponse(res, 'Movement type and quantity are required', 400);
    }

    const item = await InventoryItem.findById(id);
    if (!item) {
      return errorResponse(res, 'Item not found', 404);
    }

    const qtyChange = Number(quantity);
    const prevQty = item.quantity;
    let newQty = prevQty;

    if (['PURCHASE_IN', 'REPAIR_RETURNED'].includes(movementType)) {
      newQty = prevQty + Math.abs(qtyChange);
    } else if (['REPAIR_CONSUMED', 'DAMAGED', 'ADJUSTMENT'].includes(movementType)) {
      if (prevQty < Math.abs(qtyChange)) {
        return errorResponse(res, `Insufficient stock! Current available is ${prevQty}, cannot deduct ${Math.abs(qtyChange)}`, 400);
      }
      newQty = prevQty - Math.abs(qtyChange);
    }

    item.quantity = newQty;
    await item.save();

    const movement = await InventoryMovement.create({
      item: item._id,
      movementType,
      quantity: qtyChange,
      previousQuantity: prevQty,
      newQuantity: newQty,
      ticketId: ticketId || '',
      notes: notes || '',
      performedBy: req.user._id,
    });

    return successResponse(res, 'Stock movement recorded successfully', { item, movement });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. TECHNICIAN & CUSTOMER MANAGEMENT
// ==========================================
export const getTechnicians = async (req, res, next) => {
  try {
    const technicians = await User.find({ role: ROLES.TECHNICIAN }).select('-password');
    const techProfiles = await TechnicianProfile.find().populate('user', 'name email phone isActive');

    return successResponse(res, 'Technicians retrieved', { technicians, techProfiles });
  } catch (error) {
    next(error);
  }
};

export const createTechnician = async (req, res, next) => {
  try {
    const { name, email, phone, password, specialization, experienceYears } = req.body;

    if (!name || !email || !phone || !password) {
      return errorResponse(res, 'All fields are required', 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return errorResponse(res, 'User with this email already exists', 409);
    }

    const techUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: ROLES.TECHNICIAN,
      isVerified: true,
    });

    const profile = await TechnicianProfile.create({
      user: techUser._id,
      specialization: specialization ? specialization.split(',') : ['Hardware Diagnostics', 'Chip-Level Repairs'],
      experienceYears: experienceYears || 3,
    });

    return successResponse(res, 'Technician created successfully', { technician: techUser, profile }, 201);
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: ROLES.CUSTOMER })
      .select('-password')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Customers retrieved', { customers });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. BUSINESS SETTINGS
// ==========================================
export const getBusinessSettings = async (req, res, next) => {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = await BusinessSettings.create({});
    }
    return successResponse(res, 'Business settings fetched', { settings });
  } catch (error) {
    next(error);
  }
};

export const updateBusinessSettings = async (req, res, next) => {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = await BusinessSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    return successResponse(res, 'Business settings updated', { settings });
  } catch (error) {
    next(error);
  }
};
