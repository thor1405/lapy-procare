import { Invoice } from '../models/Invoice.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { generateDocumentPDF } from '../services/pdfService.js';

export const getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ customer: req.user._id })
      .populate('booking', 'device ticketId status')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Invoices fetched', { invoices });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate('booking')
      .populate('customer', 'name email phone');

    if (!invoice) {
      return errorResponse(res, 'Invoice not found', 404);
    }

    if (req.user.role === 'CUSTOMER' && invoice.customer._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    return successResponse(res, 'Invoice fetched', { invoice });
  } catch (error) {
    next(error);
  }
};

export const downloadInvoicePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate('customer');

    if (!invoice) {
      return errorResponse(res, 'Invoice not found', 404);
    }

    if (req.user.role === 'CUSTOMER' && invoice.customer._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);

    generateDocumentPDF('INVOICE', invoice, res);
  } catch (error) {
    next(error);
  }
};
