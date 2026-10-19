import { ContactInquiry } from '../models/ContactInquiry.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const submitInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return errorResponse(res, 'Please fill in all contact form fields', 400);
    }

    const inquiry = await ContactInquiry.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return successResponse(res, 'Thank you! Your inquiry has been received. Our team will contact you shortly.', { inquiry }, 201);
  } catch (error) {
    next(error);
  }
};

export const getInquiries = async (req, res, next) => {
  try {
    const inquiries = await ContactInquiry.find().sort({ createdAt: -1 });
    return successResponse(res, 'Inquiries fetched', { inquiries });
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const inquiry = await ContactInquiry.findById(id);
    if (!inquiry) {
      return errorResponse(res, 'Inquiry not found', 404);
    }

    if (status) inquiry.status = status;
    if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;

    await inquiry.save();
    return successResponse(res, 'Inquiry updated', { inquiry });
  } catch (error) {
    next(error);
  }
};
