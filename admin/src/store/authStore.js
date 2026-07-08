import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('admin_token'),
  isAuthenticated: !!localStorage.getItem('admin_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data;
      
      if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
        throw new Error('Unauthorized access');
      }

      localStorage.setItem('admin_token', accessToken);
      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  checkAuth: async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isAuthenticated: true }); 
    } catch (error) {
      localStorage.removeItem('admin_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  }
}));

export default useAuthStore;
