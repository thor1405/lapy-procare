import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      // Or check HTTP-only cookie
      token = req.cookies.accessToken;
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'lapy_procare_super_secure_jwt_access_secret_key_2026_xyz987'
    );

    // Fetch user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return errorResponse(res, 'User account not found or deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session token expired. Please refresh or re-login.', 401);
    }
    return errorResponse(res, 'Invalid authentication token.', 401);
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, `Forbidden: Access restricted to [${roles.join(', ')}] role`, 403);
    }

    next();
  };
};
