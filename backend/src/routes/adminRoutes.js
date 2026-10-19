import { Router } from 'express';
import {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  assignTechnician,
  addBookingNote,
  createQuotation,
  getAllQuotations,
  createInvoice,
  getAllInvoices,
  recordPayment,
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  recordStockMovement,
  getTechnicians,
  createTechnician,
  getCustomers,
  getBusinessSettings,
  updateBusinessSettings,
} from '../controllers/adminController.js';
import { getInquiries, updateInquiryStatus } from '../controllers/contactController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// Strictly restrict entire admin router to ADMIN role
router.use(authenticate, authorize(ROLES.ADMIN));

// Analytics
router.get('/dashboard', getDashboardStats);

// Bookings
router.get('/bookings', getAllBookings);
router.patch('/bookings/:ticketId/status', updateBookingStatus);
router.post('/bookings/:ticketId/assign', assignTechnician);
router.post('/bookings/:ticketId/notes', addBookingNote);

// Quotations
router.get('/quotations', getAllQuotations);
router.post('/quotations', createQuotation);

// Invoices & Payments
router.get('/invoices', getAllInvoices);
router.post('/invoices', createInvoice);
router.post('/invoices/:invoiceId/payments', recordPayment);

// Inventory
router.get('/inventory', getInventory);
router.post('/inventory', createInventoryItem);
router.patch('/inventory/:id', updateInventoryItem);
router.post('/inventory/:id/movement', recordStockMovement);

// Technicians & Customers
router.get('/technicians', getTechnicians);
router.post('/technicians', createTechnician);
router.get('/customers', getCustomers);

// Inquiries & Settings
router.get('/inquiries', getInquiries);
router.patch('/inquiries/:id', updateInquiryStatus);
router.get('/settings', getBusinessSettings);
router.patch('/settings', updateBusinessSettings);

export default router;
