import { create } from 'zustand';
import api from '../api/client';

const initialUser = (() => {
  try {
    const saved = localStorage.getItem('lapy_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
})();

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  token: localStorage.getItem('lapy_access_token') || null,
  isAuthenticated: !!localStorage.getItem('lapy_access_token'),
  isLoading: false,

  setUser: (user, token) => {
    if (token) localStorage.setItem('lapy_access_token', token);
    if (user) localStorage.setItem('lapy_user', JSON.stringify(user));
    set({ user, token: token || get().token, isAuthenticated: true });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data.data;
      localStorage.setItem('lapy_access_token', accessToken);
      localStorage.setItem('lapy_user', JSON.stringify(user));
      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', formData);
      const { user, accessToken } = res.data.data;
      localStorage.setItem('lapy_access_token', accessToken);
      localStorage.setItem('lapy_user', JSON.stringify(user));
      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Registration failed.';
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('lapy_access_token');
      localStorage.removeItem('lapy_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('lapy_access_token');
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      const user = res.data.data.user;
      localStorage.setItem('lapy_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (e) {
      // token may be stale or handled by interceptor
    }
  },

  updateProfile: (updatedData) => {
    const current = get().user;
    const merged = { ...current, ...updatedData };
    localStorage.setItem('lapy_user', JSON.stringify(merged));
    set({ user: merged });
  },
}));
