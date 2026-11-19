import { z } from 'zod';

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Please provide a valid email address').max(150),
  phone: z.string().trim().min(8, 'Phone number must be at least 8 digits').max(20, 'Phone number is too long'),
  subject: z.string().trim().max(200).optional().default('General Inquiry'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(3000, 'Message cannot exceed 3000 characters'),
});
