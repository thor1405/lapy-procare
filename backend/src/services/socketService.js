import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      // Allow anonymous connection for public tracking room
      socket.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'lapy_procare_super_secure_jwt_access_secret_key_2026_xyz987'
      );
      socket.user = decoded;
      next();
    } catch (err) {
      // Invalid token, continue as anonymous
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id} (User: ${socket.user ? socket.user.id : 'Guest'})`);

    // Authenticated users join their personal room
    if (socket.user && socket.user.id) {
      socket.join(`user_${socket.user.id}`);
      if (socket.user.role === 'ADMIN') {
        socket.join('admin_channel');
      }
      if (socket.user.role === 'TECHNICIAN') {
        socket.join(`tech_${socket.user.id}`);
      }
    }

    // Join a specific repair tracking room
    socket.on('join_repair_room', (ticketId) => {
      if (ticketId) {
        const cleanTicket = String(ticketId).trim().toUpperCase();
        socket.join(`repair_${cleanTicket}`);
        logger.debug(`Socket ${socket.id} joined room repair_${cleanTicket}`);
      }
    });

    socket.on('leave_repair_room', (ticketId) => {
      if (ticketId) {
        const cleanTicket = String(ticketId).trim().toUpperCase();
        socket.leave(`repair_${cleanTicket}`);
      }
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

/**
 * Emit real-time repair status change
 */
export const emitStatusUpdate = (ticketId, payload) => {
  if (!io) return;
  const cleanTicket = String(ticketId).trim().toUpperCase();
  // Emit to anyone watching this specific repair ticket room
  io.to(`repair_${cleanTicket}`).emit('status_changed', payload);
  // Emit to customer's personal user room if customerId is present
  if (payload.customerId) {
    io.to(`user_${payload.customerId}`).emit('repair_updated', payload);
  }
  // Emit to admin dashboard
  io.to('admin_channel').emit('admin_repair_event', payload);
};

/**
 * Emit new booking event to admin dashboard
 */
export const emitNewBooking = (booking) => {
  if (!io) return;
  io.to('admin_channel').emit('new_booking_created', booking);
};

/**
 * Emit notification to specific user
 */
export const emitUserNotification = (userId, notification) => {
  if (!io) return;
  io.to(`user_${userId}`).emit('notification_received', notification);
};
