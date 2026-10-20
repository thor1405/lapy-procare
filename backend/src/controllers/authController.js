import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { RefreshSession } from '../models/RefreshSession.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { ROLES } from '../config/constants.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { logger } from '../config/logger.js';

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET || 'lapy_procare_super_secure_jwt_access_secret_key_2026_xyz987',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'lapy_procare_super_secure_jwt_refresh_secret_key_2026_abc123',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export const register = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return errorResponse(
        res,
        'Database connection is currently offline. Please check your MONGO_URI in .env (ensure your Atlas cluster subdomain is correct, e.g. cluster0.abcde.mongodb.net, and Network Access allows 0.0.0.0/0).',
        503
      );
    }

    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password) {
      return errorResponse(res, 'Please provide all required registration fields', 400);
    }

    if (password !== confirmPassword) {
      return errorResponse(res, 'Passwords do not match', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists', 409);
    }

    // Role is ALWAYS CUSTOMER upon public registration. Admin must be provisioned or promoted.
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: ROLES.CUSTOMER,
      isVerified: true,
    });

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh session
    await RefreshSession.create({
      user: user._id,
      token: refreshToken,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setTokenCookies(res, accessToken, refreshToken);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
    };

    return successResponse(res, 'Registration successful', { user: safeUser, accessToken }, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return errorResponse(
        res,
        'Database connection is currently offline. Please check your MONGO_URI in .env (ensure your Atlas cluster subdomain is correct, e.g. cluster0.abcde.mongodb.net, and Network Access allows 0.0.0.0/0).',
        503
      );
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account has been deactivated. Please contact support.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh session
    await RefreshSession.create({
      user: user._id,
      token: refreshToken,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setTokenCookies(res, accessToken, refreshToken);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
    };

    return successResponse(res, 'Login successful', { user: safeUser, accessToken });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token not found. Please log in again.', 401);
    }

    const session = await RefreshSession.findOne({ token: refreshToken, isRevoked: false });
    if (!session) {
      return errorResponse(res, 'Invalid or expired session. Please log in again.', 401);
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'lapy_procare_super_secure_jwt_refresh_secret_key_2026_abc123'
    );

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return errorResponse(res, 'User inactive or not found.', 401);
    }

    // Refresh token rotation: revoke previous session and issue new pair
    session.isRevoked = true;
    await session.save();

    const tokens = generateTokens(user);

    await RefreshSession.create({
      user: user._id,
      token: tokens.refreshToken,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    return successResponse(res, 'Token refreshed successfully', { accessToken: tokens.accessToken });
  } catch (error) {
    return errorResponse(res, 'Session expired or invalid. Please log in again.', 401);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      await RefreshSession.updateMany({ token: refreshToken }, { isRevoked: true });
    }

    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    return successResponse(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, 'User profile fetched', { user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) {
      user.address = {
        ...user.address,
        ...address,
      };
    }

    await user.save();
    return successResponse(res, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Please provide both current and new password', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters', 400);
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    // Revoke all prior refresh sessions for security
    await RefreshSession.updateMany({ user: user._id }, { isRevoked: true });

    return successResponse(res, 'Password changed successfully. Please log in again.');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Please provide your email address', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't disclose whether user exists
      return successResponse(res, 'If that email is registered, a password reset link has been sent.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await PasswordResetToken.create({
      user: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await sendPasswordResetEmail(user, resetToken);

    return successResponse(res, 'If that email is registered, a password reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return errorResponse(res, 'Token and new password are required', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    const resetDoc = await PasswordResetToken.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetDoc) {
      return errorResponse(res, 'Password reset link is invalid or has expired', 400);
    }

    const user = await User.findById(resetDoc.user);
    if (!user) {
      return errorResponse(res, 'User associated with token not found', 404);
    }

    user.password = newPassword;
    await user.save();

    resetDoc.isUsed = true;
    await resetDoc.save();

    // Invalidate sessions
    await RefreshSession.updateMany({ user: user._id }, { isRevoked: true });

    return successResponse(res, 'Password reset successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};
