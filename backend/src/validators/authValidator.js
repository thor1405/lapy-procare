import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
    email: z.string().trim().email('Please provide a valid email address').max(150),
    phone: z.string().trim().min(8, 'Phone number must be at least 8 digits').max(20, 'Phone number is too long'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters').max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required').max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(100),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').max(100),
});
