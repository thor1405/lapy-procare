import { z } from 'zod';

export const createBookingSchema = z.object({
  device: z.object({
    deviceType: z.string().trim().min(1, 'Device type is required').max(50),
    brand: z.string().trim().min(1, 'Brand is required').max(50),
    model: z.string().trim().min(1, 'Model is required').max(100),
    serialNumber: z.string().trim().max(100).optional().default(''),
    passcode: z.string().trim().max(50).optional().default(''),
    accessories: z.array(z.string().max(100)).optional().default([]),
  }),
  problem: z.object({
    category: z.string().trim().min(1, 'Problem category is required').max(100),
    description: z.string().trim().min(1, 'Problem description is required').max(2000),
  }),
  photos: z.array(z.string().max(500)).optional().default([]),
  servicePreference: z.string().max(50).optional().default('Carry-in to Service Center'),
  doorstepAddress: z
    .object({
      street: z.string().max(200).optional().default(''),
      landmark: z.string().max(100).optional().default(''),
      city: z.string().max(100).optional().default('Mangaluru'),
      postalCode: z.string().max(20).optional().default('575028'),
    })
    .optional()
    .default({}),
  appointment: z.object({
    date: z.string().min(1, 'Appointment date is required'),
    timeSlot: z.string().trim().min(1, 'Time slot is required').max(100),
  }),
});

export const slotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
});
