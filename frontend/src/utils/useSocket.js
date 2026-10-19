import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

export const useSocket = (ticketId = null, onStatusChange = null) => {
  const socketRef = useRef(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (ticketId) {
        socket.emit('join_repair_room', ticketId);
      }
    });

    if (onStatusChange) {
      socket.on('status_changed', (data) => {
        onStatusChange(data);
      });
      socket.on('repair_updated', (data) => {
        onStatusChange(data);
      });
    }

    return () => {
      if (ticketId) {
        socket.emit('leave_repair_room', ticketId);
      }
      socket.disconnect();
    };
  }, [ticketId, token]);

  return socketRef.current;
};
